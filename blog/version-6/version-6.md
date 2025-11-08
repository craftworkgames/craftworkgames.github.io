---
slug: version-6
title: Version 6 Draft
authors: aris
tags: ['updates', 'releases', 'five-oh', 'ember']
enableComments: true
draft: true
---

## Entity Component System Changes

### Component Type Limit Increased to 256

The ECS component system now supports up to 256 different component types, up from the previous limit of 32. This removes a significant constraint for complex games with diverse entity compositions.

The implementation replaces `BitVector32` with a new `ComponentBits` structure that uses 256 bits (32 bytes) to track component membership. The new structure maintains the same high performance characteristics as the original.

**Breaking Change:** The `ComponentBits` property on entities and aspect bit sets now returns `ComponentBits` instead of `BitVector32`. The indexer behavior has also changed from mask-based to index-based access:

```cs
// Before (BitVector32 - mask-based)
BitVector32 bits = entity.ComponentBits;
bool hasComponent = bits[1 << componentId];

// After (ComponentBits - index-based)
ComponentBits bits = entity.ComponentBits;
bool hasComponent = bits[componentId];
```

Most users are unaffected by this change, as the high-level APIs remain identical:

```cs
// These APIs work exactly the same
entity.Has<Position>();
entity.Attach(new Velocity());
Aspect.All(typeof(Position), typeof(Velocity)).Build(componentManager);
```

The change only affects advanced users who directly access the `ComponentBits` property or manipulate aspect bit sets. A clear upgrade path is provided in the migration guide for affected code patterns.

Reference: https://github.com/MonoGame-Extended/MonoGame-Extended/issues/64