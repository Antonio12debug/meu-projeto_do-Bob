---
name: trilha
description: >-
  Recebe o nome de uma tecnologia e retorna um plano de estudos formatado com os
  módulos da trilha correspondente, lido do arquivo
  dio_explore/data/trilhas_dio.json.
metadata:
  user-invocable: true
  disable-model-invocation: true
---

O usuário quer consultar uma trilha da DIO. O argumento fornecido é o nome da tecnologia: $ARGUMENTS

Siga estes passos:

1. Leia o arquivo localizado em `C:\Users\Antonio\Documents\meu-projeto_do-Bob\dio_explore\data\trilhas_dio.json`.
2. Localize a trilha cujo campo `tecnologia` ou `nome` contenha o argumento fornecido (busca case-insensitive, correspondência parcial aceita).
3. Se encontrada, formate e exiba o plano de estudos com o seguinte layout:

---

## 📚 Plano de Estudos — [nome da trilha]

| Campo | Valor |
|---|---|
| 🛠️ Tecnologia | [tecnologia] |
| 🎯 Nível | [nivel] |
| 📦 Módulos | [numero_de_modulos] |
| ⭐ XP Total | [xp_total] XP |
| ♾️ Acesso Vitalício | [Sim / Não] |

### 🏅 Badges Disponíveis
- [badge 1]
- [badge 2]
- [badge 3]

### 🎟️ Promoção
- **Ativa:** [Sim / Não]
- **Desconto:** [desconto_percent]%
- **Válida até:** [validade]

### 📡 Lives ao Vivo
| Título | Data | Hora |
|---|---|---|
| [titulo] | [data] | [hora] |

### 🗺️ Roteiro de Módulos Sugerido
Liste [numero_de_modulos] módulos fictícios coerentes com a tecnologia e nível da trilha, numerados de 1 a N, com título e breve descrição de cada módulo.

---

4. Se nenhuma trilha for encontrada, informe educadamente e liste as tecnologias disponíveis no JSON.
