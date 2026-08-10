# Zaizai Isle Version Upgrade Plan

> Status: Active plan after V1.4.1
> Last Updated: 2026-08-10
> Purpose: Define how Zaizai Isle should grow without drifting into a feature list, portfolio page, or heavy system.

---

## 1. Planning Method

Before deciding what the next version should build, first separate the current island into three inventories:

1. **Functional Inventory**: what already works and should be preserved.
2. **Maintenance Inventory**: what makes the project easier or harder to keep alive.
3. **Narrative Inventory**: what changes the visitor's first understanding of the island.

New work should only enter the roadmap when it answers at least one of these questions:

- Does it make the island easier to maintain?
- Does it make the island's current state clearer?
- Does it reduce noise without reducing character?
- Does it support long-term growth without creating a content-operation burden?

If the answer is only "it adds something interesting", defer it.

---

## 2. Current Functional Inventory

### 2.1 Home Island

The home page is the primary product surface.

Stable modules:

- **Identity Anchor**: identity, avatar, shoebill state interaction, language-aware slogan.
- **Core Build**: current construction state, module grouping, progress visualization.
- **Weather / Environment**: live climate signal, static SVG weather icons, environmental tone.
- **Stats / Social**: lightweight contact and trace signals.
- **Works**: selected built structures, preview modal, external project links.
- **Tools**: AI Hub and local image compressor.
- **Archive / Guestbook**: time traces and low-pressure interaction.
- **System Boundary**: page-level closure and quiet system framing.

Current principle:

- The home island should remain a one-page place, not a portal, dashboard, or portfolio index.

### 2.2 Banana Application

The Banana app is an experimental sub-island with a complete user flow:

- image upload
- image generation
- image understanding
- analysis report generation
- Supabase-backed storage
- gallery/about/FAQ supporting pages

Current risk:

- It has stronger product-app energy than the home island. It should be framed as a built structure or side experiment, not allowed to redefine Zaizai Isle's main identity.

### 2.3 Documentation System

The docs route is already useful as an internal handbook:

- product documentation
- active PRD
- archived PRDs and implementation plans
- TOC navigation
- historical product snapshots

Current opportunity:

- It can become the island's maintenance memory, but should stay quiet and not become a public-facing knowledge base that demands constant publishing.

---

## 3. Current Maintenance Inventory

Strong foundations:

- Next.js static export is stable for GitHub Pages.
- The project has local environment instructions and repeatable commands.
- Visual regression exists for Core Build.
- Weather icons now use static SVG output instead of a JS map.
- High-impact runtime images have WebP variants.

Open maintenance issues:

- Original raster assets still live beside optimized runtime assets.
- Build depends on Supabase environment variables.
- Core Build is still manually updated through config and translation keys.
- Built Structures, Life Passport, and Isle Daily need release-by-release status discipline to avoid registry drift.

---

## 4. Current Narrative Inventory

The current narrative contract is still valid:

- **System Layer**: facts, states, boundaries.
- **Island Layer**: place, rhythm, environment. This is the current dominant layer.
- **Meaning Layer**: rare, short, non-explanatory direction anchors.

Narrative risks to avoid:

- Turning Works into a portfolio gallery.
- Turning Banana into the main product identity.
- Adding more cards just to show more capability.
- Explaining the island too much in visible UI.
- Making the page feel complete rather than growing.

---

## 5. Recommended Version Path

### V1.3: Maintenance Memory

Goal:

- Make the island easier to keep alive without changing what visitors first experience.

Scope:

- Document asset-generation commands and when to use them. (Done in V1.3.0)
- Add a lightweight maintenance checklist for release work. (Done in V1.3.0)
- Clean up known lint warnings in Banana where low-risk. (Done in V1.3.0)
- Decide source-vs-runtime asset policy. (Done in V1.3.0)
- Add a small bundle or asset size check script if it can stay simple.

Non-goals:

- No new homepage module.
- No new major visual system.
- No new page hierarchy for the home island.
- No analytics dashboard or admin system.

Success criteria:

- A future agent can safely regenerate assets, run checks, and understand what changed.
- The work reduces maintenance load without changing the island's first impression.

### V1.4: Built Structures Refinement

Status: Completed in V1.4.0 (2026-08-07)

Goal:

- Clarify how side experiments such as Banana relate to the island.

Scope:

- Reframe Works as "built structures" more consistently. (Done)
- Improve how Banana is linked, previewed, and described from the home island. (Done)
- Add lightweight status metadata for built structures: stable, experimental, archived. (Done)
- Move project metadata into a small config file instead of hardcoding it in the card. (Done)
- Add filtering only after the registry grows beyond six active structures.
- Register Life Passport as an experimental island structure. (Done)
- Add Isle Daily as a quiet living-state surface without feed mechanics. (Done)

Non-goals:

- No full portfolio rewrite.
- No project index page unless the home island becomes too crowded.
- No heavy CMS.

Success criteria:

- Visitors understand Banana as a constructed structure on the island, not a separate brand replacing it.
- Works feels curated, not expansive.

### V1.5: Living State

Goal:

- Make the island's "currently growing" state clearer through existing surfaces.

Scope:

- Improve Core Build milestones and status language.
- Connect maintenance changes to visible construction state only where appropriate.
- Consider exposing "last build pulse" or "current forming area" in Core Build.
- Keep all text short and system-like.

Non-goals:

- No activity feed.
- No changelog card on the home page.
- No public roadmap board.

Success criteria:

- The page feels alive without feeling busy.
- The visitor can sense what is forming without reading documentation.

### V2.0: System Phase

V2.0 should not begin until V1.x maintenance starts to feel insufficient.

Entry criteria:

- Manual updates to modules, docs, assets, and release notes repeatedly create drift.
- The island has enough built structures that config-driven organization becomes necessary.
- The cost of remembering the system exceeds the cost of building a small system.

Possible scope:

- Structured content registry for modules and built structures.
- Automated release note scaffolding.
- Asset manifest generation.
- Internal build-state model shared by docs and Core Build.

Non-goals:

- No CMS unless manual upkeep is clearly failing.
- No social/content platform mechanics.
- No admin dashboard for its own sake.

---

## 6. Recommended Next Step

V1.4.0 has completed the first Built Structures slice:

- config-driven structure metadata and stable / experimental / archived states
- clearer internal and external link behavior
- Banana ownership and return path
- Life Passport as an experimental structure
- Isle Daily as a quiet living-state surface
- current documentation map and Node 25 GitHub Pages alignment

The next concrete version should be:

**V1.5.0: Living State**

First planning slice:

1. Audit Core Build status against the real structure registry.
2. Decide whether a single “current forming area” can replace manually repeated status copy.
3. Keep Life Passport and Isle Daily internal versions independent from the site version.
4. Avoid new homepage cards; refine existing surfaces first.

This keeps the island alive through accurate state, not through more visible activity.
