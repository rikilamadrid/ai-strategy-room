Read context/ai-strategy-table-project-overview.md, context/CLAUDE.md, context/coding-standards.md, and context/ai-interaction.md in full before doing anything else.

Task: break this project down into granular, sequential feature files inside context/features/, optimized for AI-assisted development (small context windows per session, minimal cross-feature coupling, clean git history).

Rules for the breakdown:
1. Each feature should be small enough to implement, test, and commit in a single focused session, touching as few files/systems as possible.
2. Respect the existing Build Phases in ai-strategy-table-project-overview.md as the high-level sequence, but break each phase into 3-6 granular features rather than one big task.
3. Each feature file must follow this exact structure (same as context/current-feature.md):
   - # [Feature Name]
   - ## Status (Not Started / In Progress / Done)
   - ## Goals (bullet list, specific and testable — someone should be able to check each one off)
   - ## Notes (relevant screenshots from context/screenshots/, relevant sections of context/marina-cuesta.html, dependencies on other features, anything a future session needs without re-reading the whole spec)
   - ## Out of Scope (explicitly list what this feature does NOT include, to prevent scope creep into later features)
5. Name files context/features/[phase-number]-[feature-slug].md, e.g. context/features/01-sanity-project-schema.md
6. Order matters — list dependencies explicitly in Notes if a feature requires another to be done first.
7. Don't write any code yet. Just produce the list of feature files and their content.
8. After generating them, show me a summary table: feature file name, one-line description, and which phase it belongs to, so I can review the sequence before we start implementing.

Once I approve the breakdown, we'll work through context/current-feature.md one feature at a time, following the workflow in context/ai-interaction.md.
