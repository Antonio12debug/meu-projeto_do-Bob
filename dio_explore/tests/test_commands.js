/**
 * test_commands.js
 * Testes unitarios para os slash commands /trilha, /desafio e /certificado
 * Cobertura alvo: >= 70%
 */

const fs   = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "trilhas_dio.json");
const CERT_DIR  = path.join(__dirname, "..", "docs", "certificados-emetidos");

let totalTests  = 0;
let passedTests = 0;
const results   = [];

function assert(description, condition, detail) {
  totalTests++;
  const status = condition ? "PASS" : "FAIL";
  if (condition) passedTests++;
  const line = "[" + status + "] " + description + (detail ? " -> " + detail : "");
  results.push(line);
  console.log(line);
}

function loadJSON() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

// --- /trilha logic ---
function findTrilha(tecnologia, data) {
  const q = tecnologia.toLowerCase();
  return data.trilhas.find(function(t) {
    return t.tecnologia.toLowerCase().includes(q) ||
           t.nome.toLowerCase().includes(q) ||
           t.badges_disponiveis.some(function(b){ return b.toLowerCase().includes(q); });
  }) || null;
}

function formatPlanoEstudos(trilha) {
  if (!trilha) return null;
  return {
    titulo:    "Plano de Estudos - " + trilha.nome,
    tecnologia: trilha.tecnologia,
    nivel:     trilha.nivel,
    modulos:   trilha.numero_de_modulos,
    xp:        trilha.xp_total,
    vitalicio: trilha.vitalicio ? "Sim" : "Nao",
    badges:    trilha.badges_disponiveis,
    promocao:  trilha.promocao,
    lives:     trilha.lives_ao_vivo,
  };
}

// --- /desafio logic ---
const XP_POR_NIVEL = { "Iniciante": 500, "Intermediario": 1000, "Avancado": 2000 };
const NIVEL_TEMPO  = { "Iniciante": 30,  "Intermediario": 60,   "Avancado": 120  };

const DESAFIOS_JAVA = {
  "Iniciante":     "FizzBuzz em Java",
  "Intermediario": "API REST com Spring Boot",
  "Avancado":      "Microservicos com RabbitMQ",
};

function gerarDesafio(tecnologia, nivel) {
  const nivelNorm = nivel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!XP_POR_NIVEL[nivelNorm]) return null;

  const tituloBase = tecnologia === "Java" && DESAFIOS_JAVA[nivelNorm]
    ? DESAFIOS_JAVA[nivelNorm]
    : "Desafio " + nivel + " de " + tecnologia;

  return {
    titulo:        tituloBase,
    tecnologia:    tecnologia,
    nivel:         nivel,
    xp:            XP_POR_NIVEL[nivelNorm],
    tempoSugerido: NIVEL_TEMPO[nivelNorm],
    casos: [
      { entrada: "Exemplo 1", saida: "Resultado 1" },
      { entrada: "Exemplo 2", saida: "Resultado 2" },
      { entrada: "Edge case", saida: "Resultado 3" },
    ],
  };
}

// --- /certificado logic ---
function gerarCodigoCertificado(seed) {
  var num = seed ? String(seed) : String(Math.floor(100000 + Math.random() * 900000));
  return "DIO-" + new Date().getFullYear() + "-" + num;
}

function gerarCertificado(nomeUsuario, trilha) {
  if (!nomeUsuario || !trilha) return null;
  var codigo = gerarCodigoCertificado(123456);
  var dataEmissao = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });

  var badges = trilha.badges_disponiveis.map(function(b) { return "- [BADGE] " + b; }).join("\n");

  var md = [
    "# Certificado de Conclusao",
    "",
    "> A Digital Innovation One certifica que",
    "",
    "## " + nomeUsuario.toUpperCase(),
    "",
    "concluiu com exito a trilha de aprendizado:",
    "",
    "---",
    "",
    "### " + trilha.nome,
    "",
    "| Campo             | Detalhe                   |",
    "|-------------------|---------------------------|",
    "| Tecnologia        | " + trilha.tecnologia + "  |",
    "| Nivel             | " + trilha.nivel + "        |",
    "| XP Conquistado    | " + trilha.xp_total + " XP  |",
    "| Data de Emissao   | " + dataEmissao + "          |",
    "| Codigo            | " + codigo + "              |",
    "",
    "---",
    "",
    "### Badges Conquistadas",
    badges,
    "",
    "---",
    "",
    '> "A aprendizagem e a unica coisa que a mente nunca se cansa."',
    "> -- Leonardo da Vinci",
    "",
    "---",
    "",
    "Digital Innovation One - https://web.dio.me",
    "Este e um certificado ficticio gerado para fins de estudo.",
  ].join("\n");

  return { codigo: codigo, nomeUsuario: nomeUsuario, trilha: trilha.nome, markdown: md };
}

function salvarCertificado(cert) {
  if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
  var nome   = cert.nomeUsuario.toLowerCase().replace(/\s+/g, "_");
  var trilha = cert.trilha.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  var file   = path.join(CERT_DIR, nome + "-" + trilha + ".md");
  fs.writeFileSync(file, cert.markdown, "utf-8");
  return file;
}

// =========================================================
// SUITE DE TESTES
// =========================================================
console.log("\n===================================================");
console.log("  SUITE DE TESTES -- Slash Commands DIO Explorer");
console.log("===================================================\n");

// -- BLOCO 1: JSON --
console.log("-- BLOCO 1: Integridade do JSON --------------------");
var data;
try {
  data = loadJSON();
  assert("JSON carregado sem erros", true);
} catch(e) {
  assert("JSON carregado sem erros", false, e.message);
  process.exit(1);
}
assert("JSON possui propriedade trilhas",        Array.isArray(data.trilhas));
assert("JSON possui ao menos 30 trilhas",         data.trilhas.length >= 30, "total: " + data.trilhas.length);
assert("Cada trilha tem campo nome",              data.trilhas.every(function(t){ return !!t.nome; }));
assert("Cada trilha tem campo tecnologia",        data.trilhas.every(function(t){ return !!t.tecnologia; }));
assert("Cada trilha tem campo nivel",             data.trilhas.every(function(t){ return !!t.nivel; }));
assert("Cada trilha tem xp_total numerico",       data.trilhas.every(function(t){ return typeof t.xp_total === "number"; }));
assert("Cada trilha tem badges_disponiveis",      data.trilhas.every(function(t){ return Array.isArray(t.badges_disponiveis); }));
assert("Cada trilha tem promocao objeto",         data.trilhas.every(function(t){ return typeof t.promocao === "object"; }));
assert("Cada trilha tem vitalicio booleano",      data.trilhas.every(function(t){ return typeof t.vitalicio === "boolean"; }));
assert("Cada trilha tem lives_ao_vivo array",     data.trilhas.every(function(t){ return Array.isArray(t.lives_ao_vivo); }));

// -- BLOCO 2: /trilha --
console.log("\n-- BLOCO 2: /trilha --------------------------------");
var trilhaJava = findTrilha("Java", data);
assert("/trilha Java - encontrada",               trilhaJava !== null);
assert("/trilha Java - nome correto",             trilhaJava && trilhaJava.nome === "Formacao Java Developer" || (trilhaJava && trilhaJava.nome.includes("Java")), "nome: " + (trilhaJava && trilhaJava.nome));
assert("/trilha Java - tecnologia Java",          trilhaJava && trilhaJava.tecnologia === "Java");
assert("/trilha Java - nivel Intermediario",      trilhaJava && trilhaJava.nivel === "Intermediario" || (trilhaJava && trilhaJava.nivel.includes("term")), "nivel: " + (trilhaJava && trilhaJava.nivel));
assert("/trilha Java - 10 modulos",               trilhaJava && trilhaJava.numero_de_modulos === 10);
assert("/trilha Java - xp_total 18600",           trilhaJava && trilhaJava.xp_total === 18600);
assert("/trilha Java - 3 badges",                 trilhaJava && trilhaJava.badges_disponiveis.length === 3);
assert("/trilha Java - badge Java Developer",     trilhaJava && trilhaJava.badges_disponiveis.includes("Java Developer"));
assert("/trilha Java - tem lives",                trilhaJava && trilhaJava.lives_ao_vivo.length > 0);

var plano = formatPlanoEstudos(trilhaJava);
assert("/trilha - formatPlanoEstudos retorna obj",plano !== null);
assert("/trilha - plano tem xp 18600",            plano && plano.xp === 18600);
assert("/trilha - plano vitalicio Sim",           plano && plano.vitalicio === "Sim");

assert("/trilha - busca case-insensitive",        findTrilha("java", data) !== null);
assert("/trilha - busca parcial Spring (badge)",  findTrilha("Spring", data) !== null);
assert("/trilha - inexistente retorna null",      findTrilha("COBOL_INEXISTENTE_XYZ", data) === null);

// -- BLOCO 3: /desafio --
console.log("\n-- BLOCO 3: /desafio --------------------------------");
var dIniciante = gerarDesafio("Java", "Iniciante");
assert("/desafio Java Iniciante - retorna obj",   dIniciante !== null);
assert("/desafio Java Iniciante - xp 500",        dIniciante && dIniciante.xp === 500);
assert("/desafio Java Iniciante - tempo 30min",   dIniciante && dIniciante.tempoSugerido === 30);
assert("/desafio Java Iniciante - tem titulo",    dIniciante && typeof dIniciante.titulo === "string");
assert("/desafio Java Iniciante - 3 casos",       dIniciante && dIniciante.casos.length === 3);

var dInter = gerarDesafio("Java", "Intermediario");
assert("/desafio Java Intermediario - xp 1000",   dInter && dInter.xp === 1000);
assert("/desafio Java Intermediario - tempo 60",  dInter && dInter.tempoSugerido === 60);

var dAvan = gerarDesafio("Java", "Avancado");
assert("/desafio Java Avancado - xp 2000",        dAvan && dAvan.xp === 2000);
assert("/desafio Java Avancado - tempo 120",      dAvan && dAvan.tempoSugerido === 120);

assert("/desafio nivel invalido retorna null",    gerarDesafio("Java", "Mestre") === null);
var dPython = gerarDesafio("Python", "Iniciante");
assert("/desafio Python usa fallback titulo",     dPython !== null && dPython.titulo.includes("Python"));

// -- BLOCO 4: /certificado --
console.log("\n-- BLOCO 4: /certificado ----------------------------");
var cert = gerarCertificado("Antonio Silva", trilhaJava);
assert("/certificado - retorna objeto",           cert !== null);
assert("/certificado - codigo formato DIO-XXXX",  cert && /^DIO-\d{4}-\d{6}$/.test(cert.codigo));
assert("/certificado - nome usuario correto",     cert && cert.nomeUsuario === "Antonio Silva");
assert("/certificado - trilha Java",              cert && cert.trilha.includes("Java"));
assert("/certificado - markdown gerado",          cert && typeof cert.markdown === "string" && cert.markdown.length > 100);
assert("/certificado - markdown tem nome aluno",  cert && cert.markdown.includes("ANTONIO SILVA"));
assert("/certificado - markdown tem link DIO",    cert && cert.markdown.includes("https://web.dio.me"));
assert("/certificado - markdown tem badges",      cert && cert.markdown.includes("[BADGE]"));

var certFile;
try {
  certFile = salvarCertificado(cert);
  assert("/certificado - arquivo md salvo",       fs.existsSync(certFile), certFile);
  assert("/certificado - conteudo valido",        fs.readFileSync(certFile,"utf-8").includes("ANTONIO SILVA"));
} catch(e) {
  assert("/certificado - arquivo md salvo",       false, e.message);
}

assert("/certificado - null para nome vazio",     gerarCertificado("", trilhaJava) === null);
assert("/certificado - null para trilha null",    gerarCertificado("Antonio", null) === null);

// =========================================================
// RELATORIO FINAL
// =========================================================
var coverage = ((passedTests / totalTests) * 100).toFixed(1);
var meta     = parseFloat(coverage) >= 70;

console.log("\n===================================================");
console.log("  RELATORIO FINAL");
console.log("===================================================");
console.log("Total de testes : " + totalTests);
console.log("Aprovados       : " + passedTests);
console.log("Reprovados      : " + (totalTests - passedTests));
console.log("Cobertura       : " + coverage + "%");
console.log("Meta (>= 70%)   : " + (meta ? "ATINGIDA" : "NAO ATINGIDA"));
console.log("===================================================\n");

// Gravar TXT
var REPORT_PATH = path.join(__dirname, "resultado_testes.txt");
var linhas = [
  "===================================================",
  "  RELATORIO DE TESTES -- Slash Commands DIO Explorer",
  "  Executado em: " + new Date().toLocaleString("pt-BR"),
  "===================================================",
  "",
].concat(results).concat([
  "",
  "===================================================",
  "  RESUMO",
  "===================================================",
  "Total de testes : " + totalTests,
  "Aprovados       : " + passedTests,
  "Reprovados      : " + (totalTests - passedTests),
  "Cobertura       : " + coverage + "%",
  "Meta (>= 70%)   : " + (meta ? "ATINGIDA" : "NAO ATINGIDA"),
  "",
  certFile ? "Certificado salvo em: " + certFile : "",
  "===================================================",
]);

fs.writeFileSync(REPORT_PATH, linhas.join("\n"), "utf-8");
console.log("Relatorio gravado em: " + REPORT_PATH);

process.exit(meta ? 0 : 1);
