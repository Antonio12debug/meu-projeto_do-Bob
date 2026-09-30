---
name: certificado
description: >-
  Gera um certificado fictício em Markdown com o nome do usuário e a trilha
  concluída.
metadata:
  user-invocable: true
  disable-model-invocation: true
---

O usuário quer gerar um certificado de conclusão. O argumento fornecido é o nome do usuário e/ou trilha: $ARGUMENTS

Siga estes passos:

1. Extraia do argumento:
   - **Nome do usuário** (ex: "Antonio Silva") — se não informado, pergunte.
   - **Trilha concluída** (ex: "Python Developer", "React", etc.) — se não informada, pergunte.

2. Consulte o arquivo `dio_explore/data/trilhas_dio.json` para obter os dados reais da trilha (tecnologia, nível, xp_total, badges).

3. Gere a data atual de emissão e um código de certificado fictício único no formato `DIO-[ANO]-[6 dígitos aleatórios]`.

4. Produza o certificado completo em Markdown no seguinte formato:

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🎓  CERTIFICADO DE CONCLUSÃO  🎓               ║
║                         DIO — Digital Innovation One        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

# 🎓 Certificado de Conclusão

> *A Digital Innovation One certifica que*

## [NOME DO USUÁRIO]

concluiu com êxito a trilha de aprendizado:

---

### 🏆 [NOME DA TRILHA]

| Campo | Detalhe |
|---|---|
| 🛠️ Tecnologia | [tecnologia] |
| 🎯 Nível | [nivel] |
| ⭐ XP Conquistado | [xp_total] XP |
| 📅 Data de Emissão | [data atual por extenso] |
| 🔐 Código do Certificado | [DIO-ANO-XXXXXX] |

---

### 🏅 Badges Conquistadas
[Liste cada badge da trilha com emoji 🏅]

---

> *"A aprendizagem é a única coisa que a mente nunca se cansa, nunca tem medo e nunca se arrepende."*
> — **Leonardo da Vinci**

---

**Digital Innovation One** · [https://web.dio.me](https://web.dio.me)
*Este é um certificado fictício gerado para fins de estudo.*

---

5. Após gerar o certificado, salve-o como arquivo Markdown em `dio_explore/docs/certificados-emetidos/[nome-do-usuario]-[trilha].md` usando snake_case sem acentos, e informe o caminho do arquivo criado.
