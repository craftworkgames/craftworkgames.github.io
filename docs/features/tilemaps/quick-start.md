---
id: quick-start
sidebar_label: Quick Start
title: Tilemaps Quick Start
description: Get a tilemap loading and rendering in your MonoGame game in minutes.
---

:::note[Preview release]
This feature is currently only available in the preview release **6.0.0-preview.1**. If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).

Samples are available in the [`version/6.0.0` branch of MonoGame-Extended-Samples](https://github.com/MonoGame-Extended/MonoGame-Extended-Samples/tree/version/6.0.0/src/Tilemaps).
:::

The MonoGame.Extended tilemap system loads and renders maps created with Tiled, LDtk, or Ogmo Editor through a single unified API. This guide shows the minimal steps to get a map rendering on screen using the `TilemapSpriteBatchRenderer`.

:::tip
Two renderers are available. `TilemapSpriteBatchRenderer` integrates directly with `SpriteBatch` and applies frustum culling to submit only visible tiles. `TilemapRenderer` pre-bakes all tiles into GPU vertex buffers and supports layer grouping for fewer draw calls on complex static maps. See the [full usage guide](./tilemaps.md#rendering) for a side-by-side comparison and guidance on when to use each.
:::

## Prerequisites

- A MonoGame project with MonoGame.Extended installed
- Content Pipeline Extensions configured (see [Installation Guide](/docs/getting-started/installation-monogame/#optional-set-up-mgcb-editor))
- A tilemap file created with [Tiled](https://www.mapeditor.org/), [LDtk](https://ldtk.io/), or [Ogmo Editor](https://ogmo-editor-3.github.io/)

## Step 1: Add Your Map to the Content Pipeline

Open the MGCB Editor and add your tilemap file. The importer is selected automatically based on the file extension:

| Format | Extension | Importer                                   |
|--------|-----------|--------------------------------------------|
| Tiled  | `.tmx`    | Tiled Tilemap Importer - MonoGame.Extended |
| LDtk   | `.ldtk`   | LDtk Tilemap Importer - MonoGame.Extended  |
| Ogmo   | `.ogmo`   | Ogmo Tilemap Importer - MonoGame.Extended  |

For Tiled maps, also add any `.tsx` tileset files referenced by the map. Tileset image files (`.png`) should be copied to the content directory but do not need to be added as content items.

:::caution[Ogmo: Level Name is required]
An Ogmo `.ogmo` file is a project file, not a level file. Level data lives in separate `.json` files that the importer discovers automatically. Because a project can contain multiple levels, you must set the **Level Name** processor property to the filename of the level you want to load (without the `.json` extension). If left empty, the first discovered level is used, and file system ordering may not be consistent across platforms.
:::



:::note
The new tilemap system uses different importers from the older `MonoGame.Extended.Tiled` namespace. Make sure you are selecting the importers listed in the table above and not the legacy Tiled importer.
:::

## Step 2: Add Namespaces

Include the tilemap namespaces at the top of your game class:

```cs
using MonoGame.Extended.Tilemaps;
using MonoGame.Extended.Tilemaps.Rendering;
```

You also need the camera namespace for rendering:

```cs
using MonoGame.Extended;
using MonoGame.Extended.ViewportAdapters;
```

## Step 3: Declare Fields

Add fields for the tilemap, renderer, and camera:

```cs
private Tilemap _tilemap;
private TilemapSpriteBatchRenderer _renderer;
private OrthographicCamera _camera;
```

## Step 4: Initialize and Load

Set up the camera in `Initialize` and load the tilemap in `LoadContent`:

```cs
protected override void Initialize()
{
    base.Initialize();

    BoxingViewportAdapter viewportAdapter = new BoxingViewportAdapter(Window, GraphicsDevice, 800, 480);
    _camera = new OrthographicCamera(viewportAdapter);
}

protected override void LoadContent()
{
    base.LoadContent();

    _tilemap = Content.Load<Tilemap>("maps/level1");

    _renderer = new TilemapSpriteBatchRenderer();
    _renderer.LoadTilemap(_tilemap);

    _spriteBatch = new SpriteBatch(GraphicsDevice);
}
```

:::tip
If your tileset textures were loaded through the content pipeline, set the blend state to `BlendState.AlphaBlend`. The default `BlendState.NonPremultiplied` is correct for textures loaded directly from disk by a runtime parser.
:::

## Step 5: Update and Draw

Call `Update` each frame to advance tile animations. Call `Draw` to render the map:

```cs
protected override void Update(GameTime gameTime)
{
    _renderer.Update(gameTime);

    base.Update(gameTime);
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(_tilemap.BackgroundColor ?? Color.Black);

    _renderer.Draw(_spriteBatch, _camera);

    base.Draw(gameTime);
}
```

That is all the code needed to render a map. The renderer handles frustum culling, parallax layers, tile animations, and all flip combinations automatically.

## Drawing Individual Layers

If you need to draw layers in a specific order, for example to interleave game entities between background and foreground layers, use `DrawLayer` or `DrawLayers`:

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    // Draw background layers
    _renderer.DrawLayers(_spriteBatch, _camera, "Background", "Ground");

    // Draw your entities here with a separate SpriteBatch
    DrawEntities();

    // Draw foreground layers on top
    _renderer.DrawLayer(_spriteBatch, _camera, "Foreground");

    base.Draw(gameTime);
}
```

## Moving the Camera

The tilemap renderer uses the `OrthographicCamera` from MonoGame.Extended. Move the camera to scroll the map:

```cs
protected override void Update(GameTime gameTime)
{
    _renderer.Update(gameTime);

    // Follow a player position
    _camera.LookAt(_player.Position);

    base.Update(gameTime);
}
```

For a complete guide to the camera system, see the [Orthographic Camera](../camera/orthographic-camera/orthographic-camera.md) documentation.

## What's Next

- [Full Usage Guide](./tilemaps.md) for layers, objects, properties, and coordinate conversion
- [World Maps](./tilemaps.md#world-maps) for loading multi-room worlds from LDtk, Tiled, or Ogmo
- [Technical Reference](./technical-reference.md) for architecture details and rendering internals
- [Migration Guide](./migration.md) if you are migrating from `MonoGame.Extended.Tiled`
