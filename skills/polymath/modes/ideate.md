# Ideate Mode — Brainstorming and Idea Refinement

Load this mode when the user is exploring ideas, brainstorming possibilities, or trying to crystallize a fuzzy concept into something concrete.

## Entry Behavior

When entering ideation, first understand what already exists:
1. Read `context/decisions.md` for prior conclusions
2. Read `context/domain-research.md` for relevant research
3. If the idea touches a domain, do a quick search_web to ground the brainstorm in reality

Then present the user's idea back to them, refined, with exploration directions.

## Brainstorming Technique

### Step 1: Mirror and Expand

Take the user's fuzzy idea and present it back in 2-3 concrete interpretations:

```python
notify_user with markdown options:
  "question": "I hear [user's idea]. That could go several directions...\n\n"
    "**Interpretation A:** [concrete version 1]\n"
    "**Interpretation B:** [concrete version 2]\n"
    "**Interpretation C:** [concrete version 3]",
  "header": "Shaping the Idea",
  "options": [
    {"label": "Interpretation A resonates (Recommended)", "description": "[brief]"},
    {"label": "Interpretation B is closer", "description": "[brief]"},
    {"label": "Interpretation C is interesting", "description": "[brief]"},
    {"label": "It's a mix — let me explain", "description": "Combine elements"},
    {"label": "Chat about this", "description": "Free-form input"}
  ],
  "multiSelect": false
}])
```

### Step 2: Challenge and Refine

Once a direction is selected, challenge it constructively:

- **"Who specifically needs this?"** — push for concrete user profiles, not abstract personas
- **"What exists today?"** — quick search_web to avoid reinventing existing solutions
- **"What's the simplest version that delivers value?"** — fight scope creep
- **"What makes this different?"** — identify the differentiator

Present each challenge as an option the user can explore or skip.

### Step 3: Crystallize

When the idea has enough shape, present a crystallized version:

```python
notify_user with markdown options:
  "question": "Here's what I think we've landed on:\n\n"
    "**Product:** [one-line description]\n"
    "**For:** [target user]\n"
    "**Core value:** [the one thing that matters most]\n"
    "**Differentiator:** [what makes this unique]\n"
    "**Phase 1 scope:** [minimum viable version]",
  "header": "Crystallized Concept",
  "options": [
    {"label": "That's it — let's move forward (Recommended)", "description": "Ready to hand off or continue refining"},
    {"label": "Close but needs adjustment", "description": "Tweak specific parts"},
    {"label": "The differentiator isn't right", "description": "Rethink what makes this unique"},
    {"label": "Scope is too big / too small", "description": "Adjust the Phase 1 scope"},
    {"label": "Chat about this", "description": "Free-form input"}
  ],
  "multiSelect": false
}])
```

## Devil's Advocate

When you see potential problems, surface them proactively but constructively:

```python
notify_user with markdown options:
  "question": "I want to flag something: [potential issue]. This doesn't kill the idea, but it changes the approach.",
  "header": "Consideration",
  "options": [
    {"label": "Good catch — how do we address it? (Recommended)", "description": "Explore solutions to this challenge"},
    {"label": "I'm aware — it's an acceptable risk", "description": "Proceed knowing the trade-off"},
    {"label": "This changes things — let me rethink", "description": "Revisit the core concept"},
    {"label": "Chat about this", "description": "Free-form input"}
  ],
  "multiSelect": false
}])
```

## Output

Write crystallized concepts to `context/decisions.md`:

```markdown
## Idea: [name] — [date]
Status: Exploring | Crystallized | Handed off

### Concept
[One-paragraph description]

### Key Decisions
- [Decision 1]: [what was decided and why]
- [Decision 2]: [what was decided and why]

### Open Questions
- [What still needs answering]

### Rejected Alternatives
- [Alternative 1]: rejected because [reason]
```
