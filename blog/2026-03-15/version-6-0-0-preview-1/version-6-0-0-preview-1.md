---
slug: version-6-0-0-preview-1
title: Version 6.0.0-preview.1 - 2D Geometry and the New Tilemap System
authors: aris
tags: ['updates', 'releases', 'six-oh', 'tilemaps', 'collision']
enableComments: true
---

Hi everyone,

Version 6.0.0-preview.1 of MonoGame.Extended is now available. This is the first preview release in the 6.0.0 cycle, which means it is not a final release and things are still subject to change based on feedback, but it is stable enough to use and experiment with.

Two major features are shipping in this preview. The first is a new 2D geometry covering bounding volumes, geometric primitives, intersection tests, containment queries, and distance computations. The second is the completely rewritten tilemap system that replaces the old `MonoGame.Extended.Tiled` integration with a format-agnostic API that supports Tiled, LDtk, and Ogmo Editor out of the box.

<!-- truncate -->

## 2D Geometry

Back in January I wrote about how the collision work I was doing for MonoGame.Extended had grown into something that felt like it belonged in MonoGame itself rather than exclusively here. I reached out to the MonoGame Foundation, they were on board with the idea, and I submitted a pull request directly to the MonoGame repository with the full implementation.

That PR is still open. The reason it has not been merged yet is not a lack of interest, it is simply a matter of timing. The MonoGame Foundation is currently focused on getting version 3.8.5 out the door, and this is a large PR that deserves a thorough review. It has been pushed back to 3.8.6 to give it the attention it needs.

In the meantime, I am including this implementation in MonoGame.Extended so it can be used, tested, and vetted in real projects while the MonoGame PR works through review. When that PR is merged into MonoGame, this implementation in MonoGame.Extended will be deprecated and removed in favor of the official MonoGame types.

The implementation is based on Christer Ericson's *Real-Time Collision Detection*. Five bounding volume types are provided: `BoundingBox2D`, `BoundingCircle2D`, `BoundingCapsule2D`, `OrientedBoundingBox2D`, and `BoundingPolygon2D`. Three geometric primitive types are also included: `Line2D`, `LineSegment2D`, and `Ray2D`. Every type is a `struct` with no heap allocation overhead.

All types support intersection tests, containment queries, and distance computations against every other type in the suite. For example:

```cs
BoundingBox2D box = new BoundingBox2D(new Vector2(0, 0), new Vector2(100, 100));
BoundingCircle2D circle = new BoundingCircle2D(new Vector2(80, 80), 30f);
Ray2D ray = new Ray2D(new Vector2(0, 50), Vector2.UnitX);

bool boxHitsCircle = box.Intersects(circle);
ContainmentType containment = box.Contains(circle);

if (ray.Intersects(box, out float? tMin, out float? tMax))
{
    Vector2 entryPoint = ray.GetPoint(tMin.Value);
}
```

For the full API including construction helpers, transformation, merging, closest-point queries, and the `Collision2D` static class, see the [2D Geometry documentation](https://monogame-extended.github.io/docs/features/collision/2d-geometry).

---

## New Tilemap System

The old `MonoGame.Extended.Tiled` integration has been replaced by a completely new tilemap system. This has been in progress for well over a year, and it is finally ready enough to ship as a preview.

The fundamental problem with the old system was that it was tightly coupled to the Tiled map editor format. Every API was shaped around Tiled concepts. If you used a different editor, or if your game needed to switch editors later, you were starting from scratch. The new system is format-agnostic. You load a `Tilemap` object, and whether it came from a Tiled `.tmx` file, an LDtk `.ldtk` project, or an Ogmo `.ogmo` file does not matter to the rest of your game code.

Tiled, LDtk, and Ogmo Editor are all supported. All three share the same runtime `Tilemap` type, the same layer access API, the same object and property model, and the same renderers. Maps can be loaded through the content pipeline or at runtime using a format-specific parser.

Two renderers are provided. `TilemapSpriteBatchRenderer` integrates with `SpriteBatch` and performs frustum culling, submitting only tiles visible in the current camera view. `TilemapRenderer` uses `GraphicsDevice` directly and pre-bakes all tile geometry into GPU buffers at load time, which produces fewer draw calls on static maps and supports merging multiple layers into a single draw call via layer groups.

Getting a map on screen is straightforward:

```cs
_tilemap = Content.Load<Tilemap>("maps/level1");

_renderer = new TilemapSpriteBatchRenderer();
_renderer.BlendState = BlendState.AlphaBlend;
_renderer.LoadTilemap(_tilemap);
```

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(_tilemap.BackgroundColor ?? Color.Black);
    _renderer.Draw(_spriteBatch, _camera);
}
```

Beyond rendering, the system provides typed access to tile layers, object layers, image layers, custom properties, and coordinate conversion between tile and world space.

World maps are also supported for multi-room games. A world map loads multiple individual tilemap levels and positions them in a shared coordinate space, which is useful for GridVania-style layouts or any game where the world spans more than one map file. Tiled `.world` files and LDtk projects are supported natively, and a small custom `.tilemapworld` format is provided for editors like Ogmo that do not have a native world file format.

```cs
TilemapWorld world = Content.Load<TilemapWorld>("maps/world");
```

For the full API, see the [Tilemaps documentation](https://monogame-extended.github.io/docs/features/tilemaps).

---

## Migrating from MonoGame.Extended.Tiled

The old `MonoGame.Extended.Tiled` namespace is gone in 6.0.0. The new system has a different API surface, different content pipeline importers, and a different namespace structure, so migration is not a find-and-replace operation. A migration guide covering the most common patterns is available in the documentation:

[https://monogame-extended.github.io/docs/features/tilemaps/migration](https://monogame-extended.github.io/docs/features/tilemaps/migration)

---

## Closing Thoughts

This preview release represents a significant amount of work. The 2D geometry suite and the tilemap system have both been in progress for a long time, and getting them both into a state where I am comfortable calling them preview-ready has taken longer than I originally estimated.

Because this is a preview, I expect there to be rough edges. The API surface may change based on feedback before the final 6.0.0 release. If you run into anything unexpected, or if you have feedback on the API design, please open an issue or start a discussion on GitHub.

As always, thank you to everyone who has continued supporting this project through issue reports, pull requests, Discord questions, and GitHub Sponsors. It makes a real difference.

\- ❤ Chris Whitley (AristurtleDev)
