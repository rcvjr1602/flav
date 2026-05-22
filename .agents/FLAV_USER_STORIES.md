# FLAV — USER STORIES TÉCNICAS
> Formato: Agente de IA | Versão 1.0

---

## CONTEXTO DO PRODUTO

**App:** FLAV — Central de comando do atleta de endurance
**Stack visual:** Dark (#121214), Accent (#D4FF00), Mono para dados numéricos
**Usuário primário:** Atleta de ciclismo/triatlo que treina com dados (potência, FC, métricas de carga)
**Integrações externas:** intervals.icu, exames laboratoriais em PDF

---

## US-01 — INPUT DE MÉTRICAS DE PERFORMANCE

### História
> Como atleta, quero inserir e atualizar minhas métricas de performance para que o app use dados reais nos meus planos e análises.

### Campos de entrada obrigatórios

```
FTP (Functional Threshold Power)
  tipo: number
  unidade: watts (W)
  range válido: 50–600 W
  atualização: manual ou via sync intervals.icu

Curva de Potência (Power Curve)
  tipo: array de objetos
  estrutura: { duration_seconds: number, power_watts: number }
  durações padrão: 1s, 5s, 30s, 1min, 5min, 20min, 60min
  fonte: intervals.icu API ou input manual

Métricas de Forma / Fadiga / Fitness (CTL/ATL/TSB)
  CTL (Chronic Training Load / Fitness): number, decimais permitidos
  ATL (Acute Training Load / Fadiga): number, decimais permitidos
  TSB (Training Stress Balance / Forma): number, pode ser negativo
  fonte primária: sync intervals.icu
  atualização: diária automática ou manual
```

### Critérios de aceite

- [ ] Usuário consegue inserir FTP manualmente com validação de range
- [ ] Usuário consegue conectar conta intervals.icu via OAuth para sync automático
- [ ] Curva de potência é exibida como gráfico visual após input
- [ ] CTL/ATL/TSB são exibidos com interpretação textual simples (ex: "Forma positiva — dia de performance")
- [ ] Dados salvos persistem entre sessões
- [ ] Histórico de FTP é mantido com data de cada atualização

### Regras de negócio

- TSB > +10: "Forma — apto para performance"
- TSB entre -10 e +10: "Neutro — treino moderado"
- TSB < -10: "Fadiga acumulada — priorizar recuperação"
- FTP atualizado recalcula automaticamente todas as zonas de potência (Z1–Z7)

### Zonas de potência derivadas do FTP

```
Z1 — Recuperação ativa:  < 55% FTP
Z2 — Endurance:          56–75% FTP
Z3 — Tempo:              76–90% FTP
Z4 — Limiar:             91–105% FTP
Z5 — VO2max:             106–120% FTP
Z6 — Capacidade anaeróbia: 121–150% FTP
Z7 — Neuromuscular:      > 150% FTP
```

---

## US-02 — LEITURA DE EXAMES EM PDF

### História
> Como atleta, quero fazer upload de exames laboratoriais em PDF para que o app extraia e salve automaticamente os marcadores relevantes na minha aba de saúde.

### Fluxo de interação

```
1. Usuário acessa aba "Saúde"
2. Toca em "Adicionar exame"
3. Seleciona PDF do dispositivo ou nuvem
4. Sistema processa o PDF via OCR/extração de texto
5. Agente identifica marcadores conhecidos
6. Exibe preview dos marcadores extraídos para confirmação
7. Usuário confirma ou edita valores
8. Marcadores salvos com data do exame
```

### Marcadores prioritários a identificar

```
HEMATOLÓGICOS
  Hemoglobina (Hb): g/dL
  Hematócrito (Ht): %
  Ferro sérico: μg/dL
  Ferritina: ng/mL
  Vitamina B12: pg/mL
  Ácido fólico: ng/mL

HORMONAIS / METABÓLICOS
  Testosterona total: ng/dL
  Cortisol basal: μg/dL
  TSH: μUI/mL
  T4 livre: ng/dL
  Insulina basal: μUI/mL
  Glicose em jejum: mg/dL

INFLAMATÓRIOS / MUSCULARES
  PCR ultrassensível: mg/L
  CPK (Creatina Quinase): U/L
  LDH: U/L
  VHS: mm/h

RENAIS / HEPÁTICOS
  Creatinina: mg/dL
  Ureia: mg/dL
  TGO / TGP: U/L

VITAMINAS / MINERAIS
  Vitamina D (25-OH): ng/mL
  Magnésio: mg/dL
  Zinco: μg/dL
  Sódio / Potássio: mEq/L
```

### Critérios de aceite

- [ ] Upload aceita PDF de qualquer laboratório brasileiro (Fleury, DASA, Lavoisier, etc.)
- [ ] Extração identifica corretamente nome do marcador, valor e unidade
- [ ] Valores fora do range de referência são sinalizados com status (baixo/normal/alto)
- [ ] Histórico de exames é mantido com evolução temporal de cada marcador
- [ ] Marcadores críticos para atletas (Ferritina, Hb, Vit D, Testosterona) têm ranges específicos para atletas, não só referência laboratorial padrão
- [ ] PDF original fica arquivado e acessível

### Ranges de referência para atletas (diferente do padrão laboratorial)

```
Ferritina atleta: ideal > 50 ng/mL (lab padrão aceita > 12)
Vitamina D atleta: ideal 40–80 ng/mL (lab padrão aceita > 20)
Hemoglobina homem atleta: ideal 14.5–17.5 g/dL
CPK pós-treino intenso: pode chegar a 1000 U/L sem ser patológico
```

---

## US-03 — ABA DE NUTRIÇÃO

### História
> Como atleta, quero cadastrar e consultar meus protocolos nutricionais para que o app me ajude a executar a estratégia certa no momento certo do treinamento.

### Estrutura da aba

```
Nutrição
├── Dieta Diária Base
├── Pré-Treino
├── Intra-Treino
├── Pós-Treino
├── Carbo Load
└── Protocolos Especiais (race day, recuperação, restrição)
```

### Campos por protocolo

```
DIETA DIÁRIA BASE
  Objetivo calórico: kcal
  Distribuição de macros: % proteína / % carboidrato / % gordura
  Restrições alimentares: array de strings (ex: ["glúten", "lactose"])
  Hidratação base: ml/dia
  Suplementação fixa: array { nome, dose, horário }

PRÉ-TREINO (janela: 2–3h antes)
  Refeição principal: descrição livre
  Carboidratos alvo: g
  Evitar: array (ex: ["fibra alta", "gordura"])
  Timing exato: minutos antes do início

INTRA-TREINO (durante)
  Carboidratos por hora: g/h
  Fonte: string (ex: "gel + bebida isotônica")
  Hidratação por hora: ml/h
  Sódio alvo: mg/h (relevante para provas longas)

PÓS-TREINO (janela: 0–45min)
  Proteína alvo: g
  Carboidratos alvo: g
  Fonte preferida: string
  Hidratação de reposição: ml

CARBO LOAD
  Duração do protocolo: dias (padrão: 2–3 dias pré-prova)
  CHO alvo por dia: g/kg de peso corporal (padrão: 8–12 g/kg)
  Alimentos permitidos: lista
  Restrições: reduzir fibra e gordura
  Dia de ativação: data
```

### Critérios de aceite

- [ ] Usuário consegue criar e nomear múltiplos protocolos de cada tipo
- [ ] Protocolos podem ser ativados/desativados por período
- [ ] App sugere protocolo correto baseado no tipo de treino do dia (leve → dieta base, intenso → pré/pós-treino ativo)
- [ ] Carbo Load tem contagem regressiva até a data da prova
- [ ] Suplementação fixa gera lembretes por horário
- [ ] Campos de macro são calculados automaticamente em gramas ao inserir peso corporal + percentual

### Regras de negócio

```
Se duração do treino > 90min → ativar protocolo intra-treino automaticamente
Se TSB < -15 → sugerir protocolo de recuperação (proteína elevada + anti-inflamatórios naturais)
Se data_prova - hoje <= 3 dias → alertar para iniciar Carbo Load
Proteína diária mínima atleta endurance: 1.6 g/kg peso corporal
```

---

## RELAÇÕES ENTRE MÓDULOS

```
US-01 (Métricas) ──→ informa intensidade do treino
       │
       ▼
US-03 (Nutrição) ──→ ajusta protocolo pré/pós/intra baseado em carga
       │
       ▼
US-02 (Saúde) ──────→ valida se marcadores (Ferritina, Hb) suportam carga atual
```

---

## DADOS GLOBAIS DO ATLETA (necessários para todos os módulos)

```
perfil_atleta:
  nome: string
  peso_kg: number
  altura_cm: number
  idade: number
  sexo: string
  modalidade_primaria: string  // "ciclismo" | "triatlo" | "corrida" | "misto"
  nivel: string                // "recreativo" | "amador competitivo" | "elite"
  data_proxima_prova: date | null
```

---

*FLAV User Stories v1.0 — para uso por agentes de IA na geração de features, telas e lógica de negócio*
