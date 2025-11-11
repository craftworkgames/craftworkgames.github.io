---
slug: version-5-3-
title: Version 5.3.0 Release - Bug fixes and improvements
authors: aris
tags: ['updates', 'releases', 'five-oh']
enableComments: true
draft: true
---

import zoomToPointDesktop from './zoom-to-point-desktop.webm'

I'm excited to announce the release of MonoGame Extended 5.3.0! This update represents a significant step forward in the commitment to delivering a more stable library.

Version 5.3.0 focuses on resolving long standing community issues and implementing features that have accumulated over time. While this release doesn't include the comprehensive Tiled and tile map system overhaul (which remains the next major milestone), I prioritized delivering immediate value through bug fixes, API improvements, and new functionality that have been asking for.

In the sections below you can find a breakdown of all of the changes that made it into this release.  As always, please provide any feedback or report any bugs that you might find.  

- GitHub: [https://github.com/monogame-extended/monogame-extended](https://github.com/monogame-extended/monogame-extended)
- Release Notes: [https://github.com/MonoGame-Extended/Monogame-Extended/releases/tag/v5.2.0](https://github.com/MonoGame-Extended/Monogame-Extended/releases/tag/v5.3.0)

## Math and Primitives Changes

### RectangleF Normalize Method

The `RectangleF` struct now includes `Normalize()` methods to handle rectangles with negative width or height values. This addresses scenarios when creating rectangles from directional vectors (such as projectiles) or drag operations where the end point may be less than the start point.

Three overloads are provided to match existing `RectangleF` patterns:

```cs
// Instance method - normalize in-place
RectangleF rect = new RectangleF(32, 32, -32, -32);
rect.Normalize();
// Result: (0, 0, 32, 32)

// Static method - returns normalized copy
RectangleF normalized = RectangleF.Normalize(rect);

// Ref/out method - for performance-critical scenarios
RectangleF.Normalize(ref rect, out RectangleF result);
```

When a rectangle has negative dimensions, `Normalize()` adjusts the position coordinates and makes the dimensions positive without changing the rectangle's actual location. This ensures intersection tests, collision detection, and drawing operations work correctly.

The `RectangleExtensions` class was also updated to provide similar `Normalize()` methods for MonoGame's `Rectangle` struct.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/747

### RectangleF Method Naming Convention Fix

The `RectangleF` intersection methods have been updated to follow .NET naming conventions where method names should be verbs. The `Intersection()` methods have been marked as obsolete and will be removed in the next major version.

The preferred `Intersect()` methods are now the primary API.  Existing code using `Intersection()` methods will continue to work but will show deprecation warnings.

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/1064

## Camera Changes

### OrthographicCamera World Bounds

The `OrthographicCamera` now supports constraining camera movement and zoom to stay within defined world boundaries.

To use world bounds, simply call `EnableWorldBounds` with a rectangle defining your world area:

```cs
// Define the boundaries of your game world (e.g., a 1920x1080 level)
Rectangle worldBounds = new Rectangle(0, 0, 1920, 1080);

// Enable world bounds constraints
_camera.EnableWorldBounds(worldBounds);

// Optionally, prevent zooming out beyond the world bounds
_camera.IsZoomClampedToWorldBounds = true;
```

Once enabled, the camera automatically clamps its position so the viewport edges never extend beyond the world bounds. If the world is smaller than the viewport, the camera centers itself on the world. World bounds work seamlessly with the `LookAt` method, making it easy to follow a player while respecting level boundaries.

For more information, reference the [Constraining Camera Movement with World Bounds](../../docs/features/camera/orthographic-camera/orthographic-camera.md#constraining-camera-movement-with-world-bounds) documentation.

Reference: [https://github.com/MonoGame-Extended/Monogame-Extended/issues/64](https://github.com/MonoGame-Extended/Monogame-Extended/issues/64)

### Zoom Toward Point

The `OrthographicCamera` now supports zooming towards a specific world position with the new `ZoomIn(float, Vector2)` and `ZoomOut(float, Vector2)` overloads.  This enables zooming while keeping that point fixed ont he screen as the zoom level changes, such as zooming with the mouse wheel at the cursor position.

```cs
private float _previousScrollWheelValue;

protected override void Update(GameTime gameTime)
{
    MouseState mouseState = Mouse.GetState();
    
    // Convert mouse position to world coordinates
    Vector2 worldPosition = _camera.ScreenToWorld(mouseState.Position.ToVector2());

    // Zoom toward the mouse center
    int scrollDelta = mouseState.ScrollWheelValue - _previousScrollWheelValue;
    if (scrollDelta > 0)
    {
        _camera.ZoomIn(0.1f, worldPosition);
    }
    else if (scrollDelta < 0)
    {
        _camera.ZoomOut(0.1f, worldPosition);
    }

    _previousScrollValue = mouseState.ScrollWheelValue;

    base.Update(gameTime);    
}
```

<video width="100%" height="auto" controls autoplay>
  <source src={zoomToPointDesktop}/>
</video>

The camera automatically adjusts its position to maintain the zoom center's screen position.  When zoom is constrained by `MinimumZoom`, `MaximumZoom`, or world bounds, position adjustment is skipped to prevent unexpected camera movement.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/625

### Pitch Property Deprecated

The `Pitch` property and related methods (`MinimumPitch`, `MaximumPitch`, `PitchUp`, `PitchDown`) have been marked as obsolete with compiler warnings. While the original intent was to provide vertical scaling, pitch doesn't make semantic sense for an orthographic camera and will be removed in version 6.0.0.

Existing code using these properties will continue to work with warnings. If you need non-uniform scaling effects, consider implementing a custom camera solution or waiting for future camera types that may better support these needs.

### OrthographicCamera Coordinate Transformation Fix

The `WorldToScreen` and `ScreenToWorld` methods in `OrthographicCamera` have been fixed to correctly handle viewport offsets based on the viewport adapter type. Previously, viewport offset adjustments were unconditionally applied, causing incorrect transformations when using non-scaling viewport adapters.
The fix ensures proper behavior across different viewport adapter types:

- `DefaultViewportAdapter`: Viewport offset is now correctly ignored, as it represents only the rendering position and not part of the coordinate transformation. Mouse input coordinates are properly translated directly to world space.
- `BoxingViewportAdapter` / `ScalingViewportAdapter`: Viewport offset is correctly applied to convert between window coordinates (from mouse input) and viewport coordinates before scale transformations are applied.

This resolves issues where mouse input and touch coordinates were incorrectly transformed when the window origin was not at (0,0), which commonly occurred with letterboxing or pillarboxing scenarios

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/793

### Camera Code Quality Improvements

Several internal improvements have been made to the camera implementation:

- Property setters now use `MathHelper.Clamp()` for cleaner, more maintainable code
- Exception handling updated to use `ArgumentOutOfRangeException.ThrowIfLessThan()` helper methods
- XML documentation added
- Unit test coverage for all camera functionality

## Content Management Changes

### ExtendedContentManager Extensibility

The `ExtendedContentManager` class now exposes four utility methods as `protected` instead of `private`, enabling developers to create derived classes for custom asset types without code duplications.  The newly accessible protected methods are:

- `GetStream(string path)`: Opens file streams for both absolute and relative paths. Relative paths are resolved using `TitleContainer`.
- `CacheAsset(string name, object obj)`: Caches loaded assets with automatic disposal registration.
- `NoExtension(string name)`: Checks if an asset path has a file extension.
- `TryGetCachedAsset<T>(string name, out T asset)`: Retrieves a previously loaded cached asset with type safety.

Example implementation:

```cs
public class CustomContentManager : ExtendedContentManager
{
    public CustomContentManager(IServiceProvider serviceProvider)
        : base(serviceProvider) { }

    public CustomAsset LoadCustomAsset(string path)
    {
        // Check if already cached
        if(TryGetCachedAsset<CustomAsset>(path, out CustomAsset asset))
        {
            return asset;
        }

        // Use base monogame content manager class if no extension (processed content)
        if(NoExtension(path))
        {
            return Load<CustomAsset>(path)
        }

        // Load from raw file
        using Stream stream = GetStream(path);
        asset = CustomAsset.FromStream(stream);

        // Cache for reuse
        CacheAsset(path, asset);
        return asset;
    }
}
```

This change maintains backward compatibility while providing a clean, consitent API for extending the content management system.

Additionally, missing XML documentation has been added to members of the `ExtendedContentManager` class and the new `protected` methods are now documented for consumers.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/973

## Screen Management Changes

### Stack-Based Screen Management With Background Updates

The `ScreenManager` now supports multiple active screens simultaneously.  Screens can continue updating and drawing in the background, enabling scenarios like rooms that maintain states while the player is elsewhere, or pause menus that overlay gameplay.

Each screen now has two properties to control its background behavior:

```cs
public abstract class Screen
{
    // True if this is the topmost screen.
    public bool IsActive { get; }

    // Continue updating when not active.
    public bool UpdateWhenInactive { get; set; }

    // Continue drawing when not active.
    public bool DrawWhenInactive { get; set; }
}
```

The `ScreenManager` provides a clean API for managing the screen stack:

```cs
// Showing a pause menu on top of a gameplay screen.
// The gameplay screen remains in the background
screenManager.ShowScreen(gameplayScreen);
screenManager.ShowScreen(pauseMenu);

// Close the pause screen to go back to the game screen
screenManager.CloseScreen();

// Replace the active screen
screenManager.ReplaceScreen(mainMenu);

// Close all screens
screenManager.ClearScreens();
```

The implementation includes performance optimizations with internal cache to eliminate per-frame allocations during update and draw loops.  The existing `LoadScreen()` method remains supported for backward compatibility but is marked as obsolete, with the new `Show`/`Close`/`Replace` methods providing more explicit control over screen lifecycle.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/958

## Entity Component System Changes

### World Entity Lifecycle Events

The `World` class now exposes public events that fire when entities are added, removed, or have their component composition changed.  This enabled integration between the ECS and other subsystems without requiring each system to implement its own entity tracking.

Three events are now available:

```cs
public class World : SimpleDrawableGameComponent
{
    // Fires when an entity is added during the update cycle
    public event Action<int> EntityAdded;

    // Fires when an entity is removed during the update cycle (before destruction)
    public event Action<int> EntityRemoved;

    // Fires when an entity's composition changes
    public event Action<int> EntityChanged;
}
```

The events are useful for keeping external systems synchronized with the ECS.

All entity lifecycle events are raised during the `World.Update()` cycle ensuring consistent timing and allowing subscribers to safely access entity components during event handlers.  The `EntityRemoved` event is raised before the entity is destroyed, giving subscribers a final opportunity to perform operations such as cleanup.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/1026

### ComponentMapper OnDelete Event Timing

The `ComponentMapper<T>.OnDelete` event now fires before the component is removed rather than after.  This change allows event handlers to access the component data during cleanup operations, enabling scenarios where external resources need to be cleaned up based on component state.

Previously, the event was invoked after setting the component to `null`, making it impossible to reference the component during the deletion event. The new timing enables cleanup patterns like destroying physic bodies that are tied to ECS components:

```cs
// Subscript to component deletion
ComponentMapper<PhysicsComponent>  physicsMapper = componentManager.GetMapper<PhysicsComponent>();
physicsMapper.OnDelete += (entityId) =>
{
    // Component is still accessible during the event
    PhysicsComponent physicsComponent = physicsMapper.Get(entityId);

    // Clean up the associated physics body
    _physicsWorld.DestroyBody(physicsComponent.BodyId);
};
```

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/1062

## Sprite Changes

### Sprite Copy Constructor and Clone Method

The `Sprite` class now supports creating copies through a copy constructor and `Clone()` method. This makes it easier to create multiple sprite instances with different properties (such as `SpriteEffects`) without mutating the original sprite.

```cs
// Create a base sprite
Sprite originalSprite = new Sprite(texture);

// Create a copy using the copy constructor
Sprite copy1 = new Sprite(originalSprite);

// Or use the Clone method
Sprite copy2 = originalSprite.Clone();

// Modify the copy without affecting the original
copy1.Effect = SpriteEffects.FlipHorizontally;
copy2.Effect = SpriteEffects.FlipVertically;
```

Both methods perform a shallow copy where the new sprite shares the same `TextureRegion` reference but has independent copies of all other properties like `Color`, `Alpha`, `Effect`, and `Depth`. This is particularly useful when you need to render the same texture with different visual effects or properties.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/1028
