# PRIMA Design Book — Chapter 6  
# Motion & Interaction System

Version: 1.0  
Status: Core Interaction Standard  
Priority: Critical  
Audience: Product Design · UX · UI · Frontend · QA  
Last Updated: July 2026

**Canon:** [DOCUMENT-000](../product/DOCUMENT-000_PRIMA_MANIFESTO.md) · [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) · [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) · [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) · [Ch.4 Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) · [Ch.5 Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md)  
**Tokens runtime:** `src/styles/prima-design-tokens.css`  
**Accessibility:** [Ch.7 Accessibility](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md)  
**Responsive:** [Ch.8 Responsive & Adaptive](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md)  
**AI interaction:** [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md)  
**Product blueprint:** [Ch.10 Product Blueprint](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md)  
**Surfaces:** [Ch.11 Teacher Desk](./DESIGN_BOOK_CH11_TEACHER_DESK.md) · [Ch.12 Lesson Design Studio](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md)

---

# 0. Objective

Define the complete **interaction and motion language** of PRIMA.

| Motion is | Motion is not |
|-----------|---------------|
| Meaning · orientation · confidence | Decoration · delight theater |
| Invisible support for pedagogy | Entertainment |
| Predictable ecosystem behaviour | One-off screen flourishes |

Every animation, transition, and interaction must:

1. Reduce uncertainty  
2. Reinforce spatial orientation  
3. Support pedagogical work  

Teachers should always feel **in control**.  
The interface should feel **alive, calm, and predictable**.

### Authority

On motion/interaction conflict: **DB-CH06 > local UI convenience.**  
Still subordinate to DOCUMENT-000, DB-CH01 (identity), DB-CH02 (laws).

---

# 1. Motion philosophy

Movement should answer **one of four questions**:

| Question | Example |
|----------|---------|
| **What changed?** | Autosave check · status badge |
| **Where did it go?** | Panel collapse · navigate with continuity |
| **What should I notice?** | Soft tip pulse · validation highlight |
| **What should I do next?** | Primary CTA settle · empty-state guide |

If motion cannot answer one of these, **it should not exist.**

### Design principles

| Principle | Meaning |
|-----------|---------|
| Motion follows pedagogy | Animate teaching meaning, not chrome vanity |
| Interaction follows intention | Teacher starts; feedback follows |
| Transitions preserve context | Same document identity stays spatially coherent |
| Feedback builds confidence | Fast · subtle · honest |
| Consistency creates trust | Same durations/easings everywhere |
| Silence > noise | Prefer no motion over purposeless motion |

### Motion values

**Feel:** Calm · Professional · Elegant · Purposeful · Subtle · Responsive  

**Never:** Playful · Distracting · Exaggerated · Bouncy · Celebratory (confetti)

---

# 2. Motion categories

| Category | Purpose |
|----------|---------|
| Navigation Motion | Page/section continuity |
| State Motion | Idle → hover → focus → … |
| Object Motion | Cards · blocks · DnD |
| Relationship Motion | Highlight linked pedagogical objects |
| Validation Motion | Warn / ok edges — calm |
| AI Motion | Presence · tip appear — never interrupt |
| Publishing Motion | Progress · confirm |
| Recovery Motion | Undo · restore |
| Loading Motion | Skeletons preserve layout |
| Success Motion | Quiet confirmation |
| Error Motion | No shake · explain |

---

# 3. Design tokens (normative)

Extend `prima-design-tokens.css`. Names below are canonical.

## 3.1 Duration

| Token | Value | Use |
|-------|-------|-----|
| `--motion-instant` | 0ms | Reduced-motion snap |
| `--motion-micro` | 100ms | Hover · press |
| `--motion-fast` | 150ms | Card elevate · nav micro |
| `--motion-standard` | 200–220ms | Panels · page chrome · `--prima-motion` |
| `--motion-expand` | 240ms | Card/panel expand · `--prima-motion-expand` |
| `--motion-pulse` | 2400ms | Guiding Star / tip loop (only when meaningful) |
| `--motion-page` | 150–220ms | Page crossfade |

**Hard cap for discrete UI motion:** 250ms (pulse loops excepted).

## 3.2 Delay

| Token | Value | Use |
|-------|-------|-----|
| `--motion-delay-0` | 0ms | Default |
| `--motion-delay-tip` | 80–120ms | Stagger tip fade-in (max 2 items) |
| `--motion-delay-skeleton` | 0ms | Skeletons appear immediately |

Never delay primary feedback >100ms after user action.

## 3.3 Easing

| Token | Curve | Use |
|-------|-------|-----|
| `--ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Most UI |
| `--ease-out` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Enter |
| `--ease-in` | `cubic-bezier(0.4, 0.0, 1, 1)` | Exit (short) |
| `--ease-emphasized` | `cubic-bezier(0.2, 0.0, 0, 1)` | Panel expand |
| `--ease-drag` | spring-like soft · max 12px overshoot | DnD only |

**Forbidden easings:** elastic bounce, back overshoot on buttons, linear long fades.

## 3.4 Distance · opacity · scale · elevation

| Token | Value | Use |
|-------|-------|-----|
| `--motion-rise` | 4–8px | Enter fade+rise |
| `--motion-hover-y` | 2–4px | Card hover lift |
| `--motion-press-scale` | 0.98 | Button press |
| `--motion-fade-from` | 0 → 1 | Enters |
| `--shadow-soft` / `--shadow-hover` | existing | Elevation language |

## 3.5 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --prima-motion: 1ms;
    --prima-motion-expand: 1ms;
    --motion-micro: 1ms;
    --motion-fast: 1ms;
    --motion-standard: 1ms;
    --motion-expand: 1ms;
    --motion-pulse: 0ms; /* disable loops */
  }
}
```

All animations **optional**. Keyboard parity unchanged. SR announcements stay synchronized with state changes (not with animation end when reduced).

---

# 4. Navigation motion

| Spec | Value |
|------|-------|
| Duration | 150–220ms |
| Technique | Crossfade · minimal slide (≤8px) |
| Context | Title · autosave · Guiding Star persist when same journey |
| Forbidden | Full-screen wipes · parallax · dramatic 3D |

Teacher should feel **continuity**, never a new app.

---

# 5. Panel behaviour

| Event | Motion |
|-------|--------|
| Soft expansion | Width/height `--motion-expand` · `--ease-emphasized` |
| Gentle collapse | Same duration · content fades first 80ms |
| Rule | **Content never jumps** — reserve space or crossfade in place |
| PRIMA Zone | Independent scroll · sticky · no layout thrash on tip update |

---

# 6. Card / object motion

| Interaction | Spec |
|-------------|------|
| Hover | 2–4px elevation · 100ms · `--shadow-hover` |
| Selection | Soft border/ring highlight · no bounce |
| Expansion | Vertical growth 240ms · content fade |
| Drag | Elastic follow · drop indicator line |
| Drop | Gentle settle 150–200ms · max 12px overshoot |
| Relationship highlight | Related chips/blocks 280ms opacity/edge |

---

# 7. Button interaction

| Phase | Spec |
|-------|------|
| Hover | Subtle elevation / wash 100–150ms |
| Press | Soft compression scale 0.98 · 120ms |
| Release | Immediate return + action feedback |
| Primary confirm | Clear status (“Salvat” / navigate) — not confetti |

Focus ring always visible for keyboard — motion must not replace focus.

---

# 8. Form interaction

| Event | Spec |
|-------|------|
| Focus | Visible 2px outline/ring · offset 2px |
| Typing | Stable layout — no jumping labels mid-key |
| Validation | Inline · immediate · respectful |
| Errors | **Never shake fields** · muted red edge + text |

---

# 9. AI interaction motion

| Rule | Spec |
|------|------|
| Appear | Fade in 200ms · optional 80ms delay — **never sudden** |
| Presence | Guiding Star pulse 2400ms only if recommendations exist |
| Choice | Teacher initiates open/apply |
| Forbidden | Chat popups · toast storms · takeover modals for tips |

Aligns with PDL Law 8 · DOCUMENT-000 silence preference.

---

# 10. Loading · empty · success · error

### Loading
- Prefer **skeleton screens** matching final layout  
- Avoid spinners for page bodies  
- Preserve layout dimensions  
- Soft pulse on skeletons (disabled under reduced motion → static placeholders)

### Empty states
- Appear gradually (fade 200ms)  
- Invite action · guide (PDL §12)  
- Never feel abandoned  

### Success
Confirm action — do not celebrate excessively.

Examples (RO calm): *Lecție salvată.* · *Material creat.* · *Evaluare publicată.* · *Reflecție înregistrată.*

**Confidence, not excitement.**

### Error
Remain calm. Explain: what · why · what to do. Never blame. Never raw technical jargon.

No shake · no red flash fullscreen.

---

# 11. Microinteractions catalog

| Event | Motion |
|-------|--------|
| Autosave | Tiny check 200ms fade |
| Version saved | Fade confirmation in meta strip |
| Recommendation available | Soft pulse on star/tip edge |
| Publishing | Determinate progress when known |
| Undo | Smooth restoration of prior layout 200ms |
| Search results | Progressive appearance (≤2 stagger steps) |
| Selection | Highlight wash |

Everything subtle.

---

# 12. Transitions between contexts

| Between | Technique |
|---------|-----------|
| Sections | Fade |
| Pages | Context-preserving crossfade |
| Modes (Focus/Review/…) | Morph chrome · canvas persists |
| Objects (relationship) | Soft highlight path |

Every transition helps **orientation**.

---

# 13. Spatial continuity

Objects should appear to **move**, not teleport.

| Rule | Spec |
|------|------|
| Shared element | Prefer continuous transform when identity unchanged |
| Lists reorder | Animate Y positions · 200ms |
| Navigate to block | Scroll + 400ms highlight then settle |
| Cognitive mapping | Keep navigator order stable during edits |

---

# 14. Interaction states (complete matrix)

Every state has **visual · motion · semantic** definition.

| State | Visual | Motion | Semantic |
|-------|--------|--------|----------|
| Idle | Resting elevation | — | Available |
| Hover | Soft lift / wash | 100–150ms | Afford pointer |
| Focus | 2px ring | Instant ring | Keyboard target |
| Pressed | Scale 0.98 / pressed fill | 120ms | Activating |
| Dragging | Ghost + indicator | Track pointer | Reordering |
| Selected | Primary soft + ring | 150ms | Chosen |
| Expanded | Full content | 240ms height | Details open |
| Collapsed | Header only | 220ms | Details hidden |
| Disabled | Muted · no hover lift | None | Not available |
| Loading | Skeleton | Soft pulse or static | Waiting |
| Success | Check / emerald soft | 200ms fade | Completed |
| Error | Muted red + text | Edge fade — no shake | Needs fix |
| Published | Stable emerald badge | None after settle | Delivered |
| Archived | Gray mute | None | Inactive |
| Recommended | Amber soft + optional pulse | Pulse if unread | Optional tip |

---

# 15. Category specifications (summary)

| Category | Duration | Notes |
|----------|----------|-------|
| Navigation | 150–220ms | Crossfade |
| State | 100–150ms | Hover/focus/press |
| Object | 100–240ms | Cards · DnD |
| Relationship | ≤280ms | Highlight only |
| Validation | 280ms edge | Calm amber/red |
| AI | 200ms in · 2400ms pulse | Optional |
| Publishing | Progress-bound | Honest |
| Recovery | 200ms | Undo/restore |
| Loading | Immediate skeleton | Layout stable |
| Success | 200ms | Quiet |
| Error | Edge + copy | No shake |

---

# 16. Performance

| Target | Spec |
|--------|------|
| Frame rate | **60 FPS** target for interactive motion |
| Main thread | Prefer transform/opacity · avoid layout thrash |
| Responsiveness | Motion must never block input >16ms intentionally |
| Devices | Fluid on Desktop · Laptop · Tablet · future mobile |

If performance fails, **remove motion** before reducing pedagogical clarity.

---

# 17. Accessibility

| Requirement | Spec |
|-------------|------|
| Reduced Motion | All non-essential animation off / 1ms |
| Keyboard | Identical task completion · visible focus |
| Screen readers | Announce state changes; don’t wait for animation |
| WCAG | AA · no motion-only information |
| Vestibular safety | No large zooms · no parallax · no spinning |

---

# 18. Anti-patterns (forbidden)

- Bounce  
- Decorative overshoot on CTAs  
- Flash / strobe  
- Large zoom  
- Long fades (>250ms discrete UI)  
- Unpredictable transitions  
- Decorative ambient loops  
- Delayed feedback (>100ms to acknowledge input)  
- Motion without answering the four questions  
- Field shake on error  
- Confetti / celebration theater  
- Chat popup entrances  

---

# 19. Implementation notes

```ts
// Prefer CSS variables
el.style.transition = `transform var(--motion-fast) var(--ease-standard)`;
```

| Concern | Guidance |
|---------|----------|
| React | Prefer CSS transitions; avoid JS springs except DnD |
| DnD | Library OK if easings match `--ease-drag` limits |
| Testing | Assert reduced-motion path · no shake classes |
| Showcase | `/design-system` should demo state × motion matrix |
| Token sync | Keep `--prima-motion` aliases aligned with this chapter |

### Suggested token block (add to CSS)

```css
:root {
  --motion-micro: 100ms;
  --motion-fast: 150ms;
  --motion-standard: 220ms;
  --motion-expand: 240ms;
  --motion-pulse: 2400ms;
  --motion-rise: 6px;
  --motion-hover-y: 3px;
  --motion-press-scale: 0.98;
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
}
```

---

# 20. Design review checklist

Before shipping any motion:

- [ ] Answers What changed / Where / Notice / Next?  
- [ ] ≤250ms (or justified pulse)?  
- [ ] Calm · not playful?  
- [ ] Context preserved across transition?  
- [ ] Reduced-motion safe?  
- [ ] No layout jump?  
- [ ] Feedback <100ms after action?  
- [ ] Matches state matrix?  
- [ ] No anti-patterns?  

---

# Success criteria

Teachers stop noticing animations.

Instead they feel that PRIMA is **intuitive, stable, predictable, and pleasant**.

**Motion becomes invisible support for pedagogy.**
