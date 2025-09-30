---
id: orthographiccamera
sidebar_label: Orthographic Camera
title: Orthographic Camera
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

This camera type creates a view with no depth perception.  Exactly what is wanted for a 2D game.  Below are some of the common actions you might want to take with the camera.  There are many other methods and attributes on the class you can use and modify to get different behavior.

## Creating the camera

To create a camera initialize an instance of it using one of the constructor overloads. It's recommended that you used a viewport adapter to scale the screen but you don't have to.  The camera has the same width and height values of a default Monogame project.
```csharp
private OrthographicCamera _camera;

protected override void Initialize()
{
    base.Initialize();

    var viewportAdapter = new BoxingViewportAdapter(Window, GraphicsDevice, 800, 480);
    _camera = new OrthographicCamera(viewportAdapter);
}
```

## Applying the camera to the world 

Having the camera instance is useless unless we tell Monogame's spriteBatch to use the camera.

You'll need to apply the camera's view matrix to one or more of the `SpriteBatch.Begin` calls in your `Draw` method.

```csharp
protected override void Draw(GameTime gameTime)
{
    var transformMatrix = _camera.GetViewMatrix();
    _spriteBatch.Begin(transformMatrix: transformMatrix);
    _spriteBatch.DrawRectangle(new RectangleF(250,250,50,50), Color.Black, 1f);
    _spriteBatch.End();
}
```

In the above example, a single black rectangle is drawn at (250, 250), and because the camera was (800, 480), this means it will fit everything from (0,0) to (800,480) on the screen (Zooming in or out as needed).  Since the size matches the default Monogame Viewport and GraphicsDevice siz, no scaling will take place.

A `TransformationMatrix` is one of the parameters of a `SpriteBatch.Begin` call.

The transformation matrix is used for scale, rotate, and translate options.
In other words, we use the camera to transform the way a batch of sprites is rendered to the screen without actually modifying their positions, rotations, or scales directly. This creates the effect of having a camera looking at your scene that can move, rotate, and zoom in and out.



## Moving the camera

A method `Move` has been exposed allowing you to pass a Vector2 distance in the X and Y direction to move the camera.

Camera movement should be done in the `Update` method somehow. For example, you could move the camera's position with the arrow keys.

```csharp
private Vector2 GetMovementDirection()
{
    var movementDirection = Vector2.Zero;
    var state = Keyboard.GetState();
    if (state.IsKeyDown(Keys.Down))
    {
        movementDirection += Vector2.UnitY;
    }
    if (state.IsKeyDown(Keys.Up))
    {
        movementDirection -= Vector2.UnitY;
    }
    if (state.IsKeyDown(Keys.Left))
    {
        movementDirection -= Vector2.UnitX;
    }
    if (state.IsKeyDown(Keys.Right))
    {
        movementDirection += Vector2.UnitX;
    }
    return movementDirection;
}

protected override void Update(GameTime gameTime)
{
    const float movementSpeed = 200;
    _camera.Move(GetMovementDirection() * movementSpeed * gameTime.GetElapsedSeconds());
}
```

You can now move the camera around using the Arrow keys.

## Zooming with the camera

The default value for zoom is 1.0f.  Increasing this value will make the scene larger, while decreasing will make it smaller.

When possible try to use the convenient methods `ZoomIn` and `ZoomOut` instead of directly setting the `Zoom` value.  It's ok to set the `Zoom` value, but be aware `Zoom` can throw an exception if you pass too large of a value.  While the convenient methods clamp their values to prevent an error.

```csharp
// Add this to the Game1.cs file
private void AdjustZoom()
{
    var state = Keyboard.GetState();
    float zoomPerTick = 0.01f;
    if (state.IsKeyDown(Keys.Z))
    {
        _camera.ZoomIn(zoomPerTick);
    }
    if (state.IsKeyDown(Keys.X))
    {
        _camera.ZoomOut(zoomPerTick);
    }
}

// Add this to the Update() method
AdjustZoom();
```

You can now press Z to zoom in, and X to zoom out.

## Rotating the camera

Rotating the camera is just as easy as zooming.  The important thing to be aware of is that the rotation is around the Center point called the `Origin`.  If you don't want to rotate the scene based on the middle of the screen, you'll need to adjust the origin.

```csharp
// Place this method in the Game1.cs file with the other methods
private void RotateCamera()
{
    var state = Keyboard.GetState();
    float rotateRadiansPerTick = 0.01f;
    if (state.IsKeyDown(Keys.OemSemicolon))
    {
        _camera.Rotate(rotateRadiansPerTick);
    }
    if (state.IsKeyDown(Keys.OemQuotes))
    {
        _camera.Rotate(-rotateRadiansPerTick);
    }
}

// Place this in the Update method
RotateCamera();
```

You can press ; (semicolon) to rotate left, and ' (apostrophe) to rotate right.

## Get World coordinates

Last but not least, there'll be times when you want to convert from screen coordinates to world coordinates and vice-versa.  

For example, if you want to know which sprite is under the mouse you'll need to convert the mouse position (screen position) back into the world position that was used to position the sprite in the first place.  Use the `ScreenToWorld` method for that.
```csharp
var mouseState = Mouse.GetState();
_worldPosition = _camera.ScreenToWorld(new Vector2(mouseState.X, mouseState.Y));
```

If you need to instead convert a world position into a screen position, you can use `WorldToScreen`.  Assuming you have a character in the world called `player`, you can use this.
```csharp
_screenPosition = _camera.WorldToScreen(new Vector2(player.X, player.Y));
```


## Further Reading

 - [Matrix Basics](https://stevehazen.wordpress.com/2010/02/15/matrix-basics-how-to-step-away-from-storing-an-orientation-as-3-angles/)
 - [Orthographic Camera](https://en.wikipedia.org/wiki/Orthographic_projection)