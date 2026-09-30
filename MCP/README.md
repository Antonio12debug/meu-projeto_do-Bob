# DIO MCP Server

Servidor MCP (Model Context Protocol) para a plataforma de aprendizado DIO.  
Expõe três ferramentas — **trilha**, **certificado** e **desafio** — consumíveis diretamente pelo Bob ou por qualquer cliente MCP compatível via stdio ou HTTP.

---

## Ferramentas disponíveis

| Ferramenta | Descrição |
|---|---|
| `trilha` | Consulta uma trilha pelo nome da tecnologia e retorna o plano de estudos completo |
| `certificado` | Gera e salva um certificado de conclusão fictício em Markdown |
| `desafio` | Gera um desafio de código para a tecnologia e nível escolhidos |

---

## Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Instalação

```bash
cd MCP
npm install
npm run build
```

O executável compilado ficará em `MCP/build/index.js`.

---

## Execução

### Modo stdio (padrão — para uso com o Bob)

```bash
node build/index.js
```

### Modo HTTP (para acesso remoto / API / SSO)

```bash
# Porta padrão: 3456
MCP_TRANSPORT=http node build/index.js

# Com porta e chave de API personalizadas
MCP_TRANSPORT=http MCP_PORT=8080 MCP_API_KEY=minha-chave-secreta node build/index.js
```

#### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `MCP_TRANSPORT` | `stdio` | `stdio` ou `http` |
| `MCP_PORT` | `3456` | Porta do servidor HTTP |
| `MCP_API_KEY` | _(não definido)_ | Chave Bearer obrigatória para autenticar chamadas HTTP. Se omitida, o servidor fica **público** |

---

## Autenticação HTTP (Bearer Token / API Key)

Quando `MCP_API_KEY` está definido, todas as requisições para `/mcp` devem incluir o header:

```
Authorization: Bearer <sua-chave>
```

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3456/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer minha-chave-secreta" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"trilha","arguments":{"tecnologia":"Python"}}}'
```

### Integração com SSO / OAuth 2.0

Para usar SSO em vez de API key estática:

1. Implemente um **proxy de autenticação** (ex.: NGINX, Kong, AWS API Gateway) na frente deste servidor.
2. O proxy valida o token JWT/SAML do seu provedor de identidade (Okta, Azure AD, Keycloak…).
3. Após validação, o proxy repassa a requisição para `http://localhost:3456/mcp`.
4. Remova `MCP_API_KEY` para que apenas o proxy controle o acesso.

---

## Endpoints HTTP

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Health check — retorna `{"status":"ok"}` |
| `POST` | `/mcp` | Endpoint JSON-RPC MCP |

---

## Registrar no Bob (stdio — recomendado para uso local)

Adicione o bloco abaixo no arquivo `.bob/mcp.json` do workspace (ou no global `mcp.json`):

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

### Com API key para modo HTTP

Se preferir rodar o servidor HTTP e apontá-lo no Bob como servidor remoto:

```json
{
  "mcpServers": {
    "dio-mcp-server-http": {
      "url": "http://localhost:3456/mcp",
      "headers": {
        "Authorization": "Bearer ${env:DIO_MCP_API_KEY}"
      }
    }
  }
}
```

Defina a variável no ambiente antes de iniciar o Bob:

```powershell
$env:DIO_MCP_API_KEY = "minha-chave-secreta"
```

---

## Estrutura do projeto

```
MCP/
├── src/
│   └── index.ts      ← Código-fonte principal
├── build/            ← Saída do compilador TypeScript (gerado após npm run build)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Scripts npm

| Comando | Descrição |
|---|---|
| `npm run build` | Compila TypeScript → `build/` |
| `npm start` | Inicia em modo stdio |
| `npm run start:http` | Inicia em modo HTTP na porta 3456 |
| `npm run dev` | Compila em modo watch |
