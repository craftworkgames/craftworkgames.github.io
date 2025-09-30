---
id: spritesheet
sidebar_label: Spritesheet
title: Spritesheet
description: A Spritesheet is a wrapper around a Texture2DAtlas with methods for defining frame based animations.
---

import AdventurerSpriteSheet from './adventurer-texture.png'
import AdventurerAttackFrames from './attack-frames.png'
import AttackAnimation from './attack_animation.gif'

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

A `SpriteSheet` is a wrapper around a [Texture2DAtlas](/docs/features/texture-handling/texture2datlas/texture2datlas.md) that provides additional methods for defining frame based animations based on the regions within the `Texture2DAtlas`.  

Take a look at the following example texture atlas of an adventurer character.

<figure>
    <img src={AdventurerSpriteSheet} style={{width: '100%', imageRendering: 'pixelated'}}/>
    <figcaption>
        <small>
            <a href="https://rvros.itch.io/animated-pixel-hero">Animated Pixel Adventurer</a> by <a href="https://rvros.itch.io/">rvros</a>; Licensed for free and commercial use.
        </small>
    </figcaption>
</figure>

We can see that this texture atlas has 16 separate regions, some of which can be grouped together to form an animation.  For instance, the following 6 regions can be grouped together to form an attack animation.
Their positions and region names are specified in a [JSON data file](./adventurer.json), as described [here](/docs/features/texture-handling/texture2datlas/texture2datlas.md#loading-tightly-packed-sprite-sheets).

<figure>
    <img src={AdventurerAttackFrames} style={{width: '100%', imageRendering: 'pixelated'}}/>
    <figcaption>
        <small>
            <a href="https://rvros.itch.io/animated-pixel-hero">Animated Pixel Adventurer</a> by <a href="https://rvros.itch.io/">rvros</a>; Licensed for free and commercial use.
        </small>
    </figcaption>
</figure>

Knowing the regions that represent our frames of animation, we can use a `SpriteSheet` to define the animations.

## Using `SpriteSheet`
To create a `SpriteSheet` you first need to load a [Texture2DAtlas](/docs/features/texture-handling/texture2datlas/texture2datlas.md), then you use that in the constructor to create the `SpriteSheet`.

```cs
//highlight-next-line
private SpriteSheet _spriteSheet;

protected override void LoadContent()
{
    _spriteBatch = new SpriteBatch(GraphicsDevice);

    //highlight-next-line
    Texture2DAtlas atlas = Content.Load<Texture2DAtlas>("adventurer");
    //highlight-next-line
    _spriteSheet = new SpriteSheet("SpriteSheet/adventurer", atlas);
}
```

We loaded the `Texture2DAtlas` by passing the base name of `adventurer.json`, which contains for each region name the corresponding location and rotation.
Now that we have the `SpriteSheet` created, we can define our animations using the `SpriteSheet.DefineAnimation` method

```cs
private SpriteSheet _spriteSheet;

protected override void LoadContent()
{
    _spriteBatch = new SpriteBatch(GraphicsDevice);

    Texture2DAtlas atlas = Content.Load<Texture2DAtlas>("adventurer");
    _spriteSheet = new SpriteSheet("SpriteSheet/adventurer", atlas);

    //highlight-start
    _spriteSheet.DefineAnimation("attack", builder =>
    {
        builder.IsLooping(true)
               .AddFrame("adventurer-attack3-00", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-01", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-02", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-03", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-04", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-05", TimeSpan.FromSeconds(0.1));
    });
    //highlight-end
}
```

:::caution
When giving the name for an animation definition, the name must be unique across all animations defined in a single `SpriteSheet`.
:::

## Getting An Animation
Once you have defined the animations in the `SpriteSheet`, you can retrieve them by using the name you gave them when defining them.  This will give you an instance of `SpriteSheetAnimation` which is an implementation of the `IAnimation` interface

```cs
private SpriteSheet _spriteSheet;

protected override void LoadContent()
{
    _spriteBatch = new SpriteBatch(GraphicsDevice);

    Texture2DAtlas atlas = Content.Load<Texture2DAtlas>("adventurer");
    _spriteSheet = new SpriteSheet("SpriteSheet/adventurer", atlas);

    _spriteSheet.DefineAnimation("attack", builder =>
    {
        builder.IsLooping(true)
               .AddFrame("adventurer-attack3-00", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-01", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-02", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-03", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-04", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-05", TimeSpan.FromSeconds(0.1));
    });

    //highlight-next-line
    SpriteSheetAnimation attackAnimation = _spriteSheet.GetAnimation("attack");
}
```

You can then use this animation with the `AnimationController` class to control the animation including play, pause, reset, stop, and updating it each frame.

```cs
private SpriteSheet _spriteSheet;
// highlight-next-line
private AnimationController _attackAnimationController;

protected override void LoadContent()
{
    _spriteBatch = new SpriteBatch(GraphicsDevice);

    Texture2DAtlas atlas = Content.Load<Texture2DAtlas>("adventurer");
    _spriteSheet = new SpriteSheet("SpriteSheet/adventurer", atlas);

    _spriteSheet.DefineAnimation("attack", builder =>
    {
        builder.IsLooping(true)
               .AddFrame("adventurer-attack3-00", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-01", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-02", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-03", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-04", TimeSpan.FromSeconds(0.1))
               .AddFrame("adventurer-attack3-05", TimeSpan.FromSeconds(0.1));
    });

    SpriteSheetAnimation attackAnimation = _spriteSheet.GetAnimation("attack");
    //highlight-next-line
    _attackAnimationController = new AnimationController(attackAnimation);
}
```

## Updating the Animation Controller
The `AnimationController` needs to be updated each frame so it can track the progress of the animation and change frames when the duration for the current frame has passed

```cs
protected override void Update(GameTime gameTime)
{
    //highlight-next-line
    _attackAnimationController.Update(gameTime);
}
```

## Drawing the Animation

The `AnimationController` has a `CurrentFrame` property you can use to get the region index of the current frame of the animation.  You can use this to know which `Texture2DRegion` from the source `Texture2DAtlas` of the `SpriteSheet` to draw

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    //highlight-next-line
    Texture2DRegion currentFrameTexture = _spriteSheet.TextureAtlas[_attackAnimationController.CurrentFrame];

    //highlight-next-line
    _spriteBatch.Begin(samplerState: SamplerState.PointClamp);
    //highlight-next-line
    _spriteBatch.Draw(currentFrameTexture, Vector2.Zero, Color.White, 0.0f, Vector2.Zero, new Vector2(3, 3), SpriteEffects.None, 0.0f);
    //highlight-next-line
    _spriteBatch.End();

}
```

<figure>
    <img src={AttackAnimation} style={{width: '100%', imageRendering: 'pixelated'}}/>
    <figcaption>
        <small>
            The result of drawing the attack animation from the example code above.
        </small>
    </figcaption>
</figure>

## Conclusion
We have now learned how to create a new `SpriteSheet` based on a `Texture2DAtlas`, define animations within the `SpriteSheet`, then retrieve the animations and use them with an `AnimationController`.  However, creating a controller for each possible animation can be tedious and a nightmare to maintain.  In the next document, we'll discuss the `AnimatedSprite` class which provides a convenient encapsulation of the `SpriteSheet` where we can set what animation we want to play.
