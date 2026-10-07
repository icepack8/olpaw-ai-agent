# OLPaw AI Agent 🐱

## AI-Assisted Feline Health Risk Analysis

OLPaw AI Agent is a Chainlink CRE workflow prototype designed to analyze structured feline genetic and medical data and produce an evidence-aware Health Risk Score with personalized care recommendations.

### How It Works

```text
Cat DNA + Medical Data
          ↓
    Chainlink CRE
          ↓
   Risk Assessment
          ↓
   Health Risk Score
          ↓
 Personalized Recommendations
```

The risk score is generated deterministically from structured inputs. Genetic findings include evidence level and breed relevance so that genetic associations are not treated as automatic diagnoses.

## Current Features

* Feline genetic risk analysis
* Breed-specific genetic relevance
* Medical screening signals
* Evidence-aware risk factors
* Health Risk Score from 0–100
* Risk classification
* Personalized care recommendations
* Veterinary review flag
* Chainlink CRE workflow integration
* Automated workflow simulation
* TypeScript test coverage

## Example

For the included demonstration cat:

```text
Cat: Milo
Breed: Maine Coon

Genetic Finding:
MYBPC3 p.A31P
Heterozygous
High evidence

Health Risk Score: 8/100
Risk Level: LOW
Evidence Quality: HIGH
Veterinary Review Required: false
```

Example recommendations:

```text
Discuss cardiovascular evaluation with a qualified veterinarian.

Monitor resting respiratory rate and document persistent changes.
```

## Project Structure

```text
olpaw-ai-agent/
├── main.ts
├── main.test.ts
├── types.ts
├── risk-engine.ts
├── recommendations.ts
├── config.staging.json
├── config.production.json
├── workflow.yaml
├── package.json
└── tsconfig.json
```

## Run Locally

Install dependencies:

```bash
bun install
```

Run type checking:

```bash
bun run typecheck
```

Run tests:

```bash
bun test
```

Simulate the CRE workflow:

```bash
cre workflow simulate ./olpaw-ai-agent --target=staging-settings
```

## Safety

This project is a health-risk screening prototype and is **not a veterinary diagnostic system**.

A genetic finding or calculated risk score does not establish that a cat has a disease. Results should be interpreted together with appropriate veterinary evaluation and clinical evidence.

## Technology

* TypeScript
* Bun
* Chainlink Runtime Environment (CRE)
* Chainlink CRE SDK
* Deterministic risk assessment
* Evidence-aware genetic interpretation
