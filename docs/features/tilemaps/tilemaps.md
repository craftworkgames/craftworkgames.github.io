---
id: tilemaps
sidebar_label: Tilemaps
title: Tilemaps
description: Load and render tilemap files from Tiled, LDtk, and Ogmo Editor using a single unified API.
---

:::note[Preview release]
This feature is currently only available in the preview release **6.0.0-preview.1**. If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).

Samples are available in the [`version/6.0.0` branch of MonoGame-Extended-Samples](https://github.com/MonoGame-Extended/MonoGame-Extended-Samples/tree/version/6.0.0/src/Tilemaps).
:::

The `MonoGame.Extended.Tilemaps` namespace provides a format-agnostic tilemap system that loads and renders maps from Tiled, LDtk, and Ogmo Editor. All three formats share a single runtime API, so you can switch editors without rewriting your game code.

## Supported Formats

| Format | Extension | Orientations |
|--------|-----------|--------------|
| [Tiled Map Editor](https://www.mapeditor.org/) | `.tmx` | Orthogonal, Isometric, Staggered, Hexagonal |
| [LDtk](https://ldtk.io/) | `.ldtk` | Orthogonal |
| [Ogmo Editor](https://ogmo-editor-3.github.io/) | `.ogmo` | Orthogonal |

All formats support tile layers, object layers, image layers, custom properties, and tile animations where the format itself supports them.

## Loading a Tilemap

### Via the Content Pipeline (Recommended)

The content pipeline bakes your tilemap at build time. Add the map file to the MGCB Editor and load it at runtime using `ContentManager`:

```cs
Tilemap tilemap = Content.Load<Tilemap>("maps/level1");
```

For Tiled maps, add both the `.tmx` map file and any referenced `.tsx` tileset files to the MGCB Editor. Tileset image files (`.png`) should be placed in the content directory maintaining their relative paths but do not need to be added as content items.

### Via a Runtime Parser

If you need to load map files at runtime without the content pipeline, use the format-specific parser directly. The parser reads the file and its referenced textures from disk:

```cs
using MonoGame.Extended.Tilemaps.Parsers;
using MonoGame.Extended.Tilemaps.Tiled;

ITilemapParser parser = new TiledTmxParser();
Tilemap tilemap = parser.ParseFromFile("Content/maps/level1.tmx", GraphicsDevice);
```

```cs
using MonoGame.Extended.Tilemaps.LDtk;

ITilemapParser parser = new LDtkJsonParser();
Tilemap tilemap = parser.ParseFromFile("Content/maps/world.ldtk", GraphicsDevice);
```

:::tip
When using runtime parsers, textures are loaded directly from PNG files and their alpha has not been premultiplied. The renderer default `BlendState.NonPremultiplied` is correct for this case. When using the content pipeline, set `BlendState = BlendState.AlphaBlend` because the pipeline premultiplies alpha.
:::

## Basic Map Properties

After loading, the `Tilemap` object exposes the core properties of the map:

```cs
Console.WriteLine($"Map size:  {tilemap.Width} x {tilemap.Height} tiles");
Console.WriteLine($"Tile size: {tilemap.TileWidth} x {tilemap.TileHeight} pixels");
Console.WriteLine($"World bounds: {tilemap.WorldBounds}");
Console.WriteLine($"Orientation: {tilemap.Orientation}");

if (tilemap.BackgroundColor.HasValue)
{
    GraphicsDevice.Clear(tilemap.BackgroundColor.Value);
}
```

## Rendering

MonoGame.Extended provides two renderers with different performance characteristics. Understanding the trade-offs helps you choose the right one for your game.

### Choosing a Renderer

| Feature | `TilemapSpriteBatchRenderer` | `TilemapRenderer` |
|---------|------------------------------|-------------------|
| Rendering backend | `SpriteBatch` | `GraphicsDevice` directly |
| Tile submission | Only visible tiles (frustum culled) | All tiles pre-baked into GPU buffers |
| Draw calls per layer | One per tile (batched per Begin/End) | One per texture per group |
| Layer grouping | No | Yes (`DefineLayerGroup`) |
| Dynamic tile changes | Instant (no rebuild) | Requires `MarkGroupDirty` |
| Mixed drawing with SpriteBatch | Native: just call Draw before/after | Requires `SaveGraphicsDeviceState` |
| Disposable | No | Yes (holds GPU buffers) |

**Use `TilemapSpriteBatchRenderer` when:**
- Your map has large off-screen areas relative to the visible area; frustum culling avoids submitting invisible tiles
- You frequently modify tiles at runtime; changes take effect immediately without rebuilding anything
- Your rendering code is already SpriteBatch-based and you want straightforward integration
- You want the simplest possible setup with minimal lifecycle concerns

**Use `TilemapRenderer` when:**
- Your map is mostly static and most tiles are visible at once; the GPU buffer approach produces fewer draw calls at the cost of always submitting all tiles
- You have many layers and want to merge several of them into a single draw call using layer groups
- Profiling confirms that draw call count is a bottleneck

:::note
Because `TilemapRenderer` pre-bakes all tile vertices into GPU buffers at load time, the total primitive count submitted each frame is higher than `TilemapSpriteBatchRenderer` when large portions of the map are off-screen. The GPU buffer approach trades primitive throughput for fewer CPU draw call dispatches. On maps where most tiles are visible, this is a clear win. On large open-world maps where only a small viewport is visible, the SpriteBatch renderer's frustum culling may outperform it.
:::

---

## TilemapSpriteBatchRenderer

The `TilemapSpriteBatchRenderer` draws tiles by issuing one `SpriteBatch.Draw` call per visible tile. It handles frustum culling, parallax batching, animations, and all flip combinations automatically.

### Setup

```cs
private TilemapSpriteBatchRenderer _renderer;
private SpriteBatch _spriteBatch;

protected override void LoadContent()
{
    _tilemap = Content.Load<Tilemap>("maps/level1");

    _renderer = new TilemapSpriteBatchRenderer();
    _renderer.BlendState = BlendState.AlphaBlend; // for content pipeline textures
    _renderer.LoadTilemap(_tilemap);

    _spriteBatch = new SpriteBatch(GraphicsDevice);
}
```

### Drawing All Layers

```cs
protected override void Update(GameTime gameTime)
{
    _renderer.Update(gameTime);
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    _renderer.Draw(_spriteBatch, _camera);
}
```

### Interleaving Entities Between Layers

`DrawLayers` and `DrawLayer` let you draw a subset of layers and inject your own rendering in between:

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    // Draw background tile layers
    _renderer.DrawLayers(_spriteBatch, _camera, "Background", "Ground");

    // Draw entities in world space with their own SpriteBatch call
    _spriteBatch.Begin(transformMatrix: _camera.GetViewMatrix());
    foreach (var entity in _entities)
    {
        entity.Draw(_spriteBatch);
    }
    _spriteBatch.End();

    // Draw foreground tile layer on top
    _renderer.DrawLayer(_spriteBatch, _camera, "Foreground");
}
```

The `TilemapSpriteBatchRenderer` manages its own `Begin/End` calls internally, so there is no conflict with your own `SpriteBatch` usage as long as you do not call `Begin` on the same `SpriteBatch` instance while the renderer is mid-batch.

### Configuration Properties

| Property | Default | Description |
|----------|---------|-------------|
| `BlendState` | `NonPremultiplied` | Use `AlphaBlend` for content pipeline textures |
| `SamplerState` | `PointClamp` | `PointClamp` for pixel art; `LinearClamp` for smooth filtering |
| `SpriteSortMode` | `Deferred` | Sort mode for each `SpriteBatch.Begin` call |
| `Effect` | `null` | Optional custom shader applied to all layers |

---

## TilemapRenderer

The `TilemapRenderer` uses `GraphicsDevice` directly. At load time it bakes all tile vertices and UV coordinates into static GPU vertex and index buffers. At draw time those buffers are submitted in bulk, producing very few draw call dispatches regardless of how many tiles the map contains.

Because it holds GPU resources, `TilemapRenderer` implements `IDisposable`. Call `Dispose()` when you are done with it.

### Setup

```cs
private TilemapRenderer _tilemapRenderer;

protected override void LoadContent()
{
    _tilemap = Content.Load<Tilemap>("maps/level1");

    _tilemapRenderer = new TilemapRenderer(GraphicsDevice);
    _tilemapRenderer.BlendState = BlendState.AlphaBlend; // for content pipeline textures
    _tilemapRenderer.LoadTilemap(_tilemap);

    _spriteBatch = new SpriteBatch(GraphicsDevice);
}

protected override void UnloadContent()
{
    _tilemapRenderer?.Dispose();
    base.UnloadContent();
}
```

### Drawing All Layers

The simplest usage calls `Draw(camera)`, which draws all layers in map order:

```cs
protected override void Update(GameTime gameTime)
{
    _tilemapRenderer.Update(gameTime);
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    _tilemapRenderer.Draw(_camera);
}
```

### Layer Groups

Layer groups let you merge multiple tile layers into a single draw call. This is the primary performance feature of `TilemapRenderer`. Define groups once after loading the tilemap:

```cs
protected override void LoadContent()
{
    _tilemap = Content.Load<Tilemap>("maps/level1");

    _tilemapRenderer = new TilemapRenderer(GraphicsDevice);
    _tilemapRenderer.BlendState = BlendState.AlphaBlend;
    _tilemapRenderer.LoadTilemap(_tilemap);

    // Merge all background layers into a single draw call
    _tilemapRenderer.DefineLayerGroup("Background", "Sky", "Clouds", "Mountains");

    // Merge all foreground layers into another single draw call
    _tilemapRenderer.DefineLayerGroup("Foreground", "Trees", "Overlay");
}
```

You can also define groups by index range:

```cs
// Group the first four layers
_tilemapRenderer.DefineLayerGroup("Background", startIndex: 0, count: 4);
```

Each layer can belong to at most one group. Assigning a layer that is already grouped moves it to the new group automatically.

### Manual Draw Sequence with Entity Interleaving

To draw layers in a controlled order and inject entity rendering in between, use `BeginDraw`, `DrawLayerGroup`, `DrawLayer`, and `EndDraw`:

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);

    _tilemapRenderer.BeginDraw(_camera);

    // Draw background group (all merged into one draw call)
    _tilemapRenderer.DrawLayerGroup("Background");

    // Draw ground tile layer individually
    _tilemapRenderer.DrawLayer("Ground");

    // Inject SpriteBatch entity rendering in world space.
    // Save the renderer's GraphicsDevice state first so SpriteBatch does not corrupt it.
    _tilemapRenderer.SaveGraphicsDeviceState();
    _spriteBatch.Begin(transformMatrix: _camera.GetViewMatrix());
    foreach (var entity in _entities)
    {
        entity.Draw(_spriteBatch);
    }
    _spriteBatch.End();
    _tilemapRenderer.RestoreGraphicsDeviceState();

    // Draw foreground group on top of entities
    _tilemapRenderer.DrawLayerGroup("Foreground");

    _tilemapRenderer.EndDraw();
}
```

`BeginDraw` saves the current `GraphicsDevice` state and sets up the effect matrices. `EndDraw` restores the original state. Within that block, calling `SpriteBatch.Begin/End` will alter `GraphicsDevice` state, so you must call `SaveGraphicsDeviceState` before and `RestoreGraphicsDeviceState` after any SpriteBatch work to allow the renderer to continue correctly.

### Updating a Group After Tile Changes

If you modify tiles in layers that belong to a group, the GPU buffers for that group are stale. Mark the group as dirty so it is rebuilt before the next draw:

```cs
// Modify a tile at runtime
var layer = _tilemap.Layers["Ground"] as TilemapTileLayer;
layer.SetTile(5, 3, new TilemapTile(newGlobalId));

// Tell the renderer to rebuild the group containing "Ground"
_tilemapRenderer.MarkGroupDirty("Background");
```

The rebuild happens automatically the next time `DrawLayerGroup` is called for the dirty group. You can also trigger the rebuild immediately (for example during a loading screen) by calling `RebuildLayerGroup("Background")`.

### Configuration Properties

| Property | Default | Description |
|----------|---------|-------------|
| `BlendState` | `NonPremultiplied` | Use `AlphaBlend` for content pipeline textures |
| `SamplerState` | `PointClamp` | `PointClamp` for pixel art; `LinearClamp` for smooth filtering |
| `DefaultRenderMode` | `Merged` | How ungrouped layers are drawn in `Draw(camera)` |
| `LayerGroups` | (empty) | Read-only list of defined group names |

---

## Working with Layers

Layers are accessed through `tilemap.Layers`, which supports access by name or by index:

```cs
// Access by name
TilemapLayer layer = tilemap.Layers["Ground"];

// Access by index
TilemapLayer layer = tilemap.Layers[0];

// Iterate all layers
foreach (TilemapLayer layer in tilemap.Layers)
{
    Console.WriteLine($"{layer.Name}: visible={layer.IsVisible}");
}
```

Every layer has these common properties:

| Property | Type | Description |
|----------|------|-------------|
| `Name` | `string` | The layer name |
| `Class` | `string` | The layer class/type tag |
| `IsVisible` | `bool` | Whether the layer should be rendered |
| `Opacity` | `float` | Layer opacity from 0.0 to 1.0 |
| `TintColor` | `Color?` | Optional tint applied to layer contents |
| `Offset` | `Vector2` | Pixel offset of the layer |
| `ParallaxFactor` | `Vector2` | Parallax scroll speed multiplier |
| `Properties` | `TilemapProperties` | Custom properties defined in the editor |

### Tile Layers

A `TilemapTileLayer` holds the grid of tiles for a layer:

```cs
TilemapTileLayer tileLayer = tilemap.Layers["Ground"] as TilemapTileLayer;

// Get a single tile at tile coordinates
TilemapTile? tile = tileLayer.GetTile(10, 5);

if (tile.HasValue)
{
    Console.WriteLine($"Global ID: {tile.Value.GlobalId}");
    Console.WriteLine($"Flip flags: {tile.Value.FlipFlags}");
}

// Iterate all non-empty tiles
foreach (TilemapTileEntry entry in tileLayer.GetTiles())
{
    Console.WriteLine($"Tile at ({entry.X}, {entry.Y}): GID {entry.Tile.GlobalId}");
}

// Modify a tile at runtime
tileLayer.SetTile(10, 5, new TilemapTile(newGlobalId));

// Clear a tile
tileLayer.SetTile(10, 5, null);
```

### Object Layers

A `TilemapObjectLayer` contains shapes, points, and tile objects placed in the editor:

```cs
TilemapObjectLayer objectLayer = tilemap.Layers["Enemies"] as TilemapObjectLayer;

foreach (TilemapObject obj in objectLayer.Objects)
{
    if (!obj.IsVisible)
    {
        continue;
    }

    Console.WriteLine($"{obj.Name} at {obj.Position}");

    switch (obj)
    {
        case TilemapRectangleObject rect:
            // Use rect.Width and rect.Height for collision bounds
            break;

        case TilemapPolygonObject polygon:
            // polygon.Points contains the vertices
            break;

        case TilemapTileObject tileObj:
            // A tile placed as an object; has its own GlobalId
            break;

        case TilemapPointObject point:
            // A single spawn point
            break;
    }
}
```

The supported object types are `TilemapRectangleObject`, `TilemapEllipseObject`, `TilemapPointObject`, `TilemapPolygonObject`, `TilemapPolylineObject`, `TilemapTileObject`, and `TilemapTextObject`.

To retrieve only objects of a specific type, use the generic overload:

```cs
foreach (TilemapRectangleObject rect in objectLayer.GetObjects<TilemapRectangleObject>())
{
    // Use as collision zones, trigger areas, etc.
}
```

### Image Layers

A `TilemapImageLayer` draws a single texture as a full layer. When `RepeatX` or `RepeatY` is set, the image tiles to fill the visible area:

```cs
TilemapImageLayer imageLayer = tilemap.Layers["Sky"] as TilemapImageLayer;

Console.WriteLine($"Texture: {imageLayer.Texture.Width} x {imageLayer.Texture.Height}");
Console.WriteLine($"Repeat X: {imageLayer.RepeatX}, Repeat Y: {imageLayer.RepeatY}");
```

## Working with Tiles

### Resolving a Tile's Tileset

A `TilemapTile` stores a global tile ID (GID), which is a number that identifies both the tileset and the local tile position within it. To get the actual texture region, resolve the GID to its tileset:

```cs
TilemapTile? tile = tileLayer.GetTile(5, 3);

if (tile.HasValue)
{
    int localId = tile.Value.GetLocalId(tilemap.Tilesets, out TilemapTileset tileset);

    if (tileset != null)
    {
        Rectangle sourceRect = tileset.GetTileRegion(localId);
        Console.WriteLine($"Tileset: {tileset.Name}, Source: {sourceRect}");
    }
}
```

### Tile Flip Flags

Tiles can be flipped or rotated using the `FlipFlags` property. The `TilemapTileFlipFlags` enum has three flags:

```cs
TilemapTileFlipFlags flags = tile.Value.FlipFlags;

bool flippedH = (flags & TilemapTileFlipFlags.FlipHorizontally) != 0;
bool flippedV = (flags & TilemapTileFlipFlags.FlipVertically) != 0;
bool flippedD = (flags & TilemapTileFlipFlags.FlipDiagonally) != 0;
```

The diagonal flag encodes a 90-degree rotation following Tiled's convention. Both renderers handle all eight flip combinations automatically.

### Tile Metadata

Tilesets can store per-tile metadata such as animation frames, collision objects, and custom properties. Access this data via `TilemapTileData`:

```cs
TilemapTileData tileData = tile.Value.GetTileData(tilemap.Tilesets);

if (tileData != null)
{
    // Check for animation
    if (tileData.Animation != null)
    {
        int currentFrame = tileData.Animation.CurrentFrame.TileId;
    }

    // Check for collision shapes defined on the tile
    foreach (TilemapObject collision in tileData.Objects)
    {
        // Use for per-tile physics
    }
}
```

## Working with Properties

Custom properties defined in the editor are available on maps, layers, tilesets, tiles, and objects through the `TilemapProperties` class. Properties are typed and accessed using typed getter methods:

```cs
// Read properties with a fallback default
string zone = tilemap.Properties.GetString("zone", "default");
int maxEnemies = tilemap.Properties.GetInt("maxEnemies", 10);
float gravity = tilemap.Properties.GetFloat("gravity", 9.8f);
bool isBossRoom = tilemap.Properties.GetBool("isBossRoom", false);
Color ambientLight = tilemap.Properties.GetColor("ambientLight", Color.White);

// Check if a property exists before reading
if (tilemap.Properties.TryGetValue("spawnPoint", out TilemapPropertyValue value))
{
    // Use value.AsString(), value.AsInt(), etc.
}

// Properties on layers, objects, and tilesets work the same way
string enemyType = objectLayer.Objects[0].Properties.GetString("type", "");
```

## Coordinate Conversion

The `Tilemap` class converts between tile coordinates and world-space positions. The conversion handles all four orientations correctly:

```cs
// Convert tile grid coordinates to world pixel position
Point worldPos = tilemap.TileToWorldPosition(tileX, tileY);

// Convert a world position to tile coordinates
Point tileCoords = tilemap.WorldToTilePosition(new Vector2(mouseX, mouseY));
```

This is useful for placing entities on tile boundaries, picking the tile under the mouse cursor, and implementing tile-based movement.

## Working with Tilesets

Tilesets are accessed through `tilemap.Tilesets`:

```cs
foreach (TilemapTileset tileset in tilemap.Tilesets)
{
    Console.WriteLine($"{tileset.Name}: {tileset.TileCount} tiles, " +
        $"{tileset.TileWidth}x{tileset.TileHeight} pixels each");
}

// Get the tileset that owns a specific global ID
TilemapTileset owningTileset = tilemap.Tilesets.GetTilesetByGlobalId(globalId);
```

## Controlling Layer Visibility

Toggle layer visibility at runtime to show or hide map content:

```cs
// Hide a layer
tilemap.Layers["Debug"].IsVisible = false;

// Show it again
tilemap.Layers["Debug"].IsVisible = true;
```

Both renderers skip invisible layers automatically. Note that with `TilemapRenderer`, if an invisible layer is part of a group, the group must be marked dirty after toggling visibility for the change to take effect in the merged buffer.

## Animated Tiles

Call `renderer.Update(gameTime)` each frame to advance tile animations. If your map has no animated tiles this call returns immediately.

For `TilemapRenderer`, when an animated tile advances to a new frame, the renderer automatically marks any groups containing that tile as dirty so they are rebuilt on the next draw. This means animated tiles inside groups cause a group buffer rebuild every time a frame changes. Keep animated tile layers outside groups or in their own dedicated groups to limit the rebuild cost to only the layers that contain animations.

## Unloading a Tilemap

When switching levels, unload the current tilemap from the renderer before loading a new one:

```cs
// TilemapSpriteBatchRenderer
_renderer.UnloadTilemap();
_tilemap = Content.Load<Tilemap>("maps/level2");
_renderer.LoadTilemap(_tilemap);

// TilemapRenderer
_tilemapRenderer.UnloadTilemap(); // also disposes GPU buffers for the old map
_tilemap = Content.Load<Tilemap>("maps/level2");
_tilemapRenderer.LoadTilemap(_tilemap);
```

---

## World Maps

A world map combines multiple individual tilemap levels positioned in a shared coordinate space. Use world maps when your game world spans more than one tilemap file, for example a GridVania-style platformer with many rooms that tile together.

### Loading a World Map

Add the world file to the MGCB Editor with importer `Tilemap World Importer - MonoGame.Extended` and processor `TilemapWorldProcessor`:

| Format | Extension | Notes |
|--------|-----------|-------|
| LDtk | `.ldtk` | All levels with world positions included in a single project file |
| Tiled | `.world` | JSON file referencing multiple `.tmx` files with world coordinates |
| Generic | `.tilemapworld` | Custom format for editors without a native world file (for example, Ogmo Editor) |

:::note
LDtk `.ldtk` files can be imported as either a single level (`LDtk Tilemap Importer` / `TilemapProcessor`) or as a complete world (`Tilemap World Importer` / `TilemapWorldProcessor`). Select the importer explicitly in the MGCB Editor because both importers register for the `.ldtk` extension.
:::

Load the asset at runtime as a `TilemapWorld`:

```cs
TilemapWorld world = Content.Load<TilemapWorld>("maps/world");
```

`TilemapWorld.Levels` exposes the levels as `IReadOnlyList<Tilemap>`. Each level has its `WorldPosition` and `WorldDepth` already set from the world file data.

### TilemapWorldRenderer

The `TilemapWorldRenderer` uses `GraphicsDevice` directly and pre-bakes all tile geometry into world-space vertex buffers at load time. Animated tiles are not supported. Because it holds GPU buffers, it implements `IDisposable`.

```cs
private TilemapWorldRenderer _worldRenderer;

protected override void LoadContent()
{
    TilemapWorld world = Content.Load<TilemapWorld>("maps/world");

    _worldRenderer = new TilemapWorldRenderer(GraphicsDevice);
    _worldRenderer.BlendState = BlendState.AlphaBlend; // for content pipeline textures
    _worldRenderer.Load(world);
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    _worldRenderer.Draw(_camera, worldDepth: 0);
}

protected override void UnloadContent()
{
    _worldRenderer?.Dispose();
    base.UnloadContent();
}
```

### TilemapWorldSpriteBatchRenderer

The `TilemapWorldSpriteBatchRenderer` uses `SpriteBatch` and applies per-room and per-tile frustum culling. It supports animated tiles.

```cs
private TilemapWorldSpriteBatchRenderer _worldRenderer;

protected override void LoadContent()
{
    TilemapWorld world = Content.Load<TilemapWorld>("maps/world");

    _worldRenderer = new TilemapWorldSpriteBatchRenderer();
    _worldRenderer.BlendState = BlendState.AlphaBlend;
    _worldRenderer.Load(world);

    _spriteBatch = new SpriteBatch(GraphicsDevice);
}

protected override void Update(GameTime gameTime)
{
    _worldRenderer.Update(gameTime);
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.Black);
    _worldRenderer.Draw(_spriteBatch, _camera, worldDepth: 0);
}
```

### World Depth Layers

The `worldDepth` parameter controls which levels are rendered. LDtk sets depth from each level's depth field in the project. Tiled's `.world` format has no depth field, so all levels load with `WorldDepth = 0`.

Assign `WorldDepth` manually after loading when the source format does not carry depth information:

```cs
TilemapWorld world = Content.Load<TilemapWorld>("maps/world");
foreach (Tilemap level in world.Levels)
{
    if (level.Name == "Basement")
        level.WorldDepth = -1;
}
```

### The .tilemapworld Format

For editors without a native world file (such as Ogmo Editor), define a `.tilemapworld` JSON file:

```json
{
  "format": "ogmo",
  "project": "game.ogmo",
  "maps": [
    { "source": "levels/cave.json",    "x": 0,   "y": 0,   "depth": 0 },
    { "source": "levels/dungeon.json", "x": 256, "y": 0,   "depth": 0 }
  ]
}
```

The `format` field is `"ogmo"` or `"tiled"`. The `project` field is required for Ogmo and points to the `.ogmo` project file relative to the `.tilemapworld` file. The `x` and `y` fields are world-space pixel coordinates. The `depth` field defaults to 0 if omitted.

---

## Performance Tips

**Minimize tileset count.** Each unique texture in the map requires a separate draw. Combining related tiles into a single tileset image reduces texture switches.

**Use layer groups in `TilemapRenderer`.** Grouping all tile layers that share a texture into one group produces a single draw call for those layers. This is the most impactful optimization available in `TilemapRenderer`.

**Keep animated layers out of large groups.** With `TilemapRenderer`, every animated frame change triggers a rebuild of every group containing that layer. Isolate animated layers in their own small groups so rebuilds only affect those buffers.

**Skip `Update` when unnecessary.** If a level has no animated tiles, skip calling `renderer.Update(gameTime)`. Both renderers return immediately in this case, but avoiding the call saves the check.

**Profile before switching renderers.** The right renderer depends on the ratio of visible tiles to total tiles, how often tiles change, and how many layers you have. Measure with real map data before optimizing.

## Troubleshooting

**Content pipeline errors ("Could not find ContentTypeReader")**: Ensure `MonoGame.Extended.Content.Pipeline` is added to your MGCB Editor references. See the [Installation Guide](/docs/getting-started/installation-monogame/#optional-set-up-mgcb-editor).

**Transparent tiles render with black backgrounds**: Set `BlendState = BlendState.AlphaBlend` when using content pipeline textures. The default `NonPremultiplied` is for textures loaded from file by a runtime parser.

**Tiles appear blurry or have edge artifacts**: Ensure `SamplerState` is `PointClamp` (the default) for pixel-art tilesets.

**`TilemapRenderer` tiles do not update after tile changes**: Call `MarkGroupDirty(groupName)` on any group containing the modified layer, or call `UnloadTilemap` and `LoadTilemap` again for a full rebuild.

**SpriteBatch rendering looks wrong after `TilemapRenderer`**: When mixing SpriteBatch inside a `BeginDraw/EndDraw` block, call `SaveGraphicsDeviceState()` before `SpriteBatch.Begin` and `RestoreGraphicsDeviceState()` after `SpriteBatch.End`.
