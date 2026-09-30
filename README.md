<div align="center">

# ?? DIO Learning Platform

**Plataforma educacional simulada construída com IBM Bob + MCP Server**

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.31-7C3AED?style=flat-square)](https://github.com/modelcontextprotocol/sdk)
[![Testes](https://img.shields.io/badge/Testes-49%2F49_100%25-22C55E?style=flat-square)](#-testes)
[![GitHub](https://img.shields.io/badge/GitHub-meu--projeto__do--Bob-181717?style=flat-square&logo=github)](https://github.com/Antonio12debug/meu-projeto_do-Bob)

> Projeto de aprendizado que demonstra como usar **IBM Bob** como co-piloto de desenvolvimento
> para criar Skills, Commands e um servidor MCP acessível via API.

</div>

---

## ?? Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Como Usar](#-como-usar)
  - [Via Bob (Slash Commands)](#1--via-bob--slash-commands)
  - [Via Bob (Chat livre)](#2--via-bob--chat-livre)
  - [Via MCP Server HTTP (API)](#3--via-mcp-server-http--api)
- [MCP Server](#-mcp-server)
  - [Instalação e Build](#instalação-e-build)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Endpoints](#endpoints)
  - [Autenticação](#autenticação-bearer-token--sso)
- [Dados — trilhas_dio.json](#-dados--trilhas_diojson)
- [Testes](#-testes)
- [Git e Histórico](#-git-e-histórico)
- [Contribuindo](#-contribuindo)
- [Insights para Profissionais](#-insights-para-profissionais)

---

## ?? Visão Geral

Este projeto é uma **plataforma educacional simulada**, inspirada na [DIO (Digital Innovation One)](https://web.dio.me), construída inteiramente com o assistente de IA **IBM Bob**. Demonstra como desenvolvedores podem usar IA como co-piloto de engenharia — criando dados estruturados, Skills, Commands, testes automatizados e um servidor MCP acessível por API.

```
Usuário --? /trilha Python       --? Bob Command  --? lê trilhas_dio.json --? plano de estudos
        --? "gera certificado…"  --? Bob Skill    --? gera .md + salva
        --? POST /mcp (API)      --? MCP Server   --? tools: trilha | certificado | desafio
```

---

## ?? Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| IA / Co-piloto | IBM Bob |
| Servidor MCP | Node.js 22 + TypeScript 5.5 |
| Protocolo | [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) v1.31 |
| Validação de schema | [Zod](https://zod.dev) v3 |
| HTTP Server | Express 4 + CORS |
| Testes | JavaScript puro (sem framework) |
| Versionamento | Git + GitHub |
| Plataforma | Windows 10 / PowerShell |

---

## ?? Estrutura do Projeto

```
meu-projeto_do-Bob/
+-- .bob/                              # Configurações do IBM Bob
¦   +-- commands/                      # Slash commands
¦   ¦   +-- trilha.md                  # /trilha <tecnologia>
¦   ¦   +-- certificado.md             # /certificado <nome>, <trilha>
¦   ¦   +-- desafio.md                 # /desafio <tecnologia> <nível>
¦   +-- skills/                        # Skills ativáveis pelo Bob
¦   ¦   +-- trilha/SKILL.md
¦   ¦   +-- certificado/SKILL.md
¦   ¦   +-- desafio/SKILL.md
¦   +-- mcp.json                       # Registro do MCP Server no Bob
¦
+-- MCP/                               # Servidor MCP (Node.js + TypeScript)
¦   +-- src/
¦   ¦   +-- index.ts                   # 3 ferramentas + 2 transportes
¦   +-- build/                         # Saída compilada [gerado pelo build]
¦   +-- package.json
¦   +-- tsconfig.json
¦   +-- README.md                      # Documentação específica do servidor
¦
+-- dio_explore/                       # Dados, documentos e testes
¦   +-- data/
¦   ¦   +-- trilhas_dio.json           # 30 trilhas de aprendizado
¦   +-- docs/
¦   ¦   +-- certificados-emetidos/     # Certificados gerados em Markdown
¦   +-- tests/
¦       +-- test_commands.js           # Suite com 49 testes unitários
¦       +-- resultado_testes.txt       # Relatório (100% cobertura)
¦
+-- .bobignore                         # Arquivos ignorados pelo Bob
+-- .gitignore                         # Arquivos ignorados pelo Git
+-- Hello World.md                     # Arquivo inicial do projeto
+-- README.md                          # Este arquivo
```

---

## ? Funcionalidades

### ?? Trilha
Consulta o plano de estudos completo de qualquer tecnologia registrada no banco de dados.

- Busca **case-insensitive** e por **correspondência parcial** (inclusive por badge)
- Exibe: tecnologia, nível, módulos, XP total, acesso vitalício, promoção ativa e lives ao vivo
- Disponível via Command (`/trilha`), Skill, e MCP Tool

### ?? Certificado
Gera e salva automaticamente um certificado fictício de conclusão em Markdown.

- Código único no formato `DIO-[ANO]-[6 dígitos]`
- Inclui: nome do aluno, trilha, tecnologia, nível, XP conquistado, badges e data de emissão
- Salvo automaticamente em `dio_explore/docs/certificados-emetidos/`

### ?? Desafio
Cria desafios de código originais para qualquer tecnologia e nível.

| Nível | XP | Tempo Sugerido |
|-------|----|---------------|
| Iniciante | 500 XP | 15 min |
| Intermediário | 1.000 XP | 30 min |
| Avançado | 2.000 XP | 60 min |

Cada desafio inclui: enunciado, formato de entrada/saída, dicas, casos de teste e edge cases.

---

## ?? Como Usar

### 1 · Via Bob — Slash Commands

```
/trilha Python
/trilha spring           # busca por badge (Spring Boot Expert ? Java)
/certificado João Silva, React Developer
/desafio Go Avançado
```

### 2 · Via Bob — Chat livre

```
"Quero aprender Kubernetes. Qual o plano de estudos?"
"Gera um certificado para Maria Souza na trilha de Data Science."
"Me dá um desafio difícil de TypeScript com casos de teste."
```

### 3 · Via MCP Server HTTP — API

**Instalar e compilar:**

```bash
cd MCP
npm install
npm run build
```

**Iniciar o servidor HTTP:**

```powershell
$env:MCP_TRANSPORT = "http"
$env:MCP_PORT      = "3456"
$env:MCP_API_KEY   = "minha-chave-secreta"
node build/index.js
```

**Chamar a ferramenta `trilha`:**

```bash
curl -X POST http://localhost:3456/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha-chave-secreta" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"trilha","arguments":{"tecnologia":"Python"}}}'
```

**Verificar saúde do servidor:**

```bash
curl http://localhost:3456/health
# {"status":"ok","server":"dio-mcp-server","version":"0.1.0"}
```

---

## ?? MCP Server

O servidor MCP está em `MCP/` e expõe as 3 ferramentas em dois modos de transporte.

### Instalação e Build

```bash
cd MCP
npm install       # instala dependências
npm run build     # compila TypeScript ? build/index.js
npm run dev       # modo watch (recompila ao salvar)
```

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `MCP_TRANSPORT` | `stdio` | `stdio` (Bob local) ou `http` (API remota) |
| `MCP_PORT` | `3456` | Porta do servidor HTTP |
| `MCP_API_KEY` | _(não definido)_ | Chave Bearer — se omitida, servidor fica **público** |

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check |
| `POST` / `GET` | `/mcp` | Endpoint MCP Streamable HTTP |

### Autenticação Bearer Token / SSO

**API Key estática:**

```
Authorization: Bearer <sua-chave>
```

**SSO / OAuth 2.0 corporativo:**

1. Implante um proxy de autenticação (NGINX, Kong, AWS API Gateway) na frente do servidor
2. O proxy valida o token JWT/SAML do seu IdP (Okta, Azure AD, Keycloak…)
3. O proxy repassa requisições válidas para `http://localhost:3456/mcp`
4. Remova `MCP_API_KEY` — apenas o proxy controla o acesso

### Registrar no Bob (.bob/mcp.json)

```json
{
  "mcpServers": {
    "dio-mcp-server": {
      "command": "node",
      "args": ["${workspaceFolder}/MCP/build/index.js"]
    }
  }
}
```

---

## ?? Dados — trilhas_dio.json

O arquivo `dio_explore/data/trilhas_dio.json` contém **30 trilhas** com a seguinte estrutura:

```json
{
  "trilhas": [
    {
      "id": 1,
      "nome": "Formação Python Developer",
      "tecnologia": "Python",
      "nivel": "Iniciante",
      "numero_de_modulos": 8,
      "xp_total": 12400,
      "badges_disponiveis": ["Python Basics", "OOP Master", "Python Developer"],
      "promocao": { "ativa": true, "desconto_percent": 30, "validade": "2025-12-31" },
      "vitalicio": true,
      "lives_ao_vivo": [
        { "titulo": "Introdução ao Python", "data": "2025-08-10", "hora": "19:00" }
      ]
    }
  ]
}
```

**Tecnologias disponíveis:** Python, Java, React, Node.js, Angular, TypeScript, Vue.js, Flutter, Kotlin, Go, PHP, C#, Swift, Rust, Docker, Kubernetes, AWS, Azure, DevOps, Data Science, Machine Learning, SQL, MongoDB, GraphQL, Blockchain, Cybersecurity, UX/UI, QA, Salesforce e Power BI.

> **Dica:** Adicione novas trilhas diretamente no JSON — nenhum rebuild necessário. O servidor lê o arquivo em tempo real.

---

## ?? Testes

Suite com **49 testes unitários** em JavaScript puro, cobertura de **100%**.

```bash
node dio_explore/tests/test_commands.js
```

```
===================================================
  RESUMO
===================================================
Total de testes : 49
Aprovados       : 49
Reprovados      : 0
Cobertura       : 100.0%
Meta (>= 70%)   : ATINGIDA
===================================================
```

| Bloco | Testes | O que valida |
|-------|--------|--------------|
| Bloco 1 — JSON | 10 | Integridade de todos os campos de cada trilha |
| Bloco 2 — /trilha | 16 | Busca exata, case-insensitive, parcial, trilha inexistente |
| Bloco 3 — /desafio | 10 | XP e tempo por nível, título, casos de teste, nível inválido |
| Bloco 4 — /certificado | 13 | Código DIO-XXXX, Markdown gerado, arquivo salvo, inputs nulos |

O relatório completo é salvo automaticamente em `dio_explore/tests/resultado_testes.txt`.

---

## ?? Git e Histórico

```
c52e44c  merge: integrate remote history with local MCP server and documentation
f5ccb58  feat: initial project — DIO Learning Platform with Bob Skills, Commands and MCP Server
dbdad65  Add unit tests, fix JSON encoding and generate test report (100% coverage)
25da903  Add slash commands: /trilha, /desafio, /certificado
35688c7  Add .bobignore with ignore rules
1ca69bd  Add 30 fictional DIO learning tracks to trilhas_dio.json
604847f  Add trilhas_dio.json to data folder
dafc30c  Add dio_explore project structure
7323df0  Add Hello World.md
```

---

## ?? Contribuindo

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas alterações e adicione testes se necessário
4. Compile o servidor se editar o TypeScript: `cd MCP && npm run build`
5. Execute os testes: `node dio_explore/tests/test_commands.js`
6. Commit com mensagem semântica: `git commit -m "feat: descrição da feature"`
7. Abra um Pull Request

---

## ?? Insights para Profissionais

> Este projeto foi construído inteiramente com **IBM Bob** como co-piloto. Algumas lições:

- **IA amplifica, não substitui.** Cada decisão de arquitetura foi tomada pelo humano; o Bob executou com precisão.
- **Prompts são especificações técnicas.** "Use a pasta MCP" é uma restrição de arquitetura. "Para acesso via API" define um requisito não-funcional inteiro.
- **Dados separados do código.** O JSON fica fora do TypeScript — adicione trilhas sem recompilar nada.
- **Nunca use `console.log` em servidores MCP.** O stdout é o canal do protocolo; qualquer texto não-JSON corrompe a conexão.
- **Skills são prompts reutilizáveis.** Encapsule instruções repetidas em Skills, assim como extrai funções em vez de duplicar código.

---

<div align="center">

Construído com ?? usando **IBM Bob** · [Digital Innovation One](https://web.dio.me)

</div>
