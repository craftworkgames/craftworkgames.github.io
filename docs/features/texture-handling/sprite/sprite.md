---
id: sprite
sidebar_label: Sprite
title: Sprite
description: A drawable region of a Texture2D with additional properties for rendering such as  scale, rotation, and color
---
import PlayingCards from './cards.png'
import AceOfSpadesResult from './ace_of_spades_only.png'
import  FinalResultScreenshot from './final_result.png'

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

## Overview

Using a `Texture2DAtlas` to create and manage our `Texture2DRegion`s is nice but sometimes we want a more concrete implementation of what we're drawing. Something that can encapsulate the common properties used when rendering such as scale, rotation, and color.  This is where the `Sprite` class comes in. At it's core, it holds a reference to a `Texture2DRegion` with adjustable properties to use when rendering that get applied automatically when drawing it.

## Usage
Let's take the cards image from the previous two examples and use them to create and render a sprite.

<figure>
    <img src={PlayingCards} style={{width: '100%', imageRendering: 'pixelated'}} alt="Packed Texture of playing cards"/>
    <figcaption>
        <small>
            <a href="https://kenney.nl/assets/playing-cards-pack">Playing Cards Pack</a> by <a href="https://www.kenney.nl">Kenney</a>; Licensed under CreativeCommons Zero, CC0
        </small>
    </figcaption>
</figure>

We'll start with the usual of loading the `Texture2D` and using that to create a `Texture2DAtlas`

```cs
// highlight-next-line
private Texture2DAtlas _atlas;
// highlight-next-line
private Sprite _aceOfClubsSprite;

protected override void LoadContent()
{
    // highlight-next-line
    Texture2D cardsTexture = Content.Load<Texture2D>("cards");
    // highlight-next-line
    _atlas = Texture2DAtlas.Create("Atlas/Cards", cardsTexture, 32, 32);
}
```

Now that we have the atlas created with the regions generated, we can use the `Texture2DAtlas.CreateSprite()` method to create a `Sprite` from one of the regions.

```cs
private Texture2DAtlas _atlas;
private Sprite _aceOfClubsSprite;

protected override void LoadContent()
{
    Texture2D cardsTexture = Content.Load<Texture2D>("cards");
    _atlas = Texture2DAtlas.Create("Atlas/Cards", cardsTexture, 32, 32);

    // highlight-next-line
    _aceOfClubsSprite = _atlas.CreateSprite(regionIndex: 12);
}
```

Then we can use the `SpriteBatch.Draw` extensions provided by MonoGame.Extended to draw the `Sprite` we created

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    // highlight-next-line
    _spriteBatch.Begin();
    // highlight-next-line
    _spriteBatch.Draw(_aceOfClubsSprite, new Vector2(384, 284));
    // highlight-next-line
    _spriteBatch.End();

    base.Draw(gameTime);
}
```

Which gives us the following result

<figure>
    <img src={AceOfSpadesResult} style={{width: '100%', imageRendering: 'pixelated'}} alt="Rendering of the Ace of Clubs card as a Sprite instance."/>
    <figcaption>
        <small>
            The result of rendering the `_aceOfClubsSprite` sprite from the example above
        </small>
    </figcaption>
</figure>


Doing it like this though is not much different than just using a `Texture2DRegion` unless we make use of the `Sprite` properties.

### Sprite Properties
The `Sprite` class has the following properties that can be set

| Property    | Type                                             | Description                                                               |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `IsVisible` | `bool`                                           | Gets or Sets a value that indicates whether the sprite should be rendered |
| `Color`     | `Microsoft.Xna.Framework.Color`                  | Gets or Sets the color mask to apply when rendering the sprite.           |
| `Alpha`     | `float`                                          | Gets or Sets the alpha transparency value used when rendering the sprite. |
| `Depth`     | `float`                                          | Gets or Sets the layer depth used when rendering the sprite.              |
| `Effect`    | `Microsoft.Xna.Framework.Graphics.SpriteEffects` | Gets of Sets the sprite effect to apply when rendering.                   |

As an example, let's create `Sprite`s for the other Ace cards and adjust some of their properties to show the affect.  Adjust your code to the following

```cs
private Texture2DAtlas _atlas;
private Sprite _aceOfClubsSprite
// highlight-next-line
private Sprite _aceOfDiamondsSprite;
// highlight-next-line
private Sprite _aceOfHeartsSprite;
// highlight-next-line
private Sprite _aceOfSpadesSprite;

protected override void LoadContent()
{
    Texture2D cardsTexture = Content.Load<Texture2D>("cards");
    _atlas = Texture2DAtlas.Create("Atlas/Cards", cardsTexture, 32, 32);

    _aceOfClubsSprite = _atlas.CreateSprite(regionIndex: 12);
    // highlight-next-line
    _aceOfDiamondsSprite = _atlas.CreateSprite(regionIndex: 25);
    // highlight-next-line
    _aceOfHeartsSprite = _atlas.CreateSprite(regionIndex: 38);
    // highlight-next-line
    _aceOfSpadesSprite = _atlas.CreateSprite(regionIndex: 51);

    //  Change the color mask of the heart and diamond to red
    // highlight-next-line
    _aceOfHeartsSprite.Color = Color.Red;
    // highlight-next-line
    _aceOfDiamondsSprite.Color = Color.Red;

    //  Change the Alpha transparency of the club and spade to half
    // highlight-next-line
    _aceOfClubsSprite.Alpha = 0.5f;
    // highlight-next-line
    _aceOfSpadesSprite.Alpha = 0.5f;
}

protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    _spriteBatch.Begin(samplerState: SamplerState.PointClamp);
    // highlight-next-line
    _spriteBatch.Draw(_aceOfClubsSprite, new Vector2(336, 284));
    // highlight-next-line
    _spriteBatch.Draw(_aceOfDiamondsSprite, new Vector2(368, 284));
    // highlight-next-line
    _spriteBatch.Draw(_aceOfHeartsSprite, new Vector2(400, 284));
    // highlight-next-line
    _spriteBatch.Draw(_aceOfSpadesSprite, new Vector2(432, 284));
    _spriteBatch.End();

    base.Draw(gameTime);
}
```

When you run the example now, you can see that the Red color mask is automatically applied for Ace of Hearts and Diamonds, and the alpha transparency is automatically applied for the Ace of Clubs and Spades.

<figure>
    <img src={FinalResultScreenshot} style={{width: '100%', imageRendering: 'pixelated'}} alt="The result of rendering the ace cards as `Sprite` classes with adjusted properties from the example above."/>
    <figcaption>
        <small>
            The result of rendering the ace cards as `Sprite` classes with adjusted properties from the example above.
        </small>
    </figcaption>
</figure>

## Conclusion
By creating `Sprite`s from the regions created in a `Texture2DAtlas`, we have a concrete implementation of the image we want to render.  This implementation features properties we can adjust that automatically get applied when its rendered.  
