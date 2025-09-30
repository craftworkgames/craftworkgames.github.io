---
id: mouseextended
title: MouseExtended
sidebar_label: MouseExtended
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

`MouseExtended` is an extension of the `Microsoft.Xna.Framework.Input.Mouse` class. Unlike the default MonoGame one, `MouseExtended` will internally track both the mouse state of the previous frame and the mouse state of the current frame.  This allows for easy comparisons between the previous and current state to check for things like  single frame button presses and tracking mouse position delta between frames

`MouseExtended` also contains the `MouseExtended.GetState()` method which returns back a `MouseStateExtended` struct.  This struct provides the standard utility methods of checking if a button is down or up, but also extends this functionality with methods for checking for single frame button presses and deltas between frames.

## Using `MouseExtended`
`MouseExtended` is a `static` class, so you do not need to instantiate it in the different areas you use it or pass the dependency around to different objects.  However it does need to be updated once per update frame. The best place to do this is in your `Game` class

```cs
protected override void Update(GameTime gameTime)
{
    // highlight-next-line
    MouseExtended.Update();
}
```

:::caution
`MouseExtended.Update` should only be called once per update cycle in your game.  This is because when calling it, it will update it's internal source for the previous state by caching the current state into the previous state before refreshing the current state.  Calling this method more than once during an update cycle can cause the previous state cache to be overwritten with invalid data.
:::

Then, just like with base MonoGame, when you need to get the state of mouse input from `MouseExtended` you use the `MouseExtended.GetState()` method.  This returns back a new `MouseStateExtended` struct

```cs
protected override void Update(GameTime gameTime)
{
    MouseExtended.Update();
    // highlight-next-line
    MouseStateExtended mouseState = MouseExtended.GetState();
}
```

## Using `MouseStateExtended`
At any time, you can call `MouseExtended.GetState()` to get the `MouseStateExtended` struct.  This struct is an extended version of the base MonoGame `MouseState` that provides utility for checking mouse states between the previous and current frame.

```cs
protected override void Update(GameTime gameTime)
{
    MouseExtended.Update();
    MouseStateExtended mouseState = MouseExtended.GetState();


    // highlight-next-line
    if(mouseState.WasButtonPressed(MouseButton.Left))
    // highlight-next-line
    {
        // highlight-next-line
        //  Do something when detecting a single frame press of the left mouse button.
    // highlight-next-line
    }
}
```


