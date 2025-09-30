---
id: screen-management
title: Screen Management
sidebar_label: Screen Management
description: Screen management to split your game into multiple screens.
---

:::warning[Not up to date]
This page **is not** up to date for MonoGame.Extended `@mgeversion@`.  If you would like to contribute to updating this document, please [create a new PR](https://github.com/monogame-extended/monogame-extended.github.io/pulls)
:::

The `ScreenManager` helps you to split your game into multiple `GameScreens` with their own `Dispose()`,
`Initialize()`, 
`LoadContent()`, 
`UnloadContent()`, 
`Update(GameTime gameTime)`, 
and, `Draw(GameTime gameTime)` methods.

## Usage

We start by including the `Screens` and `Transitions` namespaces.

```cs
using MonoGame.Extended.Screens;
using MonoGame.Extended.Screens.Transitions;
```

Next, we implement our GameScreens.
In this example, we use 2 GameScreens with a sprite that follows the Cursor.

### Screen 1
```cs
public class MyScreen1 : GameScreen
{
    private new Game1 Game => (Game1) base.Game;
    
    private Texture2D _logo;
    private SpriteFont _font;
    private Vector2 _position = new Vector2(50,50);
    public MyScreen1(Game1 game) : base(game) { }

    public override void LoadContent()
    {
        base.LoadContent();
        _font = Game.Content.Load<SpriteFont>("font");
        _logo = Game.Content.Load<Texture2D>("logo-mge");
    }

    public override void Update(GameTime gameTime)
    {
        _position = Vector2.Lerp(_position, Mouse.GetState().Position.ToVector2(), 1f * gameTime.GetElapsedSeconds());
    }

    public override void Draw(GameTime gameTime)
    {
        Game.GraphicsDevice.Clear(new Color(16, 139, 204));
        Game.SpriteBatch.Begin();
        Game.SpriteBatch.DrawString(_font, nameof(MyScreen1), new Vector2(10,10), Color.White);
        Game.SpriteBatch.Draw(_logo, _position, Color.White);
        Game.SpriteBatch.End();
    }
}
```

### Screen 2
```cs
public class MyScreen2 : GameScreen
{
    private new Game1 Game => (Game1)base.Game;
    private Texture2D _logo;
    private SpriteFont _font;
    private Vector2 _position = new Vector2(50, 50);
    
    public MyScreen2(Game1 game) : base(game) { }

    public override void LoadContent()
    {
        base.LoadContent();
        _font = Game.Content.Load<SpriteFont>("font");
        _logo = Game.Content.Load<Texture2D>("logo-mg");
    }

    public override void Update(GameTime gameTime)
    {
        _position = Vector2.Lerp(_position, Mouse.GetState().Position.ToVector2(), 1f * gameTime.GetElapsedSeconds());
    }

    public override void Draw(GameTime gameTime)
    {
        Game.GraphicsDevice.Clear(Color.White);
        Game.SpriteBatch.Begin();
        Game.SpriteBatch.DrawString(_font, nameof(MyScreen2), new Vector2(10, 10), Color.Orange);
        Game.SpriteBatch.Draw(_logo, _position, Color.White);
        Game.SpriteBatch.End();
    }
}
```


Next, we define our `ScreenManger` in our `Game` class.
```cs
private readonly ScreenManager _screenManager;
```
Which we then assign and register as `GameComponent` in the constructor.
```cs
_screenManager = new ScreenManager();
Components.Add(_screenManager);
```

Then we define the following methods to load the screens.
```cs
private void LoadScreen1()
{
    _screenManager.LoadScreen(new MyScreen1(this), new FadeTransition(GraphicsDevice, Color.Black));
}

private void LoadScreen2()
{
    _screenManager.LoadScreen(new MyScreen2(this), new FadeTransition(GraphicsDevice, Color.Black));
}
```

Which we then call from the `Initialize` and `Update` methods.

```cs
protected override void Initialize()
{
    base.Initialize();
    LoadScreen1();
}

protected override void Update(GameTime gameTime)
{
    KeyboardState keyboardState = Keyboard.GetState();
    if (keyboardState.IsKeyDown(Keys.Escape))
        Exit();
    if (keyboardState.IsKeyDown(Keys.D1))
    {
        LoadScreen1();
    }
    else if (keyboardState.IsKeyDown(Keys.D2))
    {
        LoadScreen2();
    }
    base.Update(gameTime);
}
```