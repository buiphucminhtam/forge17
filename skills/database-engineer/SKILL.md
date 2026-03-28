---
name: database-engineer
description: >
  [production-grade internal] Designs and optimizes database systems —
  schema design, query optimization, migration management, indexing strategy,
  scaling patterns, and multi-database architecture.
  Routed via the production-grade orchestrator.
---

### Database Engineer

#### Protocols
!cat skills/_shared/protocols/ux-protocol.md 2>/dev/null || true
!cat skills/_shared/protocols/input-validation.md 2>/dev/null || true
!cat skills/_shared/protocols/tool-efficiency.md 2>/dev/null || true
!cat .production-grade.yaml 2>/dev/null || echo "No config — using defaults"
!cat .forgewright/codebase-context.md 2>/dev/null || true

**Fallback (if protocols not loaded):** Use notify_user with options (never open-ended), "Chat about this" last, recommended first. Work continuously. Print progress constantly. Validate inputs before starting — classify missing as Critical (stop), Degraded (warn, continue partial), or Optional (skip silently). Use parallel tool calls for independent reads. Leverage Model Context Protocol (MCP) servers where available for database/schema context retrieval. Use view_file_outline before full Read.

#### Engagement Mode
!cat .forgewright/settings.md 2>/dev/null || echo "No settings — using Standard"

| Mode | Behavior |
| --- | --- |
| **Express** | Fully autonomous. Design schema, write migrations, optimize queries. Implement standard multi-tenant RLS (Row-Level Security) and 2026 FinOps defaults. Report decisions. |
| **Standard** | Surface database engine choice, normalization trade-offs, indexing strategy, and tenant isolation models (Shared vs. Dedicated). Auto-resolve migration patterns. |
| **Thorough** | Present full data model design. Walk through normalization vs. denormalization. Show query plan analysis. Ask about AI/Vector embeddings, data sovereignty, and compliance. |
| **Meticulous** | Walk through each table/collection. User reviews indexes, RLS constraints, and migration scripts. Show capacity projections and FinOps impacts. Discuss sharding, cell-based architecture, and eBPF/observability integrations. |

#### Brownfield Awareness
If `.forgewright/codebase-context.md` exists and mode is brownfield:
*   **READ existing schema and MCP context first** — understand current tables, indexes, constraints, naming conventions, and Object-Relational Mapping (ORM) definitions.
*   **MATCH existing patterns** — maintain casing strategies and legacy data layers.
*   **ZERO-DOWNTIME migrations** — always use expand-contract patterns designed for CI/CD automation pipelines.
*   **PRESERVE existing data & sovereignty** — migrations must be data-safe, reversible, and compliant with local data residency laws.
*   **ANALYZE telemetry** — review eBPF logs, OpenTelemetry traces, or APM data (if accessible) to identify slow queries and bottlenecked instances before optimizing.

#### Conditional Activation
This skill activates when:
1. BRD includes data-intensive features, multi-tenant SaaS requirements, or AI/RAG integrations requiring vector storage.
2. Existing schema needs optimization, scaling, or cost-reduction (FinOps).
3. `production-grade` orchestrator routes to "Migrate" or "Database Design" mode.
4. User explicitly asks for database design, scaling architecture, or query tuning.

#### Overview
Database engineering pipeline for the 2026 Agentic Era: from data requirement analysis through schema design, multi-tenant isolation, index optimization, migration scripting, and cost-aware capacity planning. Produces zero-downtime migration files, optimization reports, vector embedding architectures, and scaling recommendations.

#### Input Classification

| Category | Inputs | Behavior if Missing |
| --- | --- | --- |
| Critical | Data entities/relationships (from BRD), multi-tenancy requirements, or existing schema to optimize | STOP — cannot design without knowing the core data and isolation bounds |
| Degraded | Query patterns, traffic volume, current eBPF/APM performance metrics | WARN — will design for general-purpose performance and standard auto-scaling |
| Optional | Compliance requirements (GDPR, EU AI Act, SOC2), retention policies, FinOps budgets | Continue — use production-grade zero-trust and encryption defaults |

#### Phase Index

| Phase | Purpose |
| --- | --- |
| 1 | Data requirement analysis, engine selection, multi-tenant model selection |
| 2 | Schema design, normalization, Row-Level Security (RLS), constraints |
| 3 | Indexing strategy (including Vector/AI), query optimization |
| 4 | Migration scripts, zero-downtime patterns, IaC 2.0 integration |
| 5 | Scaling architecture, cell-based patterns, capacity planning, FinOps |

#### Process Flow
#### Parallel Execution
After Phase 2 (Schema Design), Phases 3-4 run in parallel:
Wait for both, then run Phase 5 (Scaling) sequentially to ensure scaling plans account for new indexes and migration constraints.

--------------------------------------------------------------------------------

#### Phase 1 — Data Requirement Analysis & Engine Selection
**Goal:** Understand data patterns, define AI/Vector needs, and select database engines & multi-tenancy models.

**Actions:**
1. **Classify data access patterns & Engine Selection:**

| Pattern | Characteristics | Best Engine (2026 Standards) |
| --- | --- | --- |
| **Transactional SaaS / CRUD** | Strong consistency, complex joins, multi-tenant isolation | PostgreSQL (Native RLS), MySQL |
| **Document-oriented** | Flexible schema, nested objects, rapid prototyping | MongoDB, DynamoDB |
| **AI / RAG / Embeddings** | Similarity search, context windows, semantic retrieval | PostgreSQL (`pgvector` standard), Pinecone, Weaviate |
| **Key-value cache** | Fast reads, TTL, token tracking, agent state memory | Redis, Dragonfly |
| **Full-text search / Log Analytics** | Search queries, facets, high-ingest, compliance logging | Elasticsearch, ClickHouse |
| **Time-series** | Append-only, financial ledgers, telemetry | TimescaleDB, InfluxDB |
| **Graph relationships** | Traversals, agent-to-agent routing, social networks | Neo4j, Neptune |

2. **Multi-Tenant Architecture Strategy (SaaS Default):**
   * *Shared DB / Shared Schema:* Highest efficiency. Requires Row-Level Security (RLS) enforcement on all queries via tenant identifiers.
   * *Shared DB / Isolated Schema:* Mid-tier compliance. Limits noisy neighbors. Schema migrations must be orchestrated across all instances.
   * *Dedicated DB per Tenant:* High-compliance (HIPAA, DoD). Maximum isolation. Premium cost footprint.
   * *Hybrid:* Shared schema for standard tiers, dedicated deployments for Enterprise/Regulated tenants.

3. **Data Volume & FinOps Estimation:**

| Scale | Rows/Table | Storage | Architecture & FinOps Considerations |
| --- | --- | --- | --- |
| Small | < 100K | < 1 GB | Managed Serverless DB. Focus on rapid developer experience. |
| Medium | 100K - 10M | 1-50 GB | Connection pooling (PgBouncer) essential. Solid indexing strategy. |
| Large | 10M - 1B | 50-500 GB | Table partitioning. Read replicas. High-cardinality index tuning. |
| Massive | > 1B | > 500 GB | Cell-based architecture. Sharding. Distributed SQL. Cost governance. |

**Output:** Engine selection, multi-tenant strategy, volume/cost estimates, and AI integration plans.

--------------------------------------------------------------------------------

#### Phase 2 — Schema Design
**Goal:** Design the complete database schema with tables, strict multi-tenant constraints, vector storage, and relationships.

**Schema design rules:**
1. **Primary keys:** UUIDs (`uuid_generate_v7()` for sequential indexing/clustering performance) for distributed systems, BIGSERIAL for purely internal mapping.
2. **Timestamps:** Every table gets `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
3. **Soft deletes:** `deleted_at TIMESTAMPTZ NULL` — do not hard-delete unless driven by GDPR right-to-be-forgotten pipelines.
4. **Tenant Isolation (CRITICAL):** `tenant_id UUID NOT NULL` on *every* multi-tenant table. Enable database-level Row-Level Security (RLS) using `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` to prevent cross-tenant data leaks.
5. **AI/Vector Integration:** Embeddings should use standard types (e.g., `embedding vector(1536)`) combined with `tenant_id` to strictly partition context searches.
6. **Naming conventions:**
    * Tables: snake_case, plural (`users`, `order_items`)
    * Columns: snake_case (`first_name`, `created_at`)
    * Foreign keys: `<singular_table>_id` (`user_id`, `tenant_id`)
    * Indexes: `idx_<table>_<columns>` (`idx_orders_tenant_id_created_at`)
    * Constraints: `chk_<table>_<rule>` (`chk_orders_total_positive`)

7. **Normalization guidance:**

| Level | When | Example |
| --- | --- | --- |
| **3NF (default)** | Most OLTP tables — avoid update anomalies | `users`, `orders`, `products` |
| **JSONB / Hybrid** | Agent configurations, dynamic third-party API payloads, metadata | `agent_state`, `webhook_payloads` |
| **Denormalize** | Read-heavy views, reporting queries, cross-tenant metrics | Materialized views, caching layers |

8. **Constraints (Zero-Trust Data Level):**
    * NOT NULL — on every field that must have a value.
    * UNIQUE — on business identifiers scoped to tenant (`UNIQUE(tenant_id, email)`).
    * CHECK — on value boundaries and state transitions.
    * FOREIGN KEY — enforcing referential integrity with ON DELETE constraints.

**Output:** ERD diagram (Mermaid), DDL statements, RLS policies, and constraint documentation.

--------------------------------------------------------------------------------

#### Phase 3 — Indexing Strategy & Query Optimization
**Goal:** Design indexes to support complex queries, AI retrieval, and multi-tenant performance without incurring massive storage overhead.

**Index design rules:**
1. **Index what you query:** Every WHERE clause (always leading with `tenant_id`), JOIN condition, and ORDER BY needs index support.
2. **Composite indexes:** Order by selectivity. For SaaS, `tenant_id` is almost always the first column in the composite index.
3. **Vector Indexing (AI/RAG):** Use HNSW (Hierarchical Navigable Small World) for nearest neighbor searches. Always partition the vector index by `tenant_id` to prevent performance degradation and data leaks.
4. **Partial indexes:** Index only active rows (e.g., `WHERE deleted_at IS NULL AND status = 'ACTIVE'`).
5. **FinOps constraint:** Each index slows writes and costs money in storage. Target 3-5 indexes per table maximum. Drop unused indexes.

**Index type selection:**

| Type | Use Case | PostgreSQL |
| --- | --- | --- |
| **B-tree** (default) | Equality, range, sorting | `CREATE INDEX` |
| **HNSW / IVFFlat** | AI embeddings, Vector Search | `USING hnsw (embedding vector_cosine_ops)` |
| **GIN** | Full-text search, JSONB, array overlaps | `USING gin` |
| **GiST** | Geometric, exclusion ranges | `USING gist` |
| **BRIN** | Massive append-only telemetry/logs | `USING brin` |

**Query optimization checklist:**
1. Run `EXPLAIN ANALYZE` on critical paths. Leverage observability tracing (eBPF) if available.
2. Fix Anti-patterns:
    * **N+1 queries:** Force application-layer JOINs or dataloaders.
    * **Missing Tenant Filters:** Ensure `tenant_id` is applied before complex JOINs.
    * **`SELECT *`:** Select only necessary fields to reduce I/O and network payload.
    * **Vector Search without pre-filtering:** Always pre-filter by `tenant_id` or date before computing cosine similarity.

**Output:** Index definitions, Vector search optimization strategies, EXPLAIN analysis targets.

--------------------------------------------------------------------------------

#### Phase 4 — Migration Management
**Goal:** Generate safe, reversible, zero-downtime migrations ready for automated CI/CD and IaC 2.0 pipelines.

**Migration rules:**
1. **Numbered & Immutable:** `001_create_users.sql`, `002_add_vector_ext.sql` — never modify a committed migration.
2. **Zero-Downtime Expand-Contract Pattern:** Always separate schema changes from data migrations.

| Change | Safe 2026 CI/CD Approach |
| --- | --- |
| **Add column** | Add as NULL/default → background backfill → add NOT NULL constraint in separate migration |
| **Remove column** | Stop reading in app → deploy app → drop column in subsequent DB release |
| **Rename column** | Add new column → sync writes via trigger/app → update app reads → drop old column |
| **Add index** | `CREATE INDEX CONCURRENTLY` (PostgreSQL) — does not lock writes |
| **Enable RLS** | Enable RLS → define default fail-closed policies → deploy policies per role |

3. **Reversible:** Every UP migration must have a tested DOWN migration.
4. **Agentic/Audit-Ready:** Ensure all schema modifications include audit logs for regulatory compliance (SOC2/GDPR).

**Output:** Migration files in `schemas/migrations/`, rollback plans, expand-contract execution guides.

--------------------------------------------------------------------------------

#### Phase 5 — Scaling Architecture, FinOps & Data Sovereignty
**Goal:** Design a robust scaling blueprint addressing multi-region distribution, latency, and cloud costs.

**Scaling patterns:**

| Strategy | When | Complexity |
| --- | --- | --- |
| **Vertical scaling** | Initial growth phase — scale compute until budget limits hit | Low |
| **Connection Pooling** | Multi-service/Serverless connections | Low (PgBouncer, RDS Proxy) |
| **Read Replicas** | Analytics, dashboarding, and >80% read volume | Medium |
| **Cell-Based Architecture** | Massive SaaS scaling. Group tenants into isolated "cells" (fault domains) | High |
| **Data Sovereignty/Localization** | EU AI Act, GDPR strict residency. Regional dedicated instances | High |
| **Sharding** | Massive datasets exceeding single-node vertical limits | Extreme |

**FinOps & Capacity projection:**

| Metric | Current | 10x | 100x | Action at Threshold |
| --- | --- | --- | --- | --- |
| Connections | N | 10N | 100N | Connection pooler; refactor serverless bounds |
| Storage (GB) | X | 10X | 100X | Implement cold-storage tiering / Data lakes |
| Vector Size | V | 10V | 100V | Tune HNSW `m` and `ef_construction`, offload cold vectors |
| Queries/sec | Q | 10Q | 100Q | Read replicas; Cache layer (Redis) |

**Output:** Scaling recommendations, Cell-based routing architectures, Data Sovereignty compliance mapping, FinOps impact summary.

--------------------------------------------------------------------------------

#### Output Structure
**Project Root**
* `schemas/`
  * `erd.md` (Mermaid ERD)
  * `migrations/` (Sequential, zero-downtime UP/DOWN scripts)
* `docs/architecture/`
  * `database-scaling-plan.md`
  * `multi-tenant-isolation-policy.md` (RLS policies)

**Workspace**
* `.forgewright/database-engineer/`
  * `index-analysis.md`
  * `progress.md`

#### Common Mistakes
| Mistake | Fix |
| --- | --- |
| Omitting `tenant_id` or RLS | Mandatory `tenant_id` on all multi-tenant tables. Enable Row-Level Security at the database layer. This prevents catastrophic data leaks. |
| Vector search without pre-filtering | Create composite indexes combining `tenant_id` (B-tree) and `embedding` (HNSW) to ensure similarity search only runs within isolated tenant boundaries. |
| Migrations that lock tables | Use `CONCURRENTLY` for indexes. Use the expand-contract pattern for schema changes. CI/CD pipelines should never apply locking DDL on large production tables. |
| Over-indexing for performance | Indexes consume costly storage. Apply FinOps principles: index only what is necessary, monitor usage, and drop unused indexes. |
| Hard deletes on user data | Use `deleted_at` (soft deletes). Hard deletes break audit trails. Let compliance pipelines (e.g., GDPR wipe scripts) handle actual erasure asynchronously. |
| Connection pool exhaustion | Utilize PgBouncer or managed proxies immediately when dealing with Serverless/Agentic workloads that spin up hundreds of concurrent connections. |
| Business logic in triggers/SPs | Keep complex business logic and AI orchestration in the application layer or Agentic orchestrator. Use DB features for constraints and integrity only. |
| Using auto-increment IDs for APIs | Exposes business volume. Use `UUIDv7` for highly concurrent, index-friendly unique identifiers. |
