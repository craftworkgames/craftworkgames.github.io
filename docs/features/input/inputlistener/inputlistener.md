---
id: inputlistener
title: InputListener
sidebar_label: InputListener
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

**MonoGame.Extended** offers input listeners that can be used to subscribe to input events instead of having to poll for input changes.  These listeners include

- `KeyboardListener`
- `MouseListener`
- `GamePadListener`
- `TouchListener`

## Using the Listeners
To get started using a listener, first create an instance of them

```cs
// highlight-next-line
private readonly KeyboardListener _keyboardListener;
// highlight-next-line
private readonly MouseListener _mouseListener;
// highlight-next-line
private readonly GamePadListener _gamePadListener;
// highlight-next-line
private readonly TouchListener _touchListener;

protected override void Initialize()
{
    // highlight-next-line
    _keyboardListener = new KeyboardListener();
    // highlight-next-line
    _gamePadListener = new GamePadListener();
    // highlight-next-line
    _mouseListener = new MouseListener();
    // highlight-next-line
    _touchListener = new TouchListener();
}
```

Next ensure that you update the listener each frame

```cs
protected override void Update(GameTime gameTime)
{
    // highlight-next-line
    _keyboardListener.Update(gameTime);
    // highlight-next-line
    _gamePadListener.Update(gameTime);
    // highlight-next-line
    _mouseListener.Update(gameTime);
    // highlight-next-line
    _touchListener.Update(gameTime);
}
```

Finally subscribe to any events of the listeners that you want to be notified about

```cs
private readonly KeyboardListener _keyboardListener;
private readonly MouseListener _mouseListener;
private readonly GamePadListener _gamePadListener;
private readonly TouchListener _touchListener;

protected override void Initialize()
{
    _keyboardListener = new KeyboardListener();
    _gamePadListener = new GamePadListener();
    _mouseListener = new MouseListener();
    _touchListener = new TouchListener();

    // highlight-next-line
    _keyboardListener.KeyPressed += (sender, args) => { Window.Title = $"Key {args.Key} Pressed"; };
    // highlight-next-line
    _mouseListener.MouseClicked += (sender, args) => { Window.Title = $"Mouse {args.Button} Clicked"; };
    // highlight-next-line
    _gamePadListener.ButtonDown +=  (sender, args) => { Window.Title = $"Key {args.Button} Down"; };
    // highlight-next-line
    _touchListener.TouchStarted +=  (sender, args) => { Window.Title = $"Touched"; };
}
```

## Using the `InputListenerComponent`
**MonoGame.Extended** also provides an `InputListenerComponent` that can be created and added to the game component collection to have it automatically updated for you each frame.  Using it is similar to using hte individual listeners, you just have to create an instance of it and add it to the components collection

```cs
// highlight-next-line
private readonly KeyboardListener _keyboardListener;
// highlight-next-line
private readonly MouseListener _mouseListener;
// highlight-next-line
private readonly GamePadListener _gamePadListener;
// highlight-next-line
private readonly TouchListener _touchListener;

protected override void Initialize()
{
    // highlight-next-line
    _keyboardListener = new KeyboardListener();
    // highlight-next-line
    _gamePadListener = new GamePadListener();
    // highlight-next-line
    _mouseListener = new MouseListener();
    // highlight-next-line
    _touchListener = new TouchListener();

    // highlight-next-line
    Components.Add(new InputListenerComponent(this, _keyboardListener, _gamePadListener, _mouseListener, _touchListener));
}
```