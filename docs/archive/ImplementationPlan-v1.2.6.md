# Zaizai Isle · Implementation Plan (v1.2.6 Calibration)

## 0. Strategy Overview
Based on **PRD-v1.2.6** and the **Narrative Layer Contract**. 
**Core Philosophy**: Shift from "Me & My Results" to "The Isle & Its Growth". One module at a time. Only "First Perception Layer" (Titles/Labels) modifications.

---

## Phase 1: Identity Anchor Calibration (Identity Card)
- **Status**: Pending
- **Goal**: Change role from "Professional Persona" to "Inhabitant/Architect".
- **Tasks**:
  - [ ] Update `identity.role` in `language-context.tsx`:
    - `zh`: `岛屿架构师 · 逻辑观察者`
    - `en`: `Isle Architect · Logic Observer`
  - [ ] Soften `identity.slogan` to feel like a Law of the Land:
    - `zh`: `每一份构筑，都是这片海域的自然显现。`
    - `en`: `Every build is a natural emergence of this digital sea.`
  - [ ] Review MBTI/Trait tags for "Island tone" (e.g., using icons like `Waves`, `Compass`).

## Phase 2: Structural Asset Redefinition (Works Card)
- **Status**: Pending
- **Goal**: Change "Projects" to "Built Structures".
- **Tasks**:
  - [ ] Rename `page.works.title`:
    - `zh`: `已建成结构`
    - `en`: `Built Structures`
  - [ ] Update `page.works.desc`:
    - `zh`: `岛屿节点的物理扩张与逻辑延伸。`
    - `en`: `Physical expansions and logical extensions of the node.`
  - [ ] Reduce visual weight of project screenshots.

## Phase 3: Trace-based Stats (Stats Card)
- **Status**: Pending
- **Goal**: Change "Achievements" to "System Logs".
- **Tasks**:
  - [ ] Rename `stats.visitors`:
    - `zh`: `登岛频次`
    - `en`: `Isle Arrivals`
  - [ ] Rename `stats.downloads`:
    - `zh`: `节点导出`
    - `en`: `Node Exports`
  - [ ] Styling: Ensure numbers feel like a technical readout rather than a scoreboard.

## Phase 4: Narrative Fusion (Background & Environment)
- **Status**: Pending
- **Goal**: Link weather and ambient states to "Isle Mood".
- **Tasks**:
  - [ ] Update labels in `WeatherCard` to focus on "Atmosphere" rather than "Information".
  - [ ] Ensure `EnvironmentNotes` (Atmosphere Sync) is visible and consistent.

---

## Execution Guard (Self-Check)
1. **Portfolio check**: Does it still look like a CV? If yes -> REVERT.
2. **Self-explanation check**: Is it explaining itself? If yes -> REVERT.
3. **Emotional check**: Is it too poetic/emotional? If yes -> CALM DOWN.
4. **Scope check**: Did you touch content or only labels? If content -> REVERT.
