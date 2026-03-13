---
id: migration
sidebar_label: Migration Guide
title: Migrating from MonoGame.Extended.Tiled
description: A step-by-step guide for migrating from the legacy Tiled-only system to the new format-agnostic tilemap system.
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`. If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

The `MonoGame.Extended.Tiled` namespace has been deprecated in favor of the new `MonoGame.Extended.Tilemaps` system. The new system supports Tiled, LDtk, and Ogmo Editor through a single API and uses a simpler, `SpriteBatch`-based renderer.

:::warning[Deprecated]
`MonoGame.Extended.Tiled` is deprecated and will be removed in a future major version. Begin migrating to `MonoGame.Extended.Tilemaps` to avoid breaking changes in a future release.
:::

## What Changed and Why

The old `MonoGame.Extended.Tiled` system was designed exclusively for the Tiled Map Editor. Its core types (`TiledMap`, `TiledMapTileLayer`, etc.) were tightly coupled to Tiled-specific concepts, making it impossible to support other formats without duplicating the entire system.

The new `MonoGame.Extended.Tilemaps` system introduces a format-agnostic intermediate representation that all format parsers convert to. This means:

- All three formats (Tiled, LDtk, Ogmo) share the same runtime types
- The renderer does not need to know which editor created the map
- Adding support for new formats in the future only requires a new parser

The new renderer is also simpler. The old `TiledMapRenderer` built vertex and index buffers and required manual blend state setup. The new `TilemapSpriteBatchRenderer` uses `SpriteBatch` with the same conventions as the rest of your game code.

## Step 1: Update Namespaces

Replace the old namespace imports with the new ones:

**Before:**
```cs
using MonoGame.Extended.Tiled;
using MonoGame.Extended.Tiled.Renderers;
```

**After:**
```cs
using MonoGame.Extended.Tilemaps;
using MonoGame.Extended.Tilemaps.Rendering;
```

## Step 2: Update the Content Pipeline

The new system uses different importers in the MGCB Editor. Open your `.mgcb` file or the MGCB Editor and update the importer and processor for each tilemap file:

| Setting | Old Value | New Value |
|---------|-----------|-----------|
| Importer | `TiledMapImporter - MonoGame.Extended` | `Tiled Tilemap Importer - MonoGame.Extended` |
| Processor | `TiledMapProcessor - MonoGame.Extended` | `TilemapProcessor - MonoGame.Extended` |

Tileset files (`.tsx`) also need their importer and processor updated:

| Setting | Old Value | New Value |
|---------|-----------|-----------|
| Importer | `TiledMapTilesetImporter - MonoGame.Extended` | (no longer needed as a separate asset) |

:::note
In the new system, external tilesets (`.tsx` files) are loaded automatically by the tilemap importer. You do not need to add them as separate items in the MGCB Editor in most cases. Check your importer output for guidance if external tilesets are not found.
:::

## Step 3: Update Field Declarations

**Before:**
```cs
private TiledMap _tiledMap;
private TiledMapRenderer _tiledMapRenderer;
```

**After:**
```cs
private Tilemap _tilemap;
private TilemapSpriteBatchRenderer _renderer;
```

## Step 4: Update LoadContent

**Before:**
```cs
protected override void LoadContent()
{
    _tiledMap = Content.Load<TiledMap>("maps/level1");
    _tiledMapRenderer = new TiledMapRenderer(GraphicsDevice, _tiledMap);
    _spriteBatch = new SpriteBatch(GraphicsDevice);
}
```

**After:**
```cs
protected override void LoadContent()
{
    _tilemap = Content.Load<Tilemap>("maps/level1");

    _renderer = new TilemapSpriteBatchRenderer();
    _renderer.LoadTilemap(_tilemap);

    _spriteBatch = new SpriteBatch(GraphicsDevice);
}
```

The new renderer does not require a `GraphicsDevice` reference at construction time.

## Step 5: Update the Update Method

**Before:**
```cs
protected override void Update(GameTime gameTime)
{
    _tiledMapRenderer.Update(gameTime);
    base.Update(gameTime);
}
```

**After:**
```cs
protected override void Update(GameTime gameTime)
{
    _renderer.Update(gameTime);
    base.Update(gameTime);
}
```

## Step 6: Update the Draw Method

The old renderer required manual blend state management for transparency. The new renderer handles this through its `BlendState` property.

**Before:**
```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    BlendState previousBlendState = GraphicsDevice.BlendState;
    GraphicsDevice.BlendState = BlendState.AlphaBlend;

    _tiledMapRenderer.Draw(_camera.GetViewMatrix());

    GraphicsDevice.BlendState = previousBlendState;

    base.Draw(gameTime);
}
```

**After:**
```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    // BlendState.AlphaBlend is correct when using the content pipeline
    _renderer.BlendState = BlendState.AlphaBlend;
    _renderer.Draw(_spriteBatch, _camera);

    base.Draw(gameTime);
}
```

:::tip
The default blend state on `TilemapSpriteBatchRenderer` is `BlendState.NonPremultiplied`. When loading through the content pipeline, set it to `BlendState.AlphaBlend` because the content pipeline premultiplies alpha. When using a runtime parser, the default is correct.
:::

## Common API Mappings

### Map Properties

| Old API | New API |
|---------|---------|
| `tiledMap.Width` | `tilemap.Width` |
| `tiledMap.Height` | `tilemap.Height` |
| `tiledMap.TileWidth` | `tilemap.TileWidth` |
| `tiledMap.TileHeight` | `tilemap.TileHeight` |
| `tiledMap.WidthInPixels` | `tilemap.WorldBounds.Width` |
| `tiledMap.HeightInPixels` | `tilemap.WorldBounds.Height` |
| `tiledMap.Orientation` | `tilemap.Orientation` |
| `tiledMap.BackgroundColor` | `tilemap.BackgroundColor` |

### Layer Access

| Old API | New API |
|---------|---------|
| `tiledMap.GetLayer("name")` | `tilemap.Layers["name"]` |
| `tiledMap.GetLayer<TiledMapTileLayer>("name")` | `tilemap.Layers["name"] as TilemapTileLayer` |
| `tiledMap.TileLayers` | `tilemap.Layers` with `is TilemapTileLayer` filter |
| `tiledMap.ObjectLayers` | `tilemap.Layers` with `is TilemapObjectLayer` filter |
| `layer.IsVisible` | `layer.IsVisible` |

### Tile Access

| Old API | New API |
|---------|---------|
| `tileLayer.TryGetTile(x, y, out TiledMapTile? tile)` | `TilemapTile? tile = tileLayer.GetTile(x, y)` |
| `tile.Value.GlobalIdentifier` | `tile.Value.GlobalId` |
| `tile.Value.IsFlippedHorizontally` | `(tile.Value.FlipFlags & TilemapTileFlipFlags.FlipHorizontally) != 0` |
| `tile.Value.IsBlank` | `tile == null` or `!tile.HasValue` |

### Tileset Access

| Old API | New API |
|---------|---------|
| `tiledMap.GetTilesetByTileGlobalIdentifier(gid)` | `tilemap.Tilesets.GetTilesetByGlobalId(gid)` |
| `tiledMap.GetTilesetFirstGlobalIdentifier(tileset)` | `tileset.FirstGlobalId` |

### Object Access

| Old API | New API |
|---------|---------|
| `objectLayer.Objects` | `objectLayer.Objects` |
| `mapObject.Name` | `obj.Name` |
| `mapObject.Position` | `obj.Position` |
| `TiledMapRectangleObject` | `TilemapRectangleObject` |
| `TiledMapEllipseObject` | `TilemapEllipseObject` |
| `TiledMapPolygonObject` | `TilemapPolygonObject` |
| `TiledMapTileObject` | `TilemapTileObject` |

### Properties

| Old API | New API |
|---------|---------|
| `map.Properties.TryGetValue("key", out string val)` | `map.Properties.TryGetValue("key", out TilemapPropertyValue val)` |
| `(string)` property value | `val.AsString()` or `map.Properties.GetString("key", "default")` |

The new properties system is typed. Each property has an explicit type (`String`, `Int`, `Float`, `Bool`, `Color`) rather than storing everything as strings. Use the typed getter methods (`GetString`, `GetInt`, `GetFloat`, `GetBool`, `GetColor`) for safe access with defaults.

### Camera Integration

The old renderer accepted a raw `Matrix` from `_camera.GetViewMatrix()`. The new renderer accepts an `OrthographicCamera` directly and derives the matrix internally, which allows it to apply parallax layer offsets correctly:

**Before:**
```cs
_tiledMapRenderer.Draw(_camera.GetViewMatrix());
```

**After:**
```cs
_renderer.Draw(_spriteBatch, _camera);
```

## Before and After: Complete Example

**Before (old system):**
```cs
using MonoGame.Extended.Tiled;
using MonoGame.Extended.Tiled.Renderers;

public class Game1 : Game
{
    private TiledMap _tiledMap;
    private TiledMapRenderer _tiledMapRenderer;
    private OrthographicCamera _camera;

    protected override void LoadContent()
    {
        _tiledMap = Content.Load<TiledMap>("maps/level1");
        _tiledMapRenderer = new TiledMapRenderer(GraphicsDevice, _tiledMap);
    }

    protected override void Update(GameTime gameTime)
    {
        _tiledMapRenderer.Update(gameTime);
        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.Black);

        BlendState prev = GraphicsDevice.BlendState;
        GraphicsDevice.BlendState = BlendState.AlphaBlend;
        _tiledMapRenderer.Draw(_camera.GetViewMatrix());
        GraphicsDevice.BlendState = prev;

        base.Draw(gameTime);
    }
}
```

**After (new system):**
```cs
using MonoGame.Extended.Tilemaps;
using MonoGame.Extended.Tilemaps.Rendering;

public class Game1 : Game
{
    private Tilemap _tilemap;
    private TilemapSpriteBatchRenderer _renderer;
    private OrthographicCamera _camera;
    private SpriteBatch _spriteBatch;

    protected override void LoadContent()
    {
        _tilemap = Content.Load<Tilemap>("maps/level1");

        _renderer = new TilemapSpriteBatchRenderer();
        _renderer.BlendState = BlendState.AlphaBlend;
        _renderer.LoadTilemap(_tilemap);

        _spriteBatch = new SpriteBatch(GraphicsDevice);
    }

    protected override void Update(GameTime gameTime)
    {
        _renderer.Update(gameTime);
        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.Black);
        _renderer.Draw(_spriteBatch, _camera);
        base.Draw(gameTime);
    }
}
```
