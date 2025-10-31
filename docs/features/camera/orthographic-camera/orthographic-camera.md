---
id: orthographiccamera
sidebar_label: Orthographic Camera
title: Orthographic Camera
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

The `OrthographicCamera` provides a 2D camera system with no depth perception, making it ideal for 2D games.  It uses transformation matrices to control what portion of your game world is visible on the screen without requiring you to manually reposition every game object.

## Understanding the Camera System

Before diving into the implementation, it is helpful to understand how the camera works.  Instead of moving all your game objects (enemies, players, tiles, backgrounds) every frame to simulate camera movement, the `OrthographicCamera` users matrix mathematics to transform the rendering view. Your game objects remain at their world positions while the camera determines which portion of the world is rendered and how it appears on the screen.

This approach offers several advantages:

- **Simplicity**: Move one camera instead of hundreds of objects
- **Performance**: Matrix transformations are highly optimized
- **Flexibility**: Easily add zoom, rotation, and follow behaviors
- **Clean separation**: World coordinates remain independent of screen coordinates

## Creating and Initializing the Camera

To use an `OrthographicCamera` in your game, you need to create an instance during initialization.  WWhile you can create a camera without a viewport adapter, using one is highly recommended for proper screen scaling across different resolutions.

### Basic Camera Setup

The following example whos how to initialize a camera with a `BoxingViewportAdapter`, which maintains your target aspect ration regardless of the actual widow size:

```cs
private OrthographicCamera _camera;

protected override void Initialize()
{
    base.Initialize();

    // Create a viewport adapter to that maintains an 800x480 virtual resolution
    BoxingViewportAdapter viewportAdapter = new BoxingViewportAdapter(Window, GraphicsDevice, 800, 480);

    // Initialize the camera with the viewport adapater
    _camera = new OrthographicCamera(viewportAdapter);
}
```

:::tip
Using a `ViewportAdapter` provides consistent coordinate systems across different screen resolutions and aspect ratios.  Choose the adapter type based on your scaling needs:

- `BoxingViewportAdapter`: Maintains aspect ratio with letterboxing/pillerboxing
- `ScalingViewportAdapter`: Stretches to fill the screen
- `DefaultViewportAdapter`: No scaling, uses actual screen dimensions

:::

### Alternative: Camera without Viewport Adapter

If you don't need scaling features, you can create a camera directly with a `GraphicsDevice:

```cs
_camera = new OrthographicCamera(GraphicsDevice);
```

This approach uses the graphic device's viewport dimensions as the camera's size.

## Apply the Camera Transformations

Creating a camera instance alone does not affect your rendering.  You must apply the camera's view matrix to your `SpriteBatch` to see its effects

### Using the View Matrix

Pass the camera's transformation matrix to `SpriteBatch.Begin()` using the `transformationMatrix` parameter:

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    // Get the camera's transformation matrix
    Matrix transformMatrix = _camera.GetViewMatrix();

    // Apply the transformation to the sprite batch
    _spriteBatch.Begin(transformationMatrix: transformMatrix);

    // Draw your game objects using world coordinates
    _spriteBatch.DrawRectangle(new RectangleF(250, 250, 50, 50), Color.Black, 1.0f);

    _spriteBatch.End();
}
```

:::important
Objects drawn within a `SpriteBatch.Begin/End` block that uses the camera's transform matrix should use **world coordinates**, not screen coordinates.  he camera handles the transformation from world space to screen space.
:::

### Understanding the Transformation

The transformation matrix affects how sprites are rendered:

- **Translation**: Moves the view based on camera position
- **Rotation**: Rotates the view around the camera's origin point
- **Scale**: Zooms in or out based on the camera's zoom level

In the example above, the rectangle at world position (250, 250) will appear at different screen positions depending on where the camera is looking.

## Moving the Camera

Camera movement is typically handled in the `Update` method.  The `OrthographicCamera` provides several ways to change the camera's positions

### Using the Move Method

The `Move` method translates the camera by a direction vector

```cs
private void GetMovementDirection()
{
    Vector2 movementDirection = Vector2.Zero;
    KeyboardState state = Keyboard.GetState();

    if (state.IsKeyDown(Keys.Down))
    {
        movementDIrection += Vector2.UnitY;
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

    // Calculate movement based on elapsed time for frame-rate independence
    Vector2 movement = GetMovementDirection() * movementSpeed * gameTime.GetElapsedSeconds();

    // Move the camera
    _camera.Move(movement);
}
```

:::note
The `Move` method respects the camera's rotation.  If the camera is rotated, the movement direction is transformed accordingly, making "up" always relative to the camera's orientation.
:::

### Using the Position Property

For direct position control, you can set the `Position` property:

```cs
// Directly set the camera position
_camera.Position = new Vector2(100, 200);

// Or modify the current position
_camera.Position += new Vector2(10, 0);
```

### Following a Game Object

A common pattern is making the camera follow a player or other entity.  Use the `LookAt` method to center the camera on a specific world position:

```cs
protected override void Update(GameTime gameTime)
{
    // Update player position
    _player.Update(gameTime);

    // Center the camera on the player
    _camera.LookAt(_player.Position);
}
```

The `LookAt` method automatically adjusts the camera position so the specified point appears at the center of the viewport.

## Controlling Camera Zoom

The camera's `Zoom` property controls the magnification level.  The default zoom value is `1.0f`, where higher values zoom in (objects appear larger) and lower values zoom out (objects appear smaller).

### Using Zoom Methods

The recommended approach for adjusting zoom is using the `ZoomIn` and `ZoomOut` methods:

```cs
private void HandleZoomInput()
{
    KeyboardState state = Keyboard.GetState();
    float zoomChange = 0.01f;

    if(state.IsKeyDown(Keys.Z))
    {
        _camera.ZoomIn(zoomChange);
    }

    if(state.IsKeyDown(Keys.X))
    {
        _camera.ZoomOut(zoomChange);
    }
}

protected override void Update(GameTime gameTime)
{
    HandleZoomInput();
    // ... other update logic
}
```

### Setting Zoom Directly

You can also set the zoom level directly:

```cs
// Set zoom directly
_camera.Zoom = 2.0f;
```

### Setting Zoom Constraints

You can set a minimum and maximum allowed zoom level for your camera using the `MinimumZoom` and `MaximumZoom` properties.  When the zoom level changes, either through the `ZoomIn/ZoomOut` methods or when setting the value directly with the `Zoom` property, the value will be clamped to respect the minimum and maximum ranges configured:

```cs
// Set a minimum zoom of 1.0f
_camera.MinimumZoom = 1.0f;

// Set the zoom to go below the minimum
_camera.Zoom = 0.9f;

// It gets clamped so it's now actually 1.0f
```

:::note
The zoom operations center ont he camera's `Origin` point, which is typically set to the viewport center.
:::

## Rotating the Camera

Camera rotation allows you to tilt the view, which can create interesting visual effects. The `Rotation` property uses radians, and rotation occurs around the camera's `Origin` point.

### using the Rotate Method

The `Rotate` method incrementally adjusts the rotation:

```cs
private void HandleRotationInput()
{
    KeyboardState state = Keyboard.GeState();
    float rotationSpeed = 0.01f;

    if(state.IsKeyDown(Keys.OemSemicolon))
    {
        _camera.Rotate(rotationSpeed);
    }

    if(state.IsKeyDown(Keys.OemQuotes))
    {
        _camera.Rotate(-rotationSpeed);
    }
}

protected override void Update(GameTime gameTime)
{
    HandleRotationInput();
    // ... other update logic
}
```

### Setting Rotation Directly

You can also set the rotation angle directly:

```cs
// Rotate 45 degrees clockwise
_camera.Rotation = MathHelper.ToRadians(45);

// Rotate 90 degrees counter-clockwise
_camera.Rotation = MathHelper.ToRadians(-90);
```

## Understanding the Origin Point

The `Origin` property defines the pivot point for rotation and zoom. By default, it is set to the center of the viewport, but you can adjust it for different effects:

```cs
// Rotate around the top-left corner
_camera.Origin = Vector2.Zer;

// Rotate around custom point
_camera.Origin = new Vector2(100, 100);
```

## Converting Between Screen and World Coordinates

One of the most important features of the camera system is converting between screen space (where the mouse cursor is) and world space (where your game objects are positioned).

### Converting Screen to World Coordinates

Use the `ScreenToWorld` method to convert a screen position (like a mouse click) to a world position:

```cs
protected override void Update(GameTime gameTime)
{
    MouseState mouseState = Mouse.GetState();

    // Convert mouse screen position to world position
    Vector2 mouseWorldPosition = _camera.ScreenToWorld(new Vector2(mouseState.X, mouseState.Y));

    // Now you can check if the mouse is over game objects
    if(IsPointInSprite(mouseWorldPosition, _sprite))
    {
        // Handle mouse over sprite
    }
}
```

This is essential for:

- **Mouse interaction**: Determining which game object the cursor is over
- **Touch input**: Converting touch position to world coordinates
- **UI Interaction**: Checking if clicks hit world-space UI elements.

### Converting World To Screen Coordinates

Use the `WorldToScreen` method to convert a world position to screen coordinates:

```cs
// Get player's screen position
Vector2 playerScreenPosition = _camera.WorldToScreen(_player.Position);

// Use this for screen-space UI elements that follow world objects
// For example, health bars or name tags that appear above characters
```

### Convenience Overloads

Both methods provide overloads for converting individual coordinates

```cs
// Convert using separate x and y values
Vector2 worldPos = _camera.ScreenToWorld(mouseState.X, mouseState.Y);
Vector2 screenPos = _camera.WorldToScreen(player.X, player.Y);
```

:::note
These conversion methods account for all camera transformations including position, rotation, and zoom.  They always return accurate coordinates regardless of the camera's current state.
:::

## Parallax Scrolling

The `OrthographicCamera` supports parallax scrolling effects, where different layers move at different speeds to create a sense fo depth.  This is achieved using the `GetViewMatrix` overload that accepts a parallax factor.

### Using Parallax Factors

The parallax factor is a `Vector2` where each component ranges from 0 to `:

- **1.0**: Layer moves at full camera speed (foreground)
- **0.5**: Layer moves at half camera speed (mid-ground)
- **0.0**: Layer doesn't move at all (background)

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    // Draw background layer (no movement with camera)
    Matrix backgroundMatrix = _camera.GetViewMatrix(Vector2.Zero);
    _spriteBatch.Begin(transformMatrix: backgroundMatrix);
    _spriteBatch.Draw(_backgroundTexture, Vector2.Zero, Color.White);
    _spriteBatch.End();

    // Draw mid-ground layer (moves at 50% speed)
    Matrix midgroundMarix = _camera.GetViewMatrix(new Vector2(0.5f, 0.5f));
    _spritBatch.Begin(transformMatrix: midgroundMatrix);
    DrawMidgroundObject(_spriteBatch);
    _spriteBatch.End();

    // Draw foreground layer (moves at full camera speed)
    Matrix foregroundMatrix = _camera.GetViewMatrix(Vector2.One);
    _spritBatch.Begin(transformMatrix: foregroundMatrix);
    DrawForegroundObject(_spriteBatch);
    _spriteBatch.End();
}
```

:::tip
You can use different parallax factors for X and Y axes.  For example `new Vector2(0.5f, 1.0f)` would create a horizontal parallax while maintaining vertical synchronization.
:::

### Checking Visibility

Determine if objects are within the camera's view using the `Contains` methods:

```csharp
// Check if a point is visible
ContainmentType pointVisibility = _camera.Contains(_enemy.Position);

// Check if a rectangle is visible
Rectangle enemyBounds = new Rectangle((int)_enemy.Position.X, (int)_enemy.Position.Y, 32, 32);
ContainmentType boundsVisibility = _camera.Contains(enemyBounds);

if (boundsVisibility != ContainmentType.Disjoint)
{
    // Enemy is at least partially visible
    _enemy.Draw(_spriteBatch);
}
```

## Checking Object Visibility

When working with large game worlds, you often need to determine which bojects are currently visible in the camera's view.  Drawing only visible objects is a critical optimization technique that can significantly imporve performance.  The `OrthographicCamera` provides `Contain` methods to check whether points or rectangles are within the camera's viewable area.

### Understanding Containment Types

The `Contains` methods return a `ContainmentType` enum value that describes the spatial relationship between the object and the camera's view:

- `ContainmentType.Contains`: The object is completely inside the camera's view
- `ContainmentType.Intersects`: The object is partially inside the camera's view (overlapping the edge)
- `ContainmentType.Disjoint`: The object is completely outside the camera's view (not visible)

### Check Point Visibility

Use the `Contains(Vector2)` overload to check if a specific point is visible:

```cs
protected override void Update(GameTime gameTime)
{
    // Check if the enemy position is visible
    ContainmentType visibility = _camera.Contains(_enemy.Position);
    
    if (visibility != ContainmentType.Disjoint)
    {
        // Enemy is visible, perform AI updates
        _enemy.Update(gameTime);
    }
}
```

You can also check `Point` coordinates directly

```cs
Point tilePosition = new Point(10, 15);
ContainmentType tileVisibility = _camera.Contains(tilePosition);
```

### Checking Rectangle Visibility

For objects with width and height, use the `Contains(Rectangle)` overload to check if their bounding box is visible:

```cs
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    Matrix transformMatrix = _camera.GetViewMatrix();
    _spriteBatch.Begin(transformMatrix: transformMatrix);
    
    // Only draw enemies that are visible
    foreach (var enemy in _enemies)
    {
        Rectangle enemyBounds = new Rectangle(
            (int)enemy.Position.X, 
            (int)enemy.Position.Y, 
            enemy.Width, 
            enemy.Height
        );
        
        ContainmentType boundsVisibility = _camera.Contains(enemyBounds);
        
        if (boundsVisibility != ContainmentType.Disjoint)
        {
            // Enemy is at least partially visible
            enemy.Draw(_spriteBatch);
        }
    }
    
    _spriteBatch.End();
}
```

:::tip
Use `ContainmentType.Disjoint` to check if an object is *not* visible.  This is more effcient than checking for `Contains` or `Intersects` individually, especially when you only care about whether to skip drawing an object.
:::

### Checking Partial Visibility

Sometimes you need to know if an object is *fully* visible versus just partially visible:

```cs
ContainmentType visibility = _camera.Contains(objectBounds);

if (visibility == ContainmentType.Contains)
{
    // Object is completely visible
    DrawFullObject(objectBounds);
}
else if (visibility == ContainmentType.Intersects)
{
    // Object is partially visible (clipped by screen edge)
    DrawClippedObject(objectBounds);
}
else
{
    // Object is not visible at all
    // Don't draw anything
}
```

### Performance Considerations

Visibility checking is a valuable optimization technique but it does have a small cost. Consider these guidelines:

- **Always check for large game worlds**: If you have hundreds or thousands of objects, culling offscreen objects provides significant performance gain
- **Skip checking for small scenes**: If your entire game world fits on screen, visibility checks add unnecessary overhead
- **Cache bounding rectangles**: Calculate and store object bounds rather than recreating them each frame
- **Use spatial partitioning for very large world**: For massive worlds, combine visibility checking with spatial data structures like quad-trees for optimal performance

:::note
The `Contains` method uses the camera's bounding frustum or accurate visibility testing.  This accounts for camera position, zoom,and rotation, providing precise results regardless of the camera's current state.
:::

## Camera Properties Reference

The `OrthographicCamera` exposes several properties for querying camera state:

### Position and Bounds Properties

- **`Position`**: Gets or sets the camera position in world coordinates
- **`Center`**: Gets the center point of the camera's view in world coordinates (read-only)
- **`Origin`**: Gets or sets the pivot point for rotation and zoom transformations
- **`BoundingRectangle`**: Gets the axis-aligned bounding rectangle of the camera's view in world coordinates (read-only)

```csharp
// Example: Check if an object is in the camera's view
if (_camera.BoundingRectangle.Contains(_enemy.Position))
{
    // Enemy is visible, update and draw it
}
```

### Transform Properties

- **`Rotation`** - Gets or sets the camera rotation in radians
- **`Zoom`** - Gets or sets the zoom level (1.0 is default)
- **`MinimumZoom`** - Gets or sets the minimum allowed zoom level
- **`MaximumZoom`** - Gets or sets the maximum allowed zoom level

This camera type creates a view with no depth perception.  Exactly what is wanted for a 2D game.  Below are some of the common actions you might want to take with the camera.  There are many other methods and attributes on the class you can use and modify to get different behavior.

## Further Reading

- [Matrix Basics](https://stevehazen.wordpress.com/2010/02/15/matrix-basics-how-to-step-away-from-storing-an-orientation-as-3-angles/)
- [Orthographic Camera](https://en.wikipedia.org/wiki/Orthographic_projection)
