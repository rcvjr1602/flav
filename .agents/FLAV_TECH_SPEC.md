# FLAV — ESPECIFICAÇÃO TÉCNICA MVP
> Para consumo por agente autônomo (Antigravity) | Versão 1.0

---

## 1. ARQUITETURA GERAL

**Modelo:** Decoupled (Frontend ↔ Backend separados estritamente)
**Prioridade de infra:** Free Tier, escalabilidade inicial, custo zero no MVP

```
[Frontend — Next.js]  ←→  [Backend — Node.js]  ←→  [PostgreSQL]
                                   ↕
                         [APIs Externas: intervals.icu, etc.]
```

---

## 2. STACK TECNOLÓGICA

| Camada | Tecnologia | Detalhe |
|---|---|---|
| Backend | Node.js + TypeScript + Express ou NestJS | Assíncrono, tipagem estrita, ideal para I/O de dados |
| Frontend | React / Next.js (App Router) | SSR/SSG híbrido, roteamento por arquivos |
| Banco de dados | PostgreSQL | Supabase ou Neon (Free Tier recomendado) |
| Validação | Zod ou Joi | Backend + Frontend |
| ORM | Prisma ou TypeORM | Migrações para PostgreSQL |
| HTTP Client | Axios ou Fetch nativo | Comunicação Frontend→Backend |

---

## 3. ESTRUTURA DE PASTAS

### 3.1 Backend (`/backend`)

```
src/
├── config/           # ENV vars, inicialização de DB e integradores
├── modules/          # Divisão por domínio de negócio
│   ├── users/
│   │   ├── controllers/    # Validação de entrada + roteamento
│   │   ├── services/       # Regras de negócio
│   │   └── repositories/   # Interface com o banco
│   ├── metrics/            # FTP, curva de potência, CTL/ATL/TSB
│   ├── health/             # Marcadores de exames laboratoriais
│   ├── nutrition/          # Protocolos nutricionais
│   └── data-ingestion/     # Integração intervals.icu e PDFs
├── shared/
│   ├── middlewares/
│   ├── utils/
│   └── errors/
└── app.ts            # Bootstrap do servidor
```

### 3.2 Frontend (`/frontend`)

```
src/
├── app/              # Rotas (pages, layouts, loading states)
│   ├── dashboard/
│   ├── metrics/
│   ├── health/
│   └── nutrition/
├── components/       # UI reutilizável (cards, tabelas, gráficos, botões)
├── hooks/            # Custom hooks de estado compartilhado
├── services/         # Axios/Fetch → chamadas ao backend interno
└── types/            # Interfaces TypeScript globais
```

---

## 4. CAMADA DE INTEGRAÇÃO COM TERCEIROS

**Regra:** Nenhuma regra de negócio chama diretamente APIs externas. Toda chamada passa pelo gateway.

```
src/modules/data-ingestion/
├── gateways/
│   ├── intervals-icu.client.ts   # intervals.icu API
│   └── pdf-parser.client.ts      # Extração de exames PDF
├── adapters/
│   ├── intervals-icu.adapter.ts  # Transforma payload → schema interno
│   └── exam-markers.adapter.ts   # Normaliza marcadores laboratoriais
└── jobs/
    └── sync-metrics.job.ts       # Sync agendado CTL/ATL/TSB
```

### Padrões obrigatórios de resiliência

```typescript
// Toda chamada externa deve ter:
{
  timeout: 10000,           // 10s máximo
  retries: 3,               // 3 tentativas
  backoff: 'exponential',   // 1s → 2s → 4s
  errorHandling: [4xx, 5xx] // tratar explicitamente
}
```

### Fluxo de ingestão

```
API Externa → Gateway (HTTP) → Adapter (parse/sanitize) → Schema DB → PostgreSQL
```

Para volumes maiores: usar **webhooks** ou **jobs agendados** — nunca travar a thread principal.

---

## 5. SEGURANÇA E BOAS PRÁTICAS

### 5.1 Variáveis de ambiente

```bash
# .env — NUNCA hardcode de credenciais
DATABASE_URL=
JWT_SECRET=
INTERVALS_ICU_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
```

**Proibido:** qualquer credencial no código-fonte, mesmo em comentários.

### 5.2 Validação de input

- **Backend:** Zod/Joi em **todas** as rotas de entrada
- **Frontend:** mesmas schemas Zod reutilizadas nos formulários

```typescript
// Exemplo de schema compartilhado
const FTPInputSchema = z.object({
  value_watts: z.number().min(50).max(600),
  measured_at: z.date(),
  source: z.enum(['manual', 'intervals_icu'])
})
```

### 5.3 CORS

```typescript
// Aceitar requisições exclusivamente do domínio do Frontend
cors({ origin: process.env.FRONTEND_URL })
```

### 5.4 Autenticação

- JWT para sessões de usuário
- Tokens de API de terceiros: apenas no Backend, nunca expostos ao Frontend

---

## 6. SCHEMAS DE DADOS PRINCIPAIS

### Atleta (perfil base)

```typescript
interface Athlete {
  id: string
  name: string
  weight_kg: number
  height_cm: number
  age: number
  sex: 'M' | 'F'
  primary_sport: 'cycling' | 'triathlon' | 'running' | 'mixed'
  level: 'recreational' | 'competitive_amateur' | 'elite'
  next_race_date: Date | null
}
```

### Métricas de Performance (US-01)

```typescript
interface PerformanceMetrics {
  athlete_id: string
  ftp_watts: number
  recorded_at: Date
  ctl: number          // Fitness
  atl: number          // Fadiga
  tsb: number          // Forma (pode ser negativo)
  power_curve: PowerCurvePoint[]
}

interface PowerCurvePoint {
  duration_seconds: number
  power_watts: number
}
```

### Marcador de Saúde (US-02)

```typescript
interface HealthMarker {
  athlete_id: string
  exam_date: Date
  marker_name: string
  value: number
  unit: string
  status: 'low' | 'normal' | 'high'
  reference_min: number
  reference_max: number
  athlete_reference_min?: number  // Range específico para atletas
  athlete_reference_max?: number
  source_pdf_id: string
}
```

### Protocolo Nutricional (US-03)

```typescript
interface NutritionProtocol {
  athlete_id: string
  type: 'daily' | 'pre_workout' | 'intra_workout' | 'post_workout' | 'carbo_load' | 'race_day'
  name: string
  active: boolean
  kcal_target?: number
  carbs_g?: number
  protein_g?: number
  fat_g?: number
  hydration_ml?: number
  notes: string
}
```

---

## 7. PRIMEIROS PASSOS AUTORIZADOS PARA O AGENTE

O agente está autorizado a iniciar nesta ordem:

```
FASE 1 — Configuração Base
  [ ] Gerar package.json (backend e frontend)
  [ ] Configurar tsconfig.json em ambos
  [ ] Dockerfile (opcional no MVP, mas bem-vindo)
  [ ] Configurar .env.example com todas as variáveis necessárias

FASE 2 — Banco de Dados
  [ ] Schema de migração Prisma para PostgreSQL
  [ ] Tabelas: athletes, performance_metrics, power_curve, health_markers, nutrition_protocols
  [ ] Seed de dados de teste

FASE 3 — Backend Skeleton
  [ ] Rota de healthcheck: GET /health
  [ ] Módulo de autenticação: POST /auth/register | POST /auth/login
  [ ] Estrutura dos módulos: metrics, health, nutrition, data-ingestion

FASE 4 — Frontend Skeleton
  [ ] Layout base com design system FLAV (ver FLAV_VISUAL_GUIDE.md)
  [ ] Rotas: /dashboard, /metrics, /health, /nutrition
  [ ] Componentes base: FlavCard, FlavMetric, FlavButton
```

---

## 8. REFERÊNCIAS CRUZADAS

| Documento | Conteúdo |
|---|---|
| `FLAV_VISUAL_GUIDE.md` | Tokens de cor, tipografia, componentes CSS, regras de UI |
| `FLAV_USER_STORIES.md` | Critérios de aceite, regras de negócio, campos por feature |
| `FLAV_TECH_SPEC.md` | Este documento — arquitetura, stack, estrutura de pastas |

---

*FLAV Tech Spec v1.0 — documento autoritativo para geração de código pelo agente autônomo*
