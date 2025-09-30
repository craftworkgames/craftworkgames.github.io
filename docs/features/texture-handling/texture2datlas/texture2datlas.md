---
id: texture2datlas
sidebar_label: Texture2DAtlas
title: Texture2DAtlas
description: A Texture2DAtlas is a 2D texture atlas that contains a collection of texture regions.
image: ./cards.png
---

import PlayingCards from './cards.png'
import ResultScreenShot from './result.png'
import SpritesheetImage from './spritesheet.png'

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

In the [previous](../texture2dregion/texture2dregion.md) article we discussed what a `Texture2DRegion` is.  When you combine all the texture regions into a single collection, this is called a texture atlas. By using a texture atlas it gives us an easy way to create and manage our collection of regions

Let's take a look at the image of all the cards again.

<figure>
    <img src={PlayingCards} style={{width: '100%', imageRendering: 'pixelated'}} alt="Packed Texture of playing cards"/>
    <figcaption>
        <small>
            <a href="https://kenney.nl/assets/playing-cards-pack">Playing Cards Pack</a> by <a href="https://www.kenney.nl">Kenney</a>; Licensed under CreativeCommons Zero, CC0
        </small>
    </figcaption>
</figure>

Let's recreate the example from the [Texture2DRegion](/docs/features/texture-handling/texture2dregion/texture2dregion.md) document, but this time using a `Texture2DAtlas`.

## Using `Texture2DAtlas` with grid layout
When creating a `Texture2DAtlas`, if all of the regions within your texture are uniform, then you can use the `Texture2DAtlas.Create` method to automatically generate every region.  Then you can access the regions by index. For instance:

```cs
private Texture2DAtlas _atlas;

private Texture2DRegion _aceOfClubs;
private Texture2DRegion _aceOfDiamonds;
private Texture2DRegion _aceOfHearts;
private Texture2DRegion _aceOfSpades;

protected override void LoadContent()
{
    Texture2D cardsTexture = Content.Load<Texture2D>("cards");
    _atlas = Texture2DAtlas.Create("Atlas/Cards", cardsTexture, 32, 32);

    _aceOfClubs = _atlas[12];
    _aceOfDiamonds = _atlas[25];
    _aceOfHearts = _atlas[38];
    _aceOfSpades = _atlas[51];
}
```

Then we can draw the regions just like in the other example

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    _spriteBatch.Begin(samplerState: SamplerState.PointClamp);

    _spriteBatch.Draw(_aceOfClubs, new Vector2(336, 284), Color.White);
    _spriteBatch.Draw(_aceOfDiamonds, new Vector2(368, 284), Color.White);
    _spriteBatch.Draw(_aceOfHearts, new Vector2(400, 284), Color.White);
    _spriteBatch.Draw(_aceOfSpades, new Vector2(432, 284), Color.White);

    _spriteBatch.End();

    base.Draw(gameTime);
}
```

<figure>
    <img src={ResultScreenShot} style={{width: '100%', imageRendering: 'pixelated'}} alt="Result of the code"/>
    <figcaption>
        <small>Result of the code above drawing all four ace cards using texture regions</small>
    </figcaption>
</figure>

:::note
Regions that are automatically generated are automatically assigned a name in the format of `"{Texture2D.Name}({x}, {y}, {width}, {height})"`.  So in the instance of our cards, since the name of the image is `cards.png`, the Ace of Hearts would be generated as `"cards(384, 0, 32, 32)"`
:::

## Loading tightly packed sprite sheets

When working with sprite sheets that contain regions of different sizes that are tightly packed (not arranged in a uniform grid), you can use a JSON data file along with your texture. This approach is ideal for optimizing texture memory usage by eliminating wasted space between sprites.

<img src={SpritesheetImage} alt="Tightly packed sprite sheet" />

### Creating sprite sheets

The easiest way to create a tightly packed sprite sheet with the appropriate JSON data file is to use **[TexturePacker](https://www.codeandweb.com/texturepacker)**. TexturePacker automatically arranges your individual sprite images into an optimized atlas and generates the JSON file in the MonoGame.Extended format.

For a detailed tutorial on using TexturePacker with MonoGame.Extended, CodeAndWeb provides a comprehensive guide: [How to use sprite sheets with MonoGame.Extended](https://www.codeandweb.com/texturepacker/tutorials/how-to-use-sprite-sheets-with-monogame-extended)


### JSON Format

The JSON file describes each sprite's location, size, rotation, and other properties within the texture. Here's an example of the JSON format:

```json
{
    "textures": [
        {
            "filename": "textures/spritesheet.png",
            "frames": {
                "capguy/walk_0001": {
                    "frame": {"x":1,"y":323,"w":158,"h":316},
                    "size": {"w":187,"h":324},
                    "offset": {"x":15,"y":3},
                    "pivot": {"x":0.5,"y":1},
                    "rotated": 90
                },
                "crate": {
                    "frame": {"x":207,"y":813,"w":100,"h":100}
                }
            }
        }
    ],
    "meta": {
        "dataformat": "monogame-extended",
        "version": "1.2"
    }
}
```

Each frame entry contains:
- `frame`: The rectangle coordinates and size within the texture (required)
- `size`: The original sprite size before trimming (optional)
- `offset`: How much transparent space was removed on the top-left corner (optional)
- `pivot`: The sprite's origin, used for placement and rotation (optional)
- `rotated`: Whether the sprite is rotated in the atlas (optional)

### Loading and using the atlas

To load a tightly packed sprite sheet, you need both the PNG texture file and the JSON data file in your Content Pipeline. 

:::note[File Naming Requirements]
The PNG and JSON files must either have **different filenames** or be located in **different directories** to avoid name conflicts. The MonoGame Content Pipeline is based on file paths without extensions, so files with the same base name in the same directory will conflict.

**Valid configurations:**
- `textures/spritesheet.png` + `data/spritesheet.json` (✅ different directories)
- `spritesheet-texture.png` + `spritesheet.json` (✅ different filenames)

**Invalid configuration:**
- `spritesheet.png` + `spritesheet.json`  (❌ same directory, same base name)
:::

When loading the atlas, you must call `Content.Load<Texture2DAtlas>()` with the **JSON data file's base name**. The JSON file contains a reference to the image file to use, so MonoGame.Extended will automatically load the corresponding PNG texture.

```cs
private Texture2DAtlas _spriteAtlas;
private Sprite _walkSprite;

protected override void LoadContent()
{
    // Load the atlas using the JSON data file name
    _spriteAtlas = Content.Load<Texture2DAtlas>("spritesheet");
    
    // Create a sprite by name, corresponding region is defined in JSON data file
    _walkSprite = _spriteAtlas.CreateSprite("capguy/walk_0001");
}

```

## Manually creating regions

If you want more fine grained control over the creation of TextureRegions, you can create them programmatically by calling the `Texture2DAtlas.CreateRegion()` method

```cs
protected override void LoadContent()
{
    Texture2D cardsTexture = Content.Load<Texture2D>("cards");
    _atlas = new Texture2DAtlas(cardsTexture);

    _aceOfClubs = _atlas.CreateRegion(384, 0, 32, 32, "Ace of Clubs");
}
```

:::caution
When naming a texture region, the name of each region added to the texture atlas must be unique.
:::


## Conclusion
We've now learned to use a `Texture2DAtlas` to create and retrieve the `Texture2DRegion` instances for our `Texture2D`.  Next, let's take a look at the `Sprite` class and how we can use the `Texture2DAtlas` to generate the sprites for us based on the regions.
