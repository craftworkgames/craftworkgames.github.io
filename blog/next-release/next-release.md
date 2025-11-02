---
slug: next-release
title: Next Release Draft
authors: aris
tags: ['updates', 'releases', 'five-oh', 'ember']
enableComments: true
draft: true
---

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

### Pitch Property Deprecated

The `Pitch` property and related methods (`MinimumPitch`, `MaximumPitch`, `PitchUp`, `PitchDown`) have been marked as obsolete with compiler warnings. While the original intent was to provide vertical scaling, pitch doesn't make semantic sense for an orthographic camera and will be removed in version 6.0.0.

Existing code using these properties will continue to work with warnings. If you need non-uniform scaling effects, consider implementing a custom camera solution or waiting for future camera types that may better support these needs.

### Camera Code Quality Improvements

Several internal improvements have been made to the camera implementation:

- Property setters now use `MathHelper.Clamp()` for cleaner, more maintainable code
- Exception handling updated to use `ArgumentOutOfRangeException.ThrowIfLessThan()` helper methods
- Comprehensive XML documentation added following .NET style conventions
- Extensive unit test coverage for all camera functionality including world bounds edge cases

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

Reference: [https://github.com/MonoGame-Extended/MonoGame-Extended/issues/973](https://github.com/MonoGame-Extended/MonoGame-Extended/issues/973)

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

Reference: [https://github.com/MonoGame-Extended/MonoGame-Extended/issues/1028](https://github.com/MonoGame-Extended/MonoGame-Extended/issues/1028)