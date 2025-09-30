---
id: keyboardextended
title: KeyboardExtended
sidebar_label: KeyboardExtended
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

`KeyboardExtended` is an extension of the `Microsoft.Xna.Framework.Input.Keyboard` class. Unlike the default MonoGame one, `KeyboardExtended` will internally track both the keyboard state of the previous frame and the keyboard state of the current frame.  This allows for easy comparisons between the previous and current state to check for single frame key presses.

`KeyboardExtended` also contains the `KeyboardExtended.GetState()` method which returns back a `KeyboardStateExtended` struct.  This struct provides the standard utility methods of checking if a key is down or up, but also extends this functionality with methods for checking for single frame key presses.

## Using `KeyboardExtended`
`KeyboardExtended` is a `static` class, so you do not need to instantiate it in the different areas you use it or pass the dependency around to different objects.  However it does need to be updated once per update frame. The best place to do this is in your `Game` class

```cs
protected override void Update(GameTime gameTime)
{
    // highlight-next-line
    KeyboardExtended.Update();
}
```

:::caution
`KeyboardExtended.Update` should only be called once per update cycle in your game.  This is because when calling it, it will update it's internal source for the previous state by caching the current state into the previous state before refreshing the current state.  Calling this method more than once during an update cycle can cause the previous state cache to be overwritten with invalid data.
:::

Then, just like with base MonoGame, when you need to get the state of keyboard input from `KeyboardExtended` you use the `KeyboardExtended.GetState()` method.  This returns back a new `KeyboardStateExtended` struct

```cs
protected override void Update(GameTime gameTime)
{
    KeyboardExtended.Update();
    // highlight-next-line
    KeyboardStateExtended keyboardState = KeyboardExtended.GetState();
}
```

## Using `KeyboardStateExtended`
At any time, you can call `KeyboardExtended.GetState()` to get the `KeyboardStateExtended` struct.  This struct is an extended version of the base MonoGame `KeyboardState` that provides utility for checking keyboard states between the previous and current frame.  By providing this utility, you can not only check if a key is down, but also check for single frame presses of a key.

```cs
protected override void Update(GameTime gameTime)
{
    KeyboardExtended.Update();
    KeyboardStateExtended keyboardState = KeyboardExtended.GetState();


    // highlight-next-line
    if(keyboardState.WasKeyPressed(Keys.Space))
    // highlight-next-line
    {
        // highlight-next-line
        //  Do something when detecting a single frame press of the space key.
    // highlight-next-line
    }
}
```


