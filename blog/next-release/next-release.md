---
slug: next-release
title: Next Release Draft
authors: aris
tags: ['updates', 'releases', 'five-oh', 'ember']
enableComments: true
draft: true
---

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
