# Content guide

Where game content lives and how it is written. The design itself lives in `docs/GAME_SPEC.md`.

## Where content lives

All content is JSON under `src/content`: dialogue, events, NPC definitions, interactables, maps and
the region pack (place names, currency and other setting strings). It can be edited without touching
game code.

A string a player can read never lives in a `.tsx` component or a Phaser scene file. Components and
scenes look strings up from content.

Content is read through a typed loader that checks each JSON file and narrows its strings to the
unions the spec defines (role, zone and beat ids, statuses), so a typo in a content file fails
loudly instead of slipping through as a loose string. The loader is added together with the first
content file.

## Map authoring

Maps are authored in code, not in a visual editor, so they can be read, diffed and changed without
special tools.

- A map is a 2D array of **named tile constants**, never bare numbers. `Tile.Wall` says what it is;
  `3` does not.
- A single `tiles.ts` defines the tile enum and whether each tile is walkable. Every map imports it.
  There is no second list of tiles anywhere.
- Interactables (a dig spot, an NPC's standing position, the assay office door) are **named
  coordinates exported from the same map module as the grid**. Moving something means editing one
  file.
- Scenes read positions from the map module and never keep their own copy.
- The grid is orthogonal and seen from the top down. Row index is `y`, column index is `x`.

Example shape only; these are generic names, not shipped content:

```ts
// tiles.ts
export const Tile = {
    Floor: 'floor',
    Wall: 'wall',
} as const;
export type Tile = (typeof Tile)[keyof typeof Tile];

export const WALKABLE: Record<Tile, boolean> = {
    [Tile.Floor]: true,
    [Tile.Wall]: false,
};

// exampleMap.ts
import { Tile } from './tiles';

const F = Tile.Floor;
const W = Tile.Wall;

export const grid: Tile[][] = [
    [W, W, W, W],
    [W, F, F, W],
    [W, F, F, W],
    [W, W, W, W],
];

export const spots = {
    entrance: { x: 1, y: 2 },
} as const;
```

## Voice and banned words

The rules for voice, tone, the fictional setting and the words that must never appear on screen live
in one place: the "Content rules" section of `CLAUDE.md` at the repository root. Read it before
writing any player-facing text. The list is kept there only, so it can't drift between copies.
