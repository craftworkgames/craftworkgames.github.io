---
slug: version-5-4-0
title: Version 5.4.0 Release - Backlog Reduction and Stability Improvements
authors: aris
tags: ['updates', 'releases', 'five-oh', 'tilemaps']
enableComments: true
---

Hi everyone,

Over the past couple of months one of the areas I have focused on has been to reduce the issue backlog as much as possible without requiring a major version bump.

When this effort started, MonoGame.Extended was sitting at roughly 70 to 75 open issues. As of this release, that number is down to 17.

Some of those issues were closed because they were tied directly to the legacy Tiled integration, which is being replaced entirely by the new agnostic tilemap system. Rather than continue patching a system that is scheduled for removal in the next major version, those issues were triaged in the context of the new architecture.

Version 5.4.0 is not about introducing a large new feature. It is about correctness, performance, API consistency, and preparing the for what comes next.

<!-- truncate -->

## Table of Contents

- [Triangulator Improvements](#triangulator-improvements)
  - [Heap Allocation Reduction](#heap-allocation-reduction)
  - [Winding Order Fix](#winding-order-fix)
- [Primitive Drawing Updates](#primitive-drawing-updates)
  - [Alpha Rendering Fix](#alpha-rendering-fix)
  - [Arc Drawing Support](#arc-drawing-support)
  - [Outline Parameter Consistency](#outline-parameter-consistency)
  - [Batcher2D Deprecation](#batcher2d-deprecation)
- [Tweening System Improvements](#tweening-system-improvements)
  - [OnUpdate Callback](#onupdate-callback)
  - [Exposing Active Tweens](#exposing-active-tweens)
  - [Easing Combinators](#easing-combinators)
- [Screen Lifecycle Hooks](#screen-lifecycle-hooks)
- [Collision Layer Self-Collision Fix](#collision-layer-self-collision-fix)
- [AOT and Trimming Support for Content Readers](#aot-and-trimming-support-for-content-readers)
- [Texture2DAtlas.Name Fix](#texture2datlasname-fix)
- [BoxingViewportAdapter and Camera Triage](#boxingviewportadapter-and-camera-triage)
- [Camera Fit Example](#camera-fit-example)
- [Tilemap Overhaul Status](#tilemap-overhaul-status)
- [Closing Thoughts](#closing-thoughts)

## Triangulator Improvements

Two separate issues were addressed in the triangulation system.

### Heap Allocation Reduction

It was reported that calling `DrawSolidPolygon` resulted in significant heap allocations, in some cases tens of kilobytes per call for moderately sized polygons. Profiling revealed that the dominant cause was struct boxing inside a generic `IndexOf` implementation used by the ear-clipping loop.

The issue was that the internal `Vertex` struct did not implement `IEquatable<Vertex>`. Because of this, equality checks inside a generic method fell back to `object.Equals`, causing boxing on every comparison. Since ear clipping is O(n^2), that boxing compounded quickly.

The fix involved:

- Implementing `IEquatable<Vertex>` on the struct.
- Switching to `EqualityComparer<T>.Default` inside the generic comparison loop.
- Reusing the triangle list buffer instead of allocating a new list per call.
- Avoiding unnecessary array cloning when the winding order was already correct.

The results were significant:

**Baseline Benchmark (Before Fix)**

| Method               | Mean        | Error     | StdDev    | Ratio | RatioSD | Gen0    | Allocated | Alloc Ratio |
| -------------------- | ----------- | --------- | --------- | ----- | ------- | ------- | --------- | ----------- |
| Triangulate_Square   | 980.3 ns    | 22.84 ns  | 67.33 ns  | 1.00  | 0.00    | 0.8602  | 2.64 KB   | 1.00        |
| Triangulate_Pentagon | 1,589.3 ns  | 31.40 ns  | 74.01 ns  | 1.65  | 0.12    | 1.3847  | 4.24 KB   | 1.61        |
| Triangulate_Circle16 | 17,316.5 ns | 302.01 ns | 267.72 ns | 18.03 | 0.98    | 14.1296 | 43.33 KB  | 16.41       |

**Source Benchmark (After Fix)**

| Method               | Mean       | Error     | StdDev    | Median     | Ratio | RatioSD | Gen0   | Allocated | Alloc Ratio |
| -------------------- | ---------- | --------- | --------- | ---------- | ----- | ------- | ------ | --------- | ----------- |
| Triangulate_Square   | 536.1 ns   | 12.41 ns  | 36.58 ns  | 547.1 ns   | 1.00  | 0.00    | 0.1574 | 496 B     | 1.00        |
| Triangulate_Pentagon | 889.6 ns   | 19.86 ns  | 58.26 ns  | 884.4 ns   | 1.67  | 0.17    | 0.1984 | 624 B     | 1.26        |
| Triangulate_Circle16 | 8,009.7 ns | 160.16 ns | 288.79 ns | 8,020.4 ns | 15.39 | 1.11    | 0.6256 | 1984 B    | 4.00        |

**Benchmark Analysis (Allocations)**

| Shape          | Before   | After  | Reduction |
| -------------- | -------- | ------ | --------- |
| Square (4v)    | 2.64 KB  | 496 B  | 81.65%    |
| Pentagon (5v)  | 4.24 KB  | 624 B  | 85.63%    |
| Circle16 (16v) | 43.33 KB | 1984 B | 95.53%    |

Throughput improved as well since the boxing overhead in the hot loop was removed.

The triangulator still allocates due to linked list node usage, and the documentation warning about per-frame usage remains. However, the pathological allocation behavior has been resolved.

### Winding Order Fix

A separate issue was found in `DetermineWindingOrder`. The previous implementation counted clockwise versus counterclockwise turns and returned whichever count was higher.

This approach failed for polygons that have an equal number of left and right turns, such as a 5-point star. In those cases, both the polygon and its reverse could produce the same result.

The implementation was replaced with the standard signed-area, or shoelace, formula. The sign of the computed area determines winding order. This approach is more mathematically correct and, as a bonus, faster than the previous method.

New unit tests were added to validate clockwise, counterclockwise, reversed polygons, and the specific star regression case.

## Primitive Drawing Updates

Several improvements were made to the vector drawing system.

### Alpha Rendering Fix

Two issues were contributing to incorrect rendering of semi-transparent shapes:

1. `PrimitiveBatch.Begin()` was not setting a blend state, leaving the device in `BlendState.Opaque` after a clear. This caused alpha values to be ignored.
2. Filled shapes internally multiplied the provided color by `0.5f`, effectively halving the intended alpha value.

The fixes include:

- Setting `BlendState.NonPremultiplied` by default in `PrimitiveBatch.Begin()` and restoring the previous blend state in `End()`.
- Removing the internal `color * 0.5f` multiplication.
- Refactoring single-color overloads to delegate to two-color overloads to remove duplication.

Semi-transparent filled shapes now render correctly without the previous "pizza slice" seam artifacts.

### Arc Drawing Support

Arc drawing was added to `PrimitiveDrawing`:

- `DrawArc` for outline arcs.
- `DrawSolidArc` for filled pie slices.
- Overloads supporting separate outline and fill colors.

A matching `DrawArc` extension was also added to `ShapeExtensions` for SpriteBatch based debug drawing.

### Outline Parameter Consistency

`DrawSolidRectangle` and both `DrawSolidCircle` overloads now include a `bool outline = true` parameter, matching the API surface of `DrawSolidPolygon` and `DrawSolidEllipse`.

### Batcher2D Deprecation

The `Batcher2D` cluster was marked obsolete. It was never completed, has no internal dependencies, and does not reach feature parity with `SpriteBatch`. It will be removed in the next major version.

## Tweening System Improvements

The tweening system received both new functionality and API cleanup.

### OnUpdate Callback

A new `OnUpdate` method was added to `Tween`. It fires after each interpolation step, including the final one. This enables patterns such as:

- Pushing tweened values into ECS struct components.
- Logging or inspecting values mid-animation.
- Driving external systems without modifying the tween target directly.

Invocation order per update tick is now:

1. Interpolate value.
2. Invoke `OnUpdate`.
3. Invoke `OnEnd` if complete.

### Exposing Active Tweens

`Tweener` now exposes a `ActiveTweens` property returning a `ReadOnlySpan<Tween>`. This allows callers to:

- Check if all tweens are complete.
- Inspect active tweens without allocating.
- Avoid relying on the previous `AllocationCount` property.

`AllocationCount` has been marked obsolete and will be removed in the next major version.

### Easing Combinators

Two new public easing helpers were added:

- `Invert(Func<float, float>)`
- `Follow(Func<float, float>, Func<float, float>)`

These allow composing new easing curves from existing ones without writing additional math or allocating intermediate objects.

The entire tweening subsystem now has complete XML documentation coverage.

## Screen Lifecycle Hooks

`Screen` now includes two new virtual methods:

```csharp
public virtual void OnActivated() { }
public virtual void OnDeactivated() { }
````

These are invoked whenever a screen becomes the active top screen or stops being the top screen.

Previously, `Initialize()` only ran once, which made it difficult to handle reactivation scenarios such as returning from a sub-menu. These new hooks solve that problem cleanly and align with the existing override based API design.

Unit tests were added to validate first activation, push/deactivation, reactivation after close, and `ClearScreens` behavior.

## Collision Layer Self-Collision Fix

A bug was discovered in the collision system where actors assigned to a named layer would not collide with other actors in the same named layer.

The root cause was that the `(layer, layer)` collision pair was never registered for non-default layers. Only `(default, named)` pairs were added.

A single line was added during layer registration to ensure each named layer registers a self-collision pair. Two new tests were added to validate:

- Actors in the same named layer collide.
- Actors in different named layers do not collide unless explicitly configured.

## AOT and Trimming Support for Content Readers

When publishing with `PublishAot` or trimming enabled, reflection-based fallback inside MonoGame's content reader resolution can fail.

MonoGame preregisters its own readers using `ContentTypeReaderManager.AddTypeCreator`. MonoGame.Extended readers previously relied entirely on reflection.

Each Extended `ContentTypeReader` now includes a static `Register()` method. Users targeting NativeAOT or trimming can explicitly register only the readers they use. This avoids reflection fallback and preserves trimming friendliness.  Providing an explicit register per reader avoids a global "register all" method, which would defeat the purpose of trimming.  To use this, the `ContentTypeReader` you are using in your project can be registered inside `Game.Initialize` before you do any content loading like so:

```csharp
protected override void Initialize()
{
    // Call Register() only for the Extended content types you actually load.
    // This is only required when publishing with PublishAot or PublishTrimmed.
    Texture2DAtlasReader.Register();
    BitmapFontContentReader.Register();
    TiledMapReader.Register();
    TiledMapTilesetReader.Register(); // only needed if using external tilesets

    // JsonContentTypeReader<T> must be registered per concrete type
    JsonContentTypeReader<MyData>.Register();

    base.Initialize();
}
```

## Texture2DAtlas.Name Fix

`Texture2DAtlas.Name` was incorrectly set to the internal file system relative path generated by TexturePacker, such as `"../textures/sprites_0"`.

While the texture itself loaded correctly through `GetRelativeAssetName`, the atlas name should reflect the content asset path passed to `Content.Load`.

The constructor now uses `reader.AssetName`, ensuring that `Texture2DAtlas.Name` matches the content asset path, aligning behavior with how `Texture2D.Name` works in MonoGame.

## BoxingViewportAdapter and Camera Triage

Two reported issues involving `BoxingViewportAdapter` and `OrthographicCamera` were investigated.

After stepping through the math and comparing against Nez's `BestFit` implementation, the current implementation was confirmed to be correct.

In scenarios where bleed is enabled and the viewport slightly exceeds the window bounds, this is intentional behavior. It represents controlled cropping within the declared bleed allowance.

No code changes were required.

## Camera Fit Example

A question was posed in the issue asking for a working example demonstrating how to compute a camera center and zoom so that multiple world-space targets remain visible simultaneously.  For this, a small tutorial was written which can be found at:

[https://itch.io/blog/1424054/fitting-all-players-on-screen-with-monogameextended-orthographiccamera](https://itch.io/blog/1424054/fitting-all-players-on-screen-with-monogameextended-orthographiccamera)

This provides a clear, production-ready pattern for local co-op or multi-entity camera scenarios.

## Tilemap Overhaul Status

A large portion of the remaining open issues target the legacy `TiledMap` system. Much of the core and parser work is complete. Rendering system enhancements and performance benchmarking are ongoing.  You can now track the progress of this in the new tracking issue at

[https://github.com/MonoGame-Extended/Monogame-Extended/issues/1113](https://github.com/MonoGame-Extended/Monogame-Extended/issues/1113)

**No new feature work will go into the legacy `TiledMap` implementation.**

## Closing Thoughts

Version 5.4.0 is a stability and correctness release. It reduces allocations, fixes edge-case bugs, improves API clarity, and continues to shrink the backlog ahead of the next major version.

The next major milestone is the new tilemap system. That is where development focus is now concentrated.

As always, thank you to everyone who opens issues, submits PRs, provides reproduction projects, or supports the project in any way. Your feedback continues to shape the direction of MonoGame.Extended.

\- ❤️ Chris Whitley ([AristurtleDev](https://github.com/aristurtledev))
