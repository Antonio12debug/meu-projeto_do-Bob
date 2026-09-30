#!/usr/bin/env node
/**
 * DIO MCP Server
 * Exposes three tools: trilha, certificado, desafio
 *
 * Transports supported:
 *   - stdio   (default)   — spawned by Bob as a child process
pts *   - http    (opt-in)    — Streamable HTTP (MCP spec) for remote / API-key / SSO access
 *                           Set MCP_TRANSPORT=http   (default port 3456)
 *                           Set MCP_PORT=<n>          to override port
 *                           Set MCP_API_KEY=<key>     to require Bearer auth on every request
 *
 * Usage (stdio):  node build/index.js
 * Usage (http):   MCP_TRANSPORT=http MCP_API_KEY=secret node build/index.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Resolve data directory relative to the workspace root
// MCP/src/ → MCP/ → workspace root → dio_explore/data/
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..");
const TRILHAS_PATH = path.join(WORKSPACE_ROOT, "dio_explore", "data", "trilhas_dio.json");
const CERTIFICADOS_DIR = path.join(WORKSPACE_ROOT, "dio_explore", "docs", "certificados-emetidos");

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

interface TrilhaRecord {
  nome?: string;
  tecnologia?: string;
  nivel?: string;
  numero_de_modulos?: number;
  xp_total?: number;
  acesso_vitalicio?: boolean;
  badges?: string[];
  promocao?: {
    ativa?: boolean;
    desconto_percent?: number;
    validade?: string;
  };
  lives?: Array<{ titulo?: string; data?: string; hora?: string }>;
}

function loadTrilhas(): TrilhaRecord[] {
  if (!fs.existsSync(TRILHAS_PATH)) return [];
  const raw = fs.readFileSync(TRILHAS_PATH, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed as TrilhaRecord[];
  const obj = parsed as Record<string, unknown>;
  return Array.isArray(obj["trilhas"]) ? (obj["trilhas"] as TrilhaRecord[]) : [];
}

function findTrilha(query: string): TrilhaRecord | null {
  const q = query.toLowerCase();
  return (
    loadTrilhas().find(
      (t) =>
        t.nome?.toLowerCase().includes(q) ||
        t.tecnologia?.toLowerCase().includes(q)
    ) ?? null
  );
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateCertCode(): string {
  const year = new Date().getFullYear();
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `DIO-${year}-${digits}`;
}

function currentDateExtensive(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new McpServer({ name: "dio-mcp-server", version: "0.1.0" });

// ── Tool: trilha ────────────────────────────────────────────────────────────
server.tool(
  "trilha",
  "Consulta uma trilha de aprendizado da DIO pelo nome da tecnologia e retorna o plano de estudos completo.",
  {
    tecnologia: z
      .string()
      .describe('Nome ou parte do nome da tecnologia. Ex: "Python", "React", "Java"'),
  },
  async ({ tecnologia }) => {
    const trilha = findTrilha(tecnologia);

    if (!trilha) {
      const available = loadTrilhas()
        .map((t) => t.tecnologia ?? t.nome ?? "?")
        .join(", ");
      return {
        content: [
          {
            type: "text" as const,
            text: `Trilha não encontrada para "${tecnologia}".\nTecnologias disponíveis: ${available || "(nenhuma — arquivo não encontrado)"}`,
          },
        ],
        isError: true,
      };
    }

    const promo = trilha.promocao;
    const lives = trilha.lives ?? [];
    const badges = (trilha.badges ?? []).map((b) => `- 🏅 ${b}`).join("\n");

    const livesTable =
      lives.length > 0
        ? `| Título | Data | Hora |\n|---|---|---|\n` +
          lives.map((l) => `| ${l.titulo ?? "-"} | ${l.data ?? "-"} | ${l.hora ?? "-"} |`).join("\n")
        : "_Sem lives agendadas._";

    const text = `## 📚 Plano de Estudos — ${trilha.nome ?? trilha.tecnologia}

| Campo | Valor |
|---|---|
| 🛠️ Tecnologia | ${trilha.tecnologia ?? "-"} |
| 🎯 Nível | ${trilha.nivel ?? "-"} |
| 📦 Módulos | ${trilha.numero_de_modulos ?? "-"} |
| ⭐ XP Total | ${trilha.xp_total ?? "-"} XP |
| ♾️ Acesso Vitalício | ${trilha.acesso_vitalicio ? "Sim" : "Não"} |

### 🏅 Badges Disponíveis
${badges || "_Sem badges._"}

### 🎟️ Promoção
- **Ativa:** ${promo?.ativa ? "Sim" : "Não"}
- **Desconto:** ${promo?.desconto_percent ?? 0}%
- **Válida até:** ${promo?.validade ?? "N/A"}

### 📡 Lives ao Vivo
${livesTable}`;

    return { content: [{ type: "text" as const, text }] };
  }
);

// ── Tool: certificado ───────────────────────────────────────────────────────
server.tool(
  "certificado",
  "Gera e salva um certificado de conclusão fictício para um usuário e trilha DIO.",
  {
    nome_usuario: z.string().describe('Nome completo do usuário. Ex: "Antonio Silva"'),
    trilha: z
      .string()
      .describe('Nome ou tecnologia da trilha concluída. Ex: "Python"'),
  },
  async ({ nome_usuario, trilha }) => {
    const trilhaData = findTrilha(trilha);

    const nomeTrilha = trilhaData?.nome ?? trilhaData?.tecnologia ?? trilha;
    const tecnologia = trilhaData?.tecnologia ?? trilha;
    const nivel = trilhaData?.nivel ?? "Não informado";
    const xp = trilhaData?.xp_total ?? 0;
    const badges = (trilhaData?.badges ?? []).map((b) => `- 🏅 ${b}`).join("\n");
    const code = generateCertCode();
    const date = currentDateExtensive();

    const cert = `# 🎓 Certificado de Conclusão

> *A Digital Innovation One certifica que*

## ${nome_usuario}

concluiu com êxito a trilha de aprendizado:

---

### 🏆 ${nomeTrilha}

| Campo | Detalhe |
|---|---|
| 🛠️ Tecnologia | ${tecnologia} |
| 🎯 Nível | ${nivel} |
| ⭐ XP Conquistado | ${xp} XP |
| 📅 Data de Emissão | ${date} |
| 🔐 Código do Certificado | ${code} |

---

### 🏅 Badges Conquistadas
${badges || "_Nenhuma badge registrada._"}

---

> *"A aprendizagem é a única coisa que a mente nunca se cansa, nunca tem medo e nunca se arrepende."*
> — **Leonardo da Vinci**

---

**Digital Innovation One** · https://web.dio.me
*Este é um certificado fictício gerado para fins de estudo.*
`;

    try {
      fs.mkdirSync(CERTIFICADOS_DIR, { recursive: true });
      const filename = `${slugify(nome_usuario)}-${slugify(nomeTrilha)}.md`;
      const filePath = path.join(CERTIFICADOS_DIR, filename);
      fs.writeFileSync(filePath, cert, "utf8");
      return {
        content: [
          {
            type: "text" as const,
            text: `${cert}\n\n---\n✅ Certificado salvo em: \`${filePath}\``,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `${cert}\n\n⚠️ Não foi possível salvar o arquivo: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  }
);

// ── Tool: desafio ───────────────────────────────────────────────────────────
server.tool(
  "desafio",
  "Gera um desafio de código original baseado na tecnologia e nível escolhidos.",
  {
    tecnologia: z
      .string()
      .describe('Linguagem ou framework. Ex: "Python", "JavaScript", "Java"'),
    nivel: z
      .enum(["Iniciante", "Intermediário", "Avançado"])
      .default("Iniciante")
      .describe("Nível de dificuldade do desafio"),
  },
  async ({ tecnologia, nivel }) => {
    const xpMap: Record<string, number> = {
      Iniciante: 500,
      Intermediário: 1000,
      Avançado: 2000,
    };
    const tempoMap: Record<string, string> = {
      Iniciante: "15 minutos",
      Intermediário: "30 minutos",
      Avançado: "60 minutos",
    };

    const xp = xpMap[nivel] ?? 500;
    const tempo = tempoMap[nivel] ?? "15 minutos";

    const text = `## ⚔️ Desafio de Código — ${tecnologia} · ${nivel}

### 📋 Enunciado
Implemente uma função que receba uma lista de inteiros e retorne os N maiores elementos em ordem decrescente.

### 📥 Entrada
- Uma lista de inteiros \`nums\`
- Um inteiro \`n\` (quantidade de elementos a retornar)

Exemplo: \`nums = [3, 1, 4, 1, 5, 9, 2, 6]\`, \`n = 3\`

### 📤 Saída
Lista com os N maiores elementos em ordem decrescente.

Exemplo: \`[9, 6, 5]\`

### 💡 Dicas
- Considere ordenar a lista antes de fatiar.
- Em ${tecnologia}, verifique se há funções nativas de ordenação.
- Trate o caso em que \`n > len(nums)\`.

### 🧪 Casos de Teste
| Entrada | Saída Esperada |
|---|---|
| \`[3,1,4,1,5,9,2,6]\`, n=3 | \`[9,6,5]\` |
| \`[1,2,3]\`, n=5 | \`[3,2,1]\` |
| \`[]\`, n=2 | \`[]\` |

### ⏱️ Tempo Sugerido
${tempo}

### 🏅 XP ao Completar
${xp} XP`;

    return { content: [{ type: "text" as const, text }] };
  }
);

// ---------------------------------------------------------------------------
// Transport selection
// ---------------------------------------------------------------------------
const transport = (process.env["MCP_TRANSPORT"] ?? "stdio").toLowerCase();

if (transport === "http") {
  const { default: express } = await import("express");
  const { default: cors } = await import("cors");
  const { StreamableHTTPServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/streamableHttp.js"
  );

  const PORT = Number(process.env["MCP_PORT"] ?? 3456);
  const API_KEY = process.env["MCP_API_KEY"];

  const app = express();
  app.use(cors());
  app.use(express.json());

  // ── Bearer auth middleware ────────────────────────────────────────────────
  if (API_KEY) {
    app.use((_req, res, next) => {
      const authHeader = _req.headers["authorization"] ?? "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      if (token !== API_KEY) {
        res.status(401).json({ error: "Unauthorized — invalid or missing API key" });
        return;
      }
      next();
    });
    console.error("[auth] API key protection enabled");
  } else {
    console.error("[auth] WARNING: MCP_API_KEY is not set — server is publicly accessible");
  }

  // ── Health check ──────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "dio-mcp-server", version: "0.1.0" });
  });

  // ── MCP Streamable HTTP endpoint ─────────────────────────────────────────
  app.all("/mcp", async (req, res) => {
    const httpTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });
    await server.connect(httpTransport);
    await httpTransport.handleRequest(req, res, req.body);
  });

  app.listen(PORT, () => {
    console.error(`[http] DIO MCP Server listening on http://0.0.0.0:${PORT}`);
    console.error(`[http] POST/GET /mcp   — MCP Streamable HTTP endpoint`);
    console.error(`[http] GET      /health — health check`);
  });
} else {
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
  console.error("[stdio] DIO MCP Server running on stdio");
}
