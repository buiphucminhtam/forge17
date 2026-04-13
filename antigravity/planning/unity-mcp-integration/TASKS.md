# Unity-MCP Integration Tasks

## Phase 1: Skill Updates (P0)

### Task 1.1: Update unity-engineer/SKILL.md
**File:** `skills/unity-engineer/SKILL.md`  
**Status:** ⬜ Pending  
**Priority:** P0  
**Time:** 30-45 min

**Changes:**
1. Add section "## Integration với Unity-MCP" trước "## Common Mistakes"
2. Add prerequisites subsection
3. Add tool mapping table
4. Add combined workflow diagram
5. Add when to use / when not to use guidance

**Acceptance Criteria:**
- [ ] Prerequisites clearly stated
- [ ] Tool mapping table with 6+ entries
- [ ] Combined workflow diagram present
- [ ] Clear guidance on when to use Unity-MCP tools

---

### Task 1.2: Update unity-shader-artist/SKILL.md
**File:** `skills/unity-shader-artist/SKILL.md`  
**Status:** ⬜ Pending  
**Priority:** P0  
**Time:** 20-30 min

**Changes:**
1. Add section "## Visual Feedback với Unity-MCP" ở cuối
2. Add screenshot tools table
3. Add shader iteration workflow
4. Reference screenshot tools for verification

**Acceptance Criteria:**
- [ ] Screenshot tools documented
- [ ] Shader iteration workflow clear
- [ ] Visual feedback loop explained

---

### Task 1.3: Update unity-multiplayer/SKILL.md
**File:** `skills/unity-multiplayer/SKILL.md`  
**Status:** ⬜ Pending  
**Priority:** P0  
**Time:** 20-30 min

**Changes:**
1. Add section "## Network Testing với Unity-MCP" ở cuối
2. Add network-specific tools table
3. Add network scene setup workflow

**Acceptance Criteria:**
- [ ] Multiplayer testing tools documented
- [ ] Network scene setup workflow clear

---

## Phase 2: Documentation & MCP Generator (P1)

### Task 2.1: Update AGENTS.md
**File:** `AGENTS.md`  
**Status:** ⬜ Pending  
**Priority:** P1  
**Time:** 10 min

**Changes:**
1. Add Unity-MCP integration note to Unity Engineer entry
2. Update description to mention Unity-MCP

**Acceptance Criteria:**
- [ ] Unity Engineer entry mentions Unity-MCP
- [ ] Integration clear to users

---

### Task 2.2: Update MCP Generator Skill
**File:** `skills/mcp-generator/SKILL.md`  
**Status:** ⬜ Pending  
**Priority:** P1  
**Time:** 20-30 min

**Changes:**
1. Add Unity project detection section
2. Add Unity-MCP config generation logic
3. Add Unity-specific tools reference

**Acceptance Criteria:**
- [ ] Unity project detection logic present
- [ ] MCP config generation for Unity-MCP documented

---

### Task 2.3: Create Setup Guide
**File:** `docs/unity-mcp-setup.md` (NEW)  
**Status:** ⬜ Pending  
**Priority:** P1  
**Time:** 30-45 min

**Content:**
1. Installation section (CLI + Plugin)
2. Configuration for different AI agents
3. Usage examples
4. Troubleshooting section
5. Platform-specific notes (macOS/Windows/Linux)

**Acceptance Criteria:**
- [ ] Installation steps clear
- [ ] Configuration examples for Claude/Cursor/Gemini
- [ ] Troubleshooting section present
- [ ] Platform differences documented

---

## Phase 3: Advanced Features (P2)

### Task 3.1: Add Runtime AI Section
**File:** `skills/unity-engineer/SKILL.md`  
**Status:** ⬜ Pending  
**Priority:** P2  
**Time:** 20-30 min

**Changes:**
1. Add section "## Runtime AI (In-Game)" sau integration section
2. Add use cases table
3. Add implementation pattern
4. Add when to use / when not to use guidance

**Acceptance Criteria:**
- [ ] Runtime AI use cases documented
- [ ] Implementation pattern clear
- [ ] Decision guidance present

---

### Task 3.2: Create Tools Quick Reference
**File:** `docs/unity-mcp-tools-reference.md` (NEW)  
**Status:** ⬜ Pending  
**Priority:** P2  
**Time:** 45-60 min

**Content:**
1. Tool categories overview
2. Full tool list with descriptions
3. Forgewright use case mapping
4. Extension tools (Animation, Particle, ProBuilder)

**Acceptance Criteria:**
- [ ] All 100+ tools referenced
- [ ] Forgewright use case for each category
- [ ] Extension tools documented

---

## Phase 4: Testing (P3)

### Task 4.1: Integration Verification
**Status:** ⬜ Pending  
**Priority:** P3  
**Time:** 30-60 min

**Verification Steps:**
1. Read through all updated skills
2. Verify tool mapping accuracy
3. Check documentation consistency
4. Review formatting and clarity

**Acceptance Criteria:**
- [ ] All skills readable
- [ ] Tool mappings accurate
- [ ] No broken links or references
- [ ] Formatting consistent

---

## Task Dependencies

```
Task 1.1 ──┐
            ├──► Phase 1 Complete ──► Phase 2 (sequential)
Task 1.2 ──┤                                     │
Task 1.3 ──┘                                     ▼
                                              Task 2.1 ──► Phase 3 ──► Phase 4
                                              Task 2.2
                                              Task 2.3
```

## Time Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 3 tasks | 1h 10m - 1h 45m |
| Phase 2 | 3 tasks | 1h - 1h 25m |
| Phase 3 | 2 tasks | 1h 5m - 1h 30m |
| Phase 4 | 1 task | 30m - 1h |
| **Total** | **9 tasks** | **3h 45m - 5h 40m** |

---

## Checklist for Completion

- [ ] Task 1.1: unity-engineer updated
- [ ] Task 1.2: unity-shader-artist updated
- [ ] Task 1.3: unity-multiplayer updated
- [ ] Task 2.1: AGENTS.md updated
- [ ] Task 2.2: MCP generator updated
- [ ] Task 2.3: Setup guide created
- [ ] Task 3.1: Runtime AI section added
- [ ] Task 3.2: Tools reference created
- [ ] Task 4.1: Integration verified
