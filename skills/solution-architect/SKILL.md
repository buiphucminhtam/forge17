---
name: solution-architect
description: >
  [production-grade internal] Designs system architecture when you need to
  decide tech stack, API contracts, data models, or infrastructure shape.
  Routed via the production-grade orchestrator.
---

### Solution Architect (2026 State-of-the-Art Edition)

#### Protocols
!cat skills/_shared/protocols/ux-protocol.md 2>/dev/null || true
!cat skills/_shared/protocols/input-validation.md 2>/dev/null || true
!cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true
!cat skills/_shared/protocols/code-intelligence.md 2>/dev/null || true
!cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"
!cat .forgewright/codebase-context.md 2>/dev/null || true
!cat .forgewright/mcp-registry.json 2>/dev/null || true

**Fallback (if protocols not loaded):** Use `notify_user` with structured options (never open-ended). Work continuously. Print progress constantly. Validate inputs before starting — classify missing as Critical (stop), Degraded (warn, continue partial), or Optional (skip silently). Use parallel tool calls for independent reads. Use `view_file_outline` before full Read.

#### Brownfield Awareness & Modernization
If `.forgewright/codebase-context.md` exists and mode is brownfield:
*   **READ existing architecture first** — map current patterns, legacy constraints, and API structures.
*   **Design for Composable Architecture** — shift from monolithic structures to Packaged Business Capabilities (PBCs). New architecture extends the system without requiring complete rewrites.
*   **Document via ADRs** — capture existing constraints and incremental migration paths.
*   **AI-Native Integration** — ensure new Agentic workflows (ReAct loops, MCP integrations) securely interface with legacy APIs via Zero Trust principles.
*   **API contracts must be backward-compatible** — enforce strict versioning to prevent breaking downstream dependent systems.

#### Engagement Mode
!cat .forgewright/settings.md 2>/dev/null || echo "No settings — using Standard"

Read `.forgewright/settings.md` at startup. Adapt discovery depth:

| Mode | Discovery Approach |
| --- | --- |
| **Express** | Auto-derive from BRD. Default to modular monoliths, standard Multi-Tenant schemas, and managed AI/Cloud services. |
| **Standard** | 5-7 questions across 2 rounds. Scale sizing + constraints. Includes FinOps baselines and basic Agentic AI requirements. |
| **Thorough** | 12-15 questions across 4 structured rounds. Full capacity planning, FinOps forecasting, Data Sovereignty constraints, and Multi-Agent orchestration trade-offs. |
| **Meticulous** | Everything in Thorough + individual ADR approval, Tech Stack walkthrough, capacity modeling with compute/token cost estimates, and Zero Trust security reviews. |

#### Overview
Full architecture pipeline: from business requirements to a scaffolded, AI-ready, production-grade codebase. The architecture is DERIVED from project constraints (scale, AI compute, team, budget, data sovereignty) — not picked from a template. 

Generates architecture deliverables at the project root (`api/`, `schemas/`, `docs/architecture/`, `agents/`, `mcp/`, project scaffold) with workspace artifacts in `.forgewright/solution-architect/`.

#### Config Paths
Read `.production-grade.yaml` at startup. Use these overrides if defined:
*   `paths.api_contracts` — default: `api/`
*   `paths.adrs` — default: `docs/architecture/architecture-decision-records/`
*   `paths.architecture_docs` — default: `docs/architecture/`
*   `paths.erd` — default: `schemas/erd.md`
*   `paths.migrations` — default: `schemas/migrations/`
*   `paths.tech_stack` — default: `docs/architecture/tech-stack.md`
*   `paths.agents` — default: `agents/` (for Agentic workflows)

#### When to Use
*   Designing an AI-native SaaS product or platform.
*   Planning Composable Architecture (PBCs) or Multi-Agent Systems.
*   Selecting tech stacks for 2026 production systems (eBPF, Vector DBs, MCP).
*   Creating API contracts, Agent-to-Agent (A2A) protocols, and multi-tenant data models.
*   Scaffolding Zero Trust, multi-cloud, or sovereign-cloud environments.
*   Architecture review or modernization of existing systems.

#### Process Flow

#### Phase 1: Discovery & Scale Assessment
The architecture must fit the project's actual 2026 constraints, including AI token budgets and regional compliance. 

##### Step 1: Read Existing Context
Before asking ANY questions, read in parallel:
1. `.forgewright/polymath/handoff/context-package.md`
2. `.forgewright/product-manager/BRD/brd.md`
3. `.forgewright/codebase-context.md`

##### Step 2: Scale & Fitness Interview
Use `notify_user` with structured options. Adapt depth to engagement mode.

**Round 1 — Scale, Tenancy & AI Workloads:**
*   User concurrency, multi-tenant boundaries (shared vs. hybrid vs. isolated), LLM reasoning depth (Single-pass vs. ReAct/Multi-agent).
**Round 2 — Constraints & Sovereignty:**
*   Data sovereignty (localization rules), Zero Trust requirements, budget (FinOps/GreenOps).
**Round 3 (Thorough+) — Technical & Integration:**
*   Legacy integration, MCP (Model Context Protocol) tool exposure, observability needs (eBPF tracing).
**Round 4 (Thorough+) — Strategic:**
*   Growth trajectory (hockey stick, steady), platform engineering (Internal Developer Platform needs).

##### Step 3: Architecture Fitness Function
DERIVE the architecture from constraints.

**Core Architecture Pattern:**
| Scale / Need | Team | -> Pattern |
| --- | --- | --- |
| < 1K users, basic AI | 1-3 people | **Modular Monolith**. Single deploy, shared DB with RLS. Basic LLM wrapper. |
| 1K-100K users | 3-15 people | **Composable Architecture (PBCs)**. Packaged Business Capabilities. Domain-driven. Hybrid multi-tenant data model. |
| 100K+ users | 15+ people | **Cloud-Native / Distributed**. Service mesh (eBPF-based), event-driven. Regional multi-tenancy. |
| Autonomous AI | Any | **Multi-Agent Orchestration**. A2A protocol, MCP tool registry, explicit ReAct loops with memory management. |

**Infrastructure & FinOps Strategy:**
| Budget/Constraint | -> Infrastructure Strategy |
| --- | --- |
| < $500/mo | Serverless-first, managed DB, hosted LLM APIs (OpenAI/Anthropic). |
| $500-5K/mo | Managed K8s (EKS/GKE), hybrid DBs, Vector DBs, Datadog/Grafana, caching. |
| > $5K/mo / Sovereign | Dedicated clusters, BYOC (Bring Your Own Cloud), eBPF (Cilium), local/SLM deployments for AI privacy. |

**Data & Multi-Tenant Architecture:**
| Pattern | -> Strategy |
| --- | --- |
| SaaS Standard | Shared DB, Shared Schema + Row-Level Security (RLS). Tenant-aware JWTs. |
| Enterprise SaaS | Hybrid Multi-Tenant: Shared schema for standard, separate DBs/schemas for enterprise. |
| AI / RAG | Vector/Graph Database paired with relational store. Hybrid search. Provenance tracking. |

**Security & Compliance Impact:**
| Requirement | -> Architecture Changes |
| --- | --- |
| Zero Trust | Continuous identity verification, eBPF-based microsegmentation (Tetragon), MFA, API gateways. |
| Data Sovereignty | Regional multi-tenancy, client-side encryption (CSE), local LLM inference. |
| AI Safety | Input/Output guardrails, PII scrubbing, Agent blast-radius containment, human-in-the-loop (HITL). |

#### Phase 2: Architecture Design
Generate architecture documents in `docs/architecture/`.

##### architecture-decision-records/
Generate ADRs using the standard template:
*   Architecture pattern (Composable PBCs, Modular Monolith, Multi-Agent)
*   Data strategy (Hybrid Multi-Tenancy, Vector/Graph RAG, Data Provenance)
*   Auth & Security (Zero Trust, Tenant-Scoped RBAC, JWT)
*   AI Integration (ReAct loops, MCP adoption, LLM routing)
*   Infrastructure & Observability (eBPF, FinOps scaling)

##### system-diagrams/
Create Mermaid diagrams in markdown files:
*   **C4 Context & Container** — boundaries, microservices/PBCs, Vector DBs, AI agents.
*   **Agent Workflows** — Sequence diagrams for Multi-Agent coordination (A2A) and MCP tool invocation.
*   **Infrastructure Topology** — Multi-cloud/Regional routing and eBPF network planes.

##### Design Principles
Enforce 2026 production patterns:
*   **Zero Trust by Default:** Continuous verification, identity-aware microsegmentation.
*   **Tenant-Aware Everything:** Routing, caching, logging, and auth MUST enforce `tenant_id`.
*   **Agentic Reliability:** Guardrails, strict stopping conditions (max iterations), token budgeting.
*   **Platform Engineering:** Paved roads for developers, automated CI/CD with Shift-Left/Right security (QAOps).

**Present architecture to user via `notify_user` for approval before proceeding.**

#### Phase 3: Tech Stack Selection
Generate `tech-stack.md`:

| Layer | Selection | Rationale |
| --- | --- | --- |
| Core Lang/Framework | Go, Rust, TypeScript, Python (AI) | Performance, AI SDK support, concurrency. |
| AI Orchestration | LangChain, CrewAI, AWS Bedrock | Multi-agent coordination, ReAct loops. |
| AI Tooling / API | Model Context Protocol (MCP) | Standardized tool exposure for agents. |
| Database (Relational) | PostgreSQL (w/ pgvector), AlloyDB | ACID, Row-Level Security for multi-tenancy. |
| Database (AI/Memory) | Pinecone, Weaviate, Neo4j | Vector/Graph RAG, agent long-term memory. |
| Security / Network | Cilium, Tetragon (eBPF) | Zero-overhead observability, kernel-level security. |
| Auth & Identity | WorkOS, Auth0, Keycloak | Tenant-scoped SSO, MFA, RBAC. |
| Observability | OpenTelemetry, Prometheus, Groundcover | eBPF-driven distributed tracing, AI-driven RCA. |

#### Phase 4: API Contract & Agent Protocol Design
Generate API contracts at `api/`:
*   **OpenAPI 3.1 specs** for REST APIs — strict request/response schemas, tenant-aware auth.
*   **MCP Tool Schemas** — JSON schemas defining tool inputs/outputs for AI agents.
*   **A2A (Agent-to-Agent) Specs** — Payload structures for inter-agent delegation and negotiation.
*   **gRPC/AsyncAPI specs** for microservice/event-driven communication.

Standards enforced:
*   `tenant_id` context propagation in all requests (e.g., via JWT claims).
*   Pagination, rate limiting, and idempotency keys for write operations.
*   Standardized error formats with `trace_id`.

#### Phase 5: Data Model Design
Generate data models at `schemas/`:
*   **ERD diagrams** (Mermaid) ensuring strict tenant isolation (all core entities map to a Tenant).
*   **SQL migration files** (numbered, idempotent).
*   **Vector/RAG models** — schemas for embedding storage, metadata filtering, and chunking strategies.
*   **Provenance/Audit trails** — Tracking AI decisions, data lineage, and user mutations.

#### Phase 6: Project Scaffolding
Scaffold the project root structure directly. 

Each service/module includes:
*   `mcp/` or `agents/` directories for AI tool integration and agent loop definitions.
*   Tenant-aware middleware (injecting tenant context into requests/DB sessions).
*   eBPF/Observability hooks (OpenTelemetry).
*   `Dockerfile` (multi-stage, non-root, distroless where possible).
*   Health checks, graceful shutdown, and JSON structured logging.
*   CI/CD GitHub Actions/GitLab pipelines with built-in DevSecOps (SBOMs, SAST/DAST).

#### Output Structure
*   **Deliverables:** `api/`, `schemas/`, `docs/architecture/`, `agents/`, `mcp/`
*   **Workspace Artifacts:** `.forgewright/solution-architect/`

#### Cloud-Specific Patterns (2026)
*   **AWS:** EKS with Cilium CNI, Amazon Bedrock (Managed Agents/Knowledge Bases), RDS/Aurora, Control Tower for multi-tenant governance.
*   **GCP:** GKE with eBPF dataplane, Vertex AI, AlloyDB/Spanner, Cloud Load Balancing for regional multi-tenancy.
*   **Azure:** AKS, Azure OpenAI / AI Studio, Cosmos DB, Front Door.
*   **Hybrid/Sovereign:** BYOC (Bring Your Own Cloud) deployments, Local SLMs/LLMs, Client-Side Encryption (CSE) for data sovereignty.

#### Common Mistakes (2026 Watchlist)
| Mistake | Fix |
| --- | --- |
| Chatbot architecture for multi-step tasks | Implement explicit Agent Loops (ReAct) with max-iteration limits and token budgets. |
| Implicit Multi-Tenancy | `tenant_id` must be a first-class domain object enforced at the database (RLS) and routing layer. |
| Custom API wrappers for Agent Tools | Expose tools via the Model Context Protocol (MCP) standard instead of bespoke APIs. |
| Treating Zero Trust as an add-on | Implement continuous verification and eBPF microsegmentation (Cilium/Tetragon) from day one. |
| Ignoring Data Sovereignty | Design regional multi-tenant cells; use Hybrid architectures for enterprise compliance. |
| Unbounded AI Agent Costs | Bake FinOps controls directly into the architecture (LLM routing, Semantic Caching, execution limits). |
| Microservices for simple apps | Use Composable Architecture / Packaged Business Capabilities (PBCs) or Modular Monoliths first. |
| Manual QA / End-of-cycle Security | Scaffold QAOps and Shift-Left/Right Security (SBOMs, signed artifacts) into the CI/CD pipeline immediately. |
