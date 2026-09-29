---
description: Gera um desafio de código aleatório baseado no nível e tecnologia escolhidos pelo usuário.
---

O usuário quer um desafio de código. O argumento fornecido é nível e/ou tecnologia: $ARGUMENTS

Siga estes passos:

1. Extraia do argumento:
   - **Tecnologia** (ex: Python, Java, React, Go, etc.) — se não informada, escolha uma aleatória do arquivo `dio_explore/data/trilhas_dio.json`.
   - **Nível** (Iniciante | Intermediário | Avançado) — se não informado, pergunte ao usuário ou assuma Iniciante.

2. Gere um desafio de código original, coerente com a tecnologia e nível escolhidos, no seguinte formato:

---

## ⚔️ Desafio de Código — [Tecnologia] · [Nível]

### 📋 Enunciado
[Descrição clara e objetiva do problema a ser resolvido]

### 📥 Entrada
[Descrição do formato de entrada esperado, com exemplo]

### 📤 Saída
[Descrição do formato de saída esperado, com exemplo]

### 💡 Dicas
- [Dica 1 relevante para a tecnologia/nível]
- [Dica 2]
- [Dica 3]

### 🧪 Casos de Teste
| Entrada | Saída Esperada |
|---|---|
| [exemplo 1] | [resultado 1] |
| [exemplo 2] | [resultado 2] |
| [exemplo 3 - edge case] | [resultado 3] |

### ⏱️ Tempo Sugerido
[X minutos — adequado ao nível]

### 🏅 XP ao Completar
[XP baseado no nível: Iniciante=500 | Intermediário=1000 | Avançado=2000]

---

3. Após exibir o desafio, pergunte se o usuário quer ver a solução ou tentar resolver e colar o código para revisão.
