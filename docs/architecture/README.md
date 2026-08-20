# Architecture

[← Back to the main README](../../README.md)

This portfolio uses a **configuration-first App Router architecture**. I keep content and identity in typed data, derive the public surfaces from that data, and add client-side behavior only where the browser is part of the feature.

```text
typed config
   ├──► project index
   ├──► /home/work/[slug]
   ├──► previous / next navigation
   └──► metadata, Open Graph cards, and sitemap
```

## `01` Rendering model

Next.js renders the content-heavy route shells and metadata on the server. Interaction-heavy features—command search, transitions, inspectors, lightboxes, shaders, and persisted preferences—live in focused client components. Optional or expensive tools are dynamically loaded instead of becoming part of every initial route.

This gives me a practical boundary:

```text
server owns   content · route generation · metadata · structured data
client owns   interaction · local state · animation · browser APIs · WebGL
```

## `02` Typed, data-driven case studies

[`lib/projects.config.ts`](../../lib/projects.config.ts) is the source of truth for project order, cards, technologies, case-study sections, static slugs, and adjacent-project navigation. The dynamic route uses `generateStaticParams`, while one block renderer handles the long-form content model.

A simplified view of the discriminated union looks like this:

```ts
type Block =
  | { type: "paragraph"; text: string }
  | { type: "metrics"; items: { value: string; label: string }[] }
  | { type: "diagram"; kind: "photography-pipeline" | "photo-delivery" }
  | { type: "demo"; id: string };
```

That pattern gives each content block a predictable renderer and compile-time checks. It also lets a case study mix editorial content, measured results, technical diagrams, and live React demos without turning the route into one large custom component.

## `03` Shared configuration

I use small, focused configuration modules rather than repeating values across components:

| Source | Responsibility |
| --- | --- |
| [`profile.config.ts`](../../lib/profile.config.ts) | Canonical identity and public profile information |
| [`home.config.ts`](../../lib/home.config.ts) | Navigation, route order, and derived section ordinals |
| [`projects.config.ts`](../../lib/projects.config.ts) | Project cards, case studies, ordering, and project routes |
| [`theme.config.ts`](../../lib/theme.config.ts) | Theme defaults, accent palettes, and pre-paint behavior |
| [`seo.ts`](../../lib/seo.ts) | Metadata helpers and structured-data entities |

## `04` Discoverability is part of the architecture

The repository generates canonical metadata, route-specific Open Graph images, Twitter cards, Person/WebSite JSON-LD, case-study breadcrumbs, a sitemap, robots rules, a web manifest, and `llms.txt`. These outputs reuse the same profile and project data as the visible interface, so discoverability does not become a second copy of the content model.

## Coding practices

- Keep one owner for shared data, then derive consumers from it.
- Prefer pure helper functions for ordering, selection, layout, persistence, and animation math.
- Keep server and client boundaries explicit instead of marking entire route trees as client-rendered.
- Dynamically load optional browser-heavy features.
- Use semantic CSS variables and shared typography roles instead of route-specific magic values.
- Add focused regression tests next to the behavior they protect.
- Require strict TypeScript, warning-free ESLint, tests, and a production build before publishing.

## Relevant folders

```text
app/                         route composition and metadata entry points
app/home/work/[slug]/        statically generated case-study route
components/casestudy/        block rendering, navigation, diagrams, and demos
components/home/             portfolio sections and project index
lib/                         content models, configuration, SEO, and helpers
```

Next: [Interaction engineering →](../interactions/README.md)
