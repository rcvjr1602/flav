# FLAV — AI AGENT VISUAL GUIDE
> Versão 1.0 | Performance/Sport Identity System

---

## 1. IDENTIDADE CORE

**Posicionamento:** Central de comando do atleta de endurance — não laboratório, não joalheria. Performance bruta.
**Tom visual:** Agressivo-técnico. Fibra de carbono + neon. Velocidade + precisão analítica.
**Arquétipos de referência:** Ciclismo de alta performance, triatlo, ciclo-computadores (Garmin/Wahoo), jaquetas corta-vento de elite.

---

## 2. PALETA DE CORES

```
/* CSS VARIABLES — use exatamente esses tokens */
--flav-base:       #121214;   /* Cinza Asfalto / Carbono Fosco — fundo primário */
--flav-accent:     #D4FF00;   /* Amarelo Cítrico de Performance — destaque exclusivo */
--flav-support:    #FFFFFF;   /* Branco Óptico — texto e dados críticos */
--flav-mid:        #2A2A2E;   /* Superfícies elevadas (cards, modais) */
--flav-muted:      #6B6B72;   /* Texto secundário / labels inativos */
--flav-danger:     #FF3B30;   /* Alertas críticos apenas */
```

**Regras de uso da paleta:**
- `--flav-base` → sempre o fundo. Nunca branco como base.
- `--flav-accent` → apenas para o que importa: Z5/Z6, limiares, PRs, alertas de nutrição. Não decorativo.
- `--flav-support` → números de cadência, FC, wattagem, tabelas de exames.
- `--flav-mid` → cards de dados, painéis, elementos elevados sobre o fundo.
- Proibido: ouro (#B8960C ou similares), roxo, gradientes pastéis, branco como fundo principal.

---

## 3. TIPOGRAFIA

```
/* Fonte primária — itálico mecânico obrigatório no logotipo e títulos */
font-family: 'Barlow Condensed', 'Bebas Neue', sans-serif;
font-style: italic;        /* SEMPRE em títulos e logotipo */
font-weight: 700 | 800;    /* Bold/ExtraBold para dados e destaques */

/* Fonte de dados / UI */
font-family: 'IBM Plex Mono', 'Roboto Mono', monospace;
font-weight: 400 | 500;    /* Para números, métricas, cadência, FC */
font-variant-numeric: tabular-nums;  /* Evita números "pulando" em tempo real */

/* Corpo / suporte */
font-family: 'Barlow', sans-serif;
font-style: normal;
font-weight: 400 | 500;
```

**Regras tipográficas:**
- Títulos e logotipo: sempre itálico + condensed. Inclinação de 12° é a linguagem visual da marca.
- Dados numéricos (watt, bpm, km/h): sempre monospace + `--flav-accent` ou `--flav-support`.
- Nunca usar Inter, Roboto, Arial, ou qualquer fonte genérica para títulos.
- Hierarquia: dado > rótulo. O número é maior que a label.

---

## 4. LOGOTIPO & SÍMBOLO

**Logotipo FLAV:**
- Tipografia condensed bold + itálico 12° para a direita
- Letras com chanfros diagonais nas extremidades (F e L)
- "A" sem barra horizontal — funciona como ponta de flecha (Λ)
- Cor: `--flav-accent` (#D4FF00) sobre fundo escuro | branco sobre fundos médios

**Símbolo (Isotipo — "Abelha Aerodinâmica"):**
- 3 linhas paralelas angulares que formam silhueta de asas + abdômen
- Motion blur intencional: linhas mais grossas na frente, finas atrás (rastro de velocidade)
- Inclinado — nunca na vertical reta
- Leitura funciona como escudo de equipe de corrida

**Tamanhos mínimos:**
- App icon: 60×60px
- UI inline: 24×24px
- Nunca usar versão colorida sobre fundos claros (apenas preto/cinza)

---

## 5. COMPONENTES UI — PADRÕES

### Cards de Dados
```css
.flav-card {
  background: var(--flav-mid);
  border: 1px solid rgba(212, 255, 0, 0.12);  /* borda accent sutil */
  border-radius: 8px;
  padding: 16px;
}

.flav-card--active {           /* zona de atenção / dado crítico */
  border-color: var(--flav-accent);
  box-shadow: 0 0 12px rgba(212, 255, 0, 0.15);
}
```

### Métricas / Números
```css
.flav-metric {
  font-family: 'IBM Plex Mono', monospace;
  font-size: clamp(2rem, 5vw, 4rem);
  color: var(--flav-support);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.flav-metric--highlight {      /* PRs, limiares, alertas */
  color: var(--flav-accent);
}
```

### Barras de Progresso / Zonas de Potência
```css
.flav-bar {
  height: 6px;
  background: var(--flav-mid);
  border-radius: 2px;
  overflow: hidden;
}

.flav-bar__fill {
  background: var(--flav-accent);
  height: 100%;
  transition: width 0.3s ease-out;
  /* Para zonas críticas (Z5/Z6): */
  box-shadow: 0 0 8px var(--flav-accent);
}
```

### Botões
```css
.flav-btn-primary {
  background: var(--flav-accent);
  color: var(--flav-base);
  font-family: 'Barlow Condensed', sans-serif;
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
}

.flav-btn-ghost {
  background: transparent;
  color: var(--flav-support);
  border: 1px solid var(--flav-muted);
  /* mesmos font e padding */
}
```

---

## 6. MOTION / ANIMAÇÕES

**Filosofia:** Uma entrada bem orquestrada vale mais que 10 micro-interações espalhadas.

```css
/* Entrada padrão de dados (stagger por índice) */
@keyframes flav-reveal {
  from { opacity: 0; transform: translateY(8px) skewX(-2deg); }
  to   { opacity: 1; transform: translateY(0)   skewX(0);     }
}

.flav-data-item {
  animation: flav-reveal 0.3s ease-out both;
  animation-delay: calc(var(--i, 0) * 60ms);  /* --i via JS inline style */
}

/* Pulse para alertas de hidratação/nutrição */
@keyframes flav-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 255, 0, 0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(212, 255, 0, 0); }
}

.flav-alert--live {
  animation: flav-pulse 1.4s ease-in-out infinite;
}
```

**Regras:**
- Transições de dados em tempo real: máximo 300ms, ease-out.
- Skew leve (-2°→0°) reforça o itálico da marca.
- Nunca bounce, never elastic em dados esportivos — precisão sobre charme.

---

## 7. GRID & LAYOUT

```
Layout base: 4-col mobile / 8-col tablet / 12-col desktop
Gutter:       16px mobile | 24px desktop
Border-radius base: 8px (cards) | 4px (botões, inputs) | 2px (barras)
Densidade:    alta — atleta precisa de muita informação visível de uma vez
```

**Padrões de layout:**
- Dashboard: dados numéricos grandes acima, gráficos abaixo
- Hierarquia sempre: Métrica principal → Tendência → Contexto
- Assimetria bem-vinda: coluna de dados grande + coluna de ações menor
- Nada centralizado sem motivo — alinhar à esquerda comunica velocidade

---

## 8. TEXTURAS & EFEITOS DE FUNDO

```css
/* Textura fibra de carbono (fundo de seções especiais) */
.flav-carbon-bg {
  background-color: var(--flav-base);
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.015) 0px,
      rgba(255,255,255,0.015) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255,255,255,0.015) 0px,
      rgba(255,255,255,0.015) 1px,
      transparent 1px,
      transparent 4px
    );
}

/* Glow ambiente (hero sections, splash do app) */
.flav-glow-bg {
  background: radial-gradient(
    ellipse 60% 40% at 50% 0%,
    rgba(212, 255, 0, 0.06) 0%,
    transparent 70%
  ), var(--flav-base);
}
```

---

## 9. APLICAÇÕES POR CONTEXTO

| Contexto | Fundo | Accent | Tipografia | Notas |
|---|---|---|---|---|
| App icon | `--flav-base` | `--flav-accent` | — | Símbolo inclinado |
| Dashboard atleta | `--flav-base` | `--flav-accent` sparingly | Mono para dados | Alta densidade OK |
| Uniforme / print | Branco ou preto | `--flav-accent` | Condensed Italic | Grafismo agressivo |
| Alertas Z5/Z6 | `--flav-mid` | `--flav-accent` + glow | Mono bold | Borda accent ativa |
| Exames / tabelas | `--flav-base` | `--flav-support` | Mono regular | Legibilidade máx. |
| Onboarding / mkt | `flav-glow-bg` | `--flav-accent` | Condensed Italic | Energia, movimento |

---

## 10. O QUE NUNCA FAZER

```
❌ Fundo branco como base
❌ Ouro ou dourado em qualquer elemento
❌ Gradientes de roxo/azul/rosa
❌ Tipografia upright (sem itálico) em títulos
❌ Accent (#D4FF00) como cor decorativa genérica
❌ Ícones arredondados "friendly" — preferir geométrico/angular
❌ Animações com bounce ou elastic
❌ Cards sem bordas no dark mode (merge com fundo)
❌ Fontes: Inter, Roboto, Arial, system-ui em títulos
❌ Logotipo sem inclinação de 12°
```

---

## 11. CHECKLIST RÁPIDO PARA AGENTES

Antes de entregar qualquer UI FLAV, confirme:

- [ ] Fundo é `#121214` ou mais escuro?
- [ ] Accent `#D4FF00` usado com parcimônia (não decorativo)?
- [ ] Tipografia de títulos é condensed + italic?
- [ ] Dados numéricos em monospace + tabular-nums?
- [ ] Animações ≤ 300ms com ease-out?
- [ ] Nenhum elemento em ouro/dourado?
- [ ] Cards com borda sutil (opacity baixa do accent)?
- [ ] Layout denso e funcional (atleta em movimento)?

---

*Guia mantido por: FLAV Design System | Referências visuais: /assets/logo-flav.png, /assets/uniform-flav.png*
