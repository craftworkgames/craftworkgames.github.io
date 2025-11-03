---
id: screen-management
title: Screen Management
sidebar_label: Screen Management
description: Learn how to organize your game into multiple screens with support for background update and overlays.
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

The `ScreenManager` helps you organize your game into multiple screens, each wih their own lifecycle methods.  Screens are managed using a stack-based approach, allowing multiple screens to be active simultaneously.  This enables scenarios like pause menus that overlay gameplay, or rooms that continue updating while the player explores elsewhere.

## Understanding Screen Management

In MonoGame.Extended, screens are organizational units that encapsulate a specific part of your game's functionality.  Common examples include:

- **Main Menu Screen**: Title screen with menu navigation
- **Gameplay Screen**: Core game logic and rendering
- **Pause Menu Screen**: Game paused overlay
- **Settings Screen**: Configurations and options
- **Loading Screen**: Asset loading progress
- **Dialog Screen**: In-game conversations and prompts

The `ScreenManager` maintains a stack of screens where the topmost screen is considered "active."  You can show new screens on top of existing ones, close the active screen to return to the previous one, or replace screens entirely.

## Getting Started

### Adding the ScreenManager

First add the required namespaces to your game class:

```cs
using MonoGame.Extended.Screens;
using MonoGame.Extended.Screens.Transitions;
```

Next, declare the `ScreenManager` as a field in your `Game` class:

```cs
public class Game1 : Game
{
    private readonly ScreenManager _screenManager;

    // ... other fields
}
```

In your constructor, create the `ScreenManager` and register it as a game component:

```cs
public Game1()
{
    _graphics =  new GraphicsDeviceManager(this);
    Content.RootDirectory = "Content";

    _screenManager = new ScreenManager();
    Components.Add(_screenManager);
}
```

Registering the `ScreenManager` as a component ensures its `Initialize()`, `LoadContent()`, `Update()`, and `Draw()` methods are automatically called by the game loop.

### Creating Your First Screen

To create a screen, inherit from either `Screen` or `GameScreen`:

```cs
public class MainMenuScreen : GameScreen
{
    private SpriteFont _font;
    private Vector2 _titlePosition;

    public MainMenuScreen(Game game) : base(game)
    {
    }

    public override void LoadContent()
    {
        base.LoadContent();
        _font = Content.Load<SpriteFont>("Fonts/MenuFont");
        _titlePosition = new Vector2(100, 50);
    }

    public override void Update(GameTime gameTime)
    {
        KeyboardState keyboard = Keyboard.GetState();

        if(keyboard.IsKeyDown(Keys.Enter))
        {
            // Navigate to gameplay
            ScreenManager.ShowScreen(new GameplayScreen(Game));
        }
    }

    public override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(Color.CornflowerBlue);
        
        Game.SpriteBatch.Begin();
        Game.SpriteBatch.DrawString(_font, "Main Menu", _titlePosition, Color.White);
        Game.SpriteBatch.DrawString(_font, "Press Enter To Play", new Vector2(100, 100), Color.White);
        Game.SpriteBatch.End();
    }
}
```

:::note
`GameScreen` provides convenient properties like `Game`, `Content`, `GraphicsDevice` and `Services` for easy access to common game resources.  Use `Screen` as your base class if you don't need these conveniences.
:::

### Showing Your First Screen

In your game's `Initialize()` method, show the initial screen:

```cs
protected override void Initialize()
{
    base.Initialize();
    _screenManager.ShowScreen(new MainMenuScreen(this));
}
```

## Screen Lifecycle

Each screen has a well-defined lifecycle with the following methods:

| Method             | Purpose                              | When Called                             |
| ------------------ | ------------------------------------ | --------------------------------------- |
| `Initialize()`     | Initializes non-graphics resources.  | When the screen is first shown.         |
| `LoadContent()`    | Load graphics resources and content. | After `Initialize()`.                   |
| `Update(GameTime)` | Updates the game logic.              | Every frame while screen should update. |
| `Draw(GameTime)`   | Renders the screen.                  | Every frame while screen should draw.   |
| `UnloadContent()`  | Unload content resources.            | Before screen is disposed.              |
| `Dispose()`        | Release all resources.               | When screen is closed.                  |

The `ScreenManager` automatically calls these methods at the appropriate time during the screen's lifecycle.

## Managing Screens

### ShowScreen - Display a New Screen

Use `ShowScreen()` to display a new screen on top of the current one:

```cs
// Show a new screen (previous screen stays in the background)
_screenManager.ShowScreen(new GameplayScreen(Game));

// Show with a transition effect
_screenManager.ShowScreen(new GameplayScreen(Game), new FadeTransition(GraphicsDevice, Color.Black, 0.5f));
```

The previous screen remains in the stack but becomes inactive.  By default, inactive screens do not update or draw.

### CloseScreen - Return to Previous Screen

Use `CloseScreen()` to close the active scree and return to the previous one.

```cs
// Close current screen
_screenManager.CloseScreen();

// Close with a transition effect
_screenManager.CloseScreen(new FadeTransition(GraphicsDevice, Color.Black, 0.5f));
```

The closed screen is disposed, and the next screen in the stack becomes active.

### ReplaceScreen - Replace the Active Screen

Usee `ReplaceScreen()` to close the active screen and show a new one:

```cs
// Replace current screen (closes it and shows a new one)
_screenManager.ReplaceScreen(new MainMenuScreen(Game));

// Replace with a transition effect
_screenManager.ReplaceScreen(new MainMenuScreen(Game), new FadeTransition(GraphicsDevice, Color.Black, 0.5f));
```

This is equivalent to calling `CloseScreen()` followed by `ShowScreen()`.

### ClearScreens - Remove All Screens

Use `ClearScreens()` to close and dispose all screens:

```cs
// Remove all screens from the stack
_screenManager.ClearScreens();

// Useful for returning to main menu from anywhere
_screenManager.ClearScreens();
_screenManager.ShowScreen(new MainMenuScreen(Game));
```

## Background Screen Behavior

One of the features of the `ScreenManager` is the ability to control whether screens continue updating and drawing then they are not active.  This is controlled by two properties on the `Screen` class:

### UpdateWhenInactive Property

Set `UpdateWhenInactive` to `true` to keep a screen updating even when it is not active:

```cs
public class RoomScreen : GameScreen
{
    public RoomScreen(Game game) : base(game)
    {
        // Keep this screen updating in the background
        UpdateWhenInactive = true;
    }

    public override void Update(GameTime gameTime)
    {
        // This continues to run even when another screen is shown
        UpdateEnemies(gameTime);
    }
}
```

### DrawWhenInactive Property

Set `DrawWhenInactive` to `true` to keep a screen rendering even when it is not active:

```cs
public class GameplayScreen : GameScreen
{
    public GameplayScreen(Game game) : base(game)
    {
        // Keep his screen visible when other screens overlay it
        DrawWhenInactive = true;
    }

    public override void Draw(GamTime gameTime)
    {
        // This continues to draw even when a pause menu is show
        DrawGameWorld();
    }
}
```

### IsActive Property

The `IsActive` property (read-only) indicates whether a screen is currently the topmost screen:

```cs
public override void Update(GameTime gameTime)
{
    if(IsActive)
    {
        // Only process input when this is the active creen.
        ProcessPlayerInput();
    }

    // This always runs if UpdateWhenInactive is true
    UpdateGameLogic(gameTime);
}
```

Use `IsActive` to differentiate behavior between when a screen is active versus running in the background.

## Screen Transitions

The `SceneManager` supports smooth trnsitions between screens using the `Transition` class.  MonoGame.Extended includes a `FadeTransition` by default:

```cs
// Create a fade transition (black, 0.5 seconds)
FadeTransition fadeTransition = new FadeTransition(GraphicsDevice, Color.Black, 0.5f);

// Use with any screen operation
_screenManager.ShowScreen(new GameplayScreen(Game), fadeTransition);
_screenManager.CloseScreen(fadeTransition);
_screenManager.ReplaceScreen(new MainMenuScreen(Game), fadeTransition);
```

:::tip
Transitions can only be active one at a time.  if you try to start a new transition while one is already running, the request will be ignored.  This prevents overlapping transition effects.
:::

## Performance Considerations

The `ScreenManager` itself optimized to minimize per-frame allocations by internally caching the screen list and only rebuilding it when the stack changes.  However, keep these performance tips in mind:

### Be Mindful of Background Screens

Each screen with `UpdateWhenInactive = true` adds to your per-frame CPU cost.  If you have many screens updating in the background, consider:

- Reducing update frequency for inactive screens
- Pausing non-essential systems when screens aren't visible
- Using more efficient update logic for background screens.

### Drawing Multiple Screens

If you have multiple screens with `DrawWhenInactive = true`, they all render every frame.  For complex scenes:

- Consider rendering inactive screens to a render target once and caching it
- Use simple background or effects for inactive screens
- Disable particle effects and other GPU-intensive features when inactive.
