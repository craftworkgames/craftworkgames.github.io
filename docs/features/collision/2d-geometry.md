---
id: 2d-geometry
sidebar_label: 2D Geometry
title: 2D Geometry
description: Bounding volumes, geometric primitives, and collision queries for 2D games.
---

:::note[Preview release]
This feature is currently only available in the preview release **6.0.0-preview.1**. If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

The `MonoGame.Extended` namespace provides a set of 2D geometric types for bounding volumes, intersection tests, containment queries, ray casting, and distance computations. All types are value types (`struct`) with no internal allocation overhead. Collision queries delegate to the static `Collision2D` class, which contains allocation-free implementations grounded in standard computational geometry references.

## Bounding Volumes

Five bounding volume types are available. Each supports containment testing, intersection testing, transformation, and translation.

| Type                    | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `BoundingBox2D`         | Axis-aligned bounding box (AABB) defined by minimum and maximum corners            |
| `BoundingCircle2D`      | Circle defined by a center point and radius                                        |
| `BoundingCapsule2D`     | Capsule defined by two endpoints and a radius; a circle swept along a line segment |
| `OrientedBoundingBox2D` | Rotated bounding box (OBB) defined by center, two local axes, and half extents     |
| `BoundingPolygon2D`     | Convex polygon defined by vertices in counter-clockwise order                      |

## Geometric Primitives

Three unbounded or semi-unbounded geometric types are also provided. These participate in intersection tests with each other and with the bounding volumes.

| Type            | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| `Line2D`        | Infinite line represented by a unit normal and a signed distance from the origin |
| `LineSegment2D` | Finite segment defined by two endpoints                                          |
| `Ray2D`         | Semi-infinite ray defined by an origin and direction                             |

---

## Creating Bounding Volumes

### BoundingBox2D

An AABB stores a minimum corner (smallest X and Y) and a maximum corner (largest X and Y).

```cs
// From explicit corners
BoundingBox2D box = new BoundingBox2D(new Vector2(0, 0), new Vector2(100, 50));

// From a center and half extents
BoundingBox2D box = BoundingBox2D.CreateFromCenterAndExtents(new Vector2(50, 25), new Vector2(50, 25));

// From a position and size
BoundingBox2D box = BoundingBox2D.CreateFromPositionAndSize(new Vector2(0, 0), new Vector2(100, 50));

// From an array of points (computes the tightest enclosing AABB)
BoundingBox2D box = BoundingBox2D.CreateFromPoints(points);
```

Convenience properties expose derived values:

```cs
Vector2 center = box.Center;
Vector2 size = box.Size;
Vector2 halfExtents = box.HalfExtents;
float width = box.Width;
float height = box.Height;
float area = box.Area;
```

### BoundingCircle2D

```cs
BoundingCircle2D circle = new BoundingCircle2D(new Vector2(50, 50), 30f);

// From an array of points using Ritter's approximate algorithm
BoundingCircle2D circle = BoundingCircle2D.CreateFromPoints(points);

// Minimum enclosing circle for a BoundingBox2D
BoundingCircle2D circle = BoundingCircle2D.CreateFromBoundingBox2D(box);

// Minimum enclosing circle for a BoundingCapsule2D
BoundingCircle2D circle = BoundingCircle2D.CreateFromBoundingCapsule2D(capsule);
```

### BoundingCapsule2D

A capsule sweeps a circle of the given radius along the line segment from `PointA` to `PointB`.

```cs
BoundingCapsule2D capsule = new BoundingCapsule2D(new Vector2(0, 0), new Vector2(100, 0), 20f);

// From a center, direction, length, and radius
BoundingCapsule2D capsule = BoundingCapsule2D.CreateFromCenterAndDirection(
    center: new Vector2(50, 0),
    direction: Vector2.UnitX,
    length: 100f,
    radius: 20f
);

// From a LineSegment2D
BoundingCapsule2D capsule = BoundingCapsule2D.CreateFromSegment(segment, radius: 20f);
```

### OrientedBoundingBox2D

An OBB stores its orientation as two normalized local axes rather than a rotation angle. The axes define the box's local X and Y directions in world space.

```cs
// From a rotation angle in radians (measured counter-clockwise from the positive world X-axis)
OrientedBoundingBox2D obb = OrientedBoundingBox2D.CreateFromRotation(
    center: new Vector2(100, 100),
    rotation: MathHelper.PiOver4,
    halfExtents: new Vector2(50, 25)
);

// From an axis-aligned bounding box (zero rotation)
OrientedBoundingBox2D obb = OrientedBoundingBox2D.CreateFromBoundingBox2D(box);

// From explicit axes
OrientedBoundingBox2D obb = new OrientedBoundingBox2D(
    center: new Vector2(100, 100),
    axisX: new Vector2(0.707f,  0.707f),
    axisY: new Vector2(-0.707f, 0.707f),
    halfExtents: new Vector2(50, 25)
);
```

The `Rotation` property recovers the angle in radians from the stored axes.

### BoundingPolygon2D

Vertices must be provided in **counter-clockwise order**. Edge normals are computed automatically.

```cs
Vector2[] vertices = new Vector2[]
{
    new Vector2(0, 0),
    new Vector2(100, 0),
    new Vector2(80, 60),
    new Vector2(20, 60),
};

BoundingPolygon2D polygon = new BoundingPolygon2D(vertices);

// Regular polygon (n-gon centered at a point)
BoundingPolygon2D hexagon = BoundingPolygon2D.CreateRegular(
    center: new Vector2(200, 200),
    radius: 50f,
    sides: 6
);

// From a BoundingBox2D
BoundingPolygon2D polygon = BoundingPolygon2D.CreateFromBoundingBox2D(box);
```

---

## Creating Geometric Primitives

### Line2D

A `Line2D` represents an infinite line using the implicit equation `dot(Normal, P) = Distance`. The normal is a unit vector perpendicular to the line.

```cs
// Through a point with a given normal direction
Line2D line = Line2D.CreateFromPointAndNormal(new Vector2(50, 50), Vector2.UnitY);

// Through two points
Line2D line = Line2D.CreateFromTwoPoints(new Vector2(0, 0), new Vector2(100, 0));

// Through a point in a given direction
Line2D line = Line2D.CreateFromPointAndDirection(new Vector2(50, 0), Vector2.UnitX);
```

### LineSegment2D

```cs
LineSegment2D segment = new LineSegment2D(new Vector2(0, 0), new Vector2(100, 50));

Vector2 midpoint = segment.Midpoint;
float length = segment.Length;
float lengthSq = segment.LengthSquared;
Vector2 direction = segment.Direction; // unnormalized; length equals segment length

// Point at parametric distance t along the segment (0 = start, 1 = end)
Vector2 point = segment.GetPoint(0.5f);

// AABB enclosing the segment
BoundingBox2D bounds = segment.GetBounds();
```

### Ray2D

```cs
Ray2D ray = new Ray2D(new Vector2(0, 0), Vector2.UnitX);

// From a start point toward a target point (direction is normalized automatically)
Ray2D ray = Ray2D.CreateFromPoints(new Vector2(0, 0), new Vector2(100, 50));

// Point at parametric distance t from the origin
Vector2 point = ray.GetPoint(50f);
```

---

## Intersection Tests

All bounding volumes implement `Intersects` methods for every combination of the supported types. All geometric primitives also support `Intersects` against the bounding volumes and each other. These methods return `bool`.

### Volume-to-Volume

```cs
BoundingBox2D box = new BoundingBox2D(new Vector2(0, 0), new Vector2(100, 100));
BoundingCircle2D circle  = new BoundingCircle2D(new Vector2(80, 80), 30f);
BoundingCapsule2D capsule = new BoundingCapsule2D(new Vector2(-20, 50), new Vector2(120, 50), 15f);

bool boxHitsCircle = box.Intersects(circle);
bool boxHitsCapsule = box.Intersects(capsule);
bool circleHitsBox = circle.Intersects(box);
```

All pairs are covered symmetrically:

|             | AABB | Circle | Capsule | OBB | Polygon |
| ----------- | ---- | ------ | ------- | --- | ------- |
| **AABB**    | Yes  | Yes    | Yes     | Yes | Yes     |
| **Circle**  | Yes  | Yes    | Yes     | Yes | Yes     |
| **Capsule** | Yes  | Yes    | Yes     | Yes | Yes     |
| **OBB**     | Yes  | Yes    | Yes     | Yes | Yes     |
| **Polygon** | Yes  | Yes    | Yes     | Yes | Yes     |

### Ray and Segment Intersection

`Ray2D` and `LineSegment2D` provide parametric intersection methods that return the distance along the ray or segment to the entry and exit intersection points:

```cs
Ray2D ray = new Ray2D(new Vector2(0, 50), Vector2.UnitX);

if (ray.Intersects(box, out float? tMin, out float? tMax))
{
    Vector2 entryPoint = ray.GetPoint(tMin.Value);
    Vector2 exitPoint  = ray.GetPoint(tMax.Value);
}

// Simpler overload when you only need a yes/no answer
bool hits = ray.Intersects(box);
```

Segment intersection works the same way. The parametric value is in the range `[0, 1]` where 0 is `Start` and 1 is `End`:

```cs
LineSegment2D segment = new LineSegment2D(new Vector2(0, 50), new Vector2(200, 50));

if (segment.Intersects(circle, out float? tEnter, out float? tExit))
{
    Vector2 entryPoint = segment.GetPoint(tEnter.Value);
}
```

Line intersection returns both intersection points and the parametric distance:

```cs
if (line.Intersects(ray, out float? t, out Vector2? point))
{
    // point is where the ray crosses the line
}
```

---

## Containment Tests

All bounding volumes implement `Contains` methods that classify the relationship of one shape relative to another. The return value is a `ContainmentType` enum:

| Value                        | Meaning                                          |
| ---------------------------- | ------------------------------------------------ |
| `ContainmentType.Contains`   | The tested shape is completely inside this shape |
| `ContainmentType.Intersects` | The shapes partially overlap                     |
| `ContainmentType.Disjoint`   | The shapes do not touch                          |

```cs
BoundingBox2D outer = new BoundingBox2D(new Vector2(0, 0), new Vector2(200, 200));
BoundingCircle2D inner = new BoundingCircle2D(new Vector2(100, 100), 40f);
BoundingCircle2D edge = new BoundingCircle2D(new Vector2(180, 100), 40f);
BoundingCircle2D outside = new BoundingCircle2D(new Vector2(300, 100), 40f);

ContainmentType a = outer.Contains(inner);   // ContainmentType.Contains
ContainmentType b = outer.Contains(edge);    // ContainmentType.Intersects
ContainmentType c = outer.Contains(outside); // ContainmentType.Disjoint
```

Containment with a point returns either `Contains` or `Disjoint`:

```cs
ContainmentType result = box.Contains(new Vector2(50, 50));
```

---

## Distance Queries

`LineSegment2D` and `Ray2D` provide distance methods for measuring how far a point is from them:

```cs
LineSegment2D segment = new LineSegment2D(new Vector2(0, 0), new Vector2(100, 0));

// Squared distance avoids the square root; use for comparisons
float distSq = segment.DistanceSquaredToPoint(new Vector2(50, 30));

// Actual distance
float dist = segment.DistanceToPoint(new Vector2(50, 30));

// Distance between two segments
float segDistSq = segment.DistanceSquaredToSegment(other, out float t1, out float t2, out Vector2 p1, out Vector2 p2);
```

`Line2D` provides a signed distance from any point to the line. Positive values indicate the point is on the same side as the normal:

```cs
float signedDist = line.DistanceToPoint(new Vector2(50, 30));
```

### Closest Point Queries

All geometric primitives provide `ClosestPoint` methods that project a point onto the nearest location on the primitive and return the parametric distance:

```cs
LineSegment2D segment = new LineSegment2D(new Vector2(0, 0), new Vector2(100, 0));

Vector2 closest = segment.ClosestPoint(new Vector2(50, 30), out float t);
// closest = (50, 0), t = 0.5
```

```cs
Ray2D ray = new Ray2D(new Vector2(0, 0), Vector2.UnitX);

Vector2 closest = ray.ClosestPoint(new Vector2(50, 30), out float t);
// closest = (50, 0), t = 50
// t is clamped to zero when the point is behind the ray origin
```

```cs
Line2D line = Line2D.CreateFromTwoPoints(new Vector2(0, 0), new Vector2(100, 0));

Vector2 closest = line.ClosestPoint(new Vector2(50, 30), out float t);
// closest = (50, 0)
```

---

## Transformation and Translation

All bounding volume types support `Transform(Matrix)` and `Translate(Vector2)`. Both return a new instance; the original is unchanged.

```cs
BoundingBox2D box = new BoundingBox2D(new Vector2(0, 0), new Vector2(100, 50));
Matrix transform = Matrix.CreateRotationZ(MathHelper.PiOver4);

// Transform applies rotation, scale, and translation.
// AABB transformation recomputes the enclosing axis-aligned box for the rotated corners.
BoundingBox2D transformed = box.Transform(transform);

// Translate moves the shape without changing its size or orientation
BoundingBox2D moved = box.Translate(new Vector2(200, 100));
```

`OrientedBoundingBox2D.Transform` rotates the local axes and scales the extents, producing a correctly oriented result:

```cs
OrientedBoundingBox2D obb = OrientedBoundingBox2D.CreateFromRotation(center, 0f, halfExtents);
Matrix worldMatrix = Matrix.CreateRotationZ(angle) * Matrix.CreateTranslation(offset);

OrientedBoundingBox2D worldObb = obb.Transform(worldMatrix);
```

`BoundingPolygon2D.Transform` transforms all vertices and recomputes edge normals. `BoundingPolygon2D.Translate` moves the vertices without recomputing normals (they are direction vectors and do not change under translation).

---

## Merging Shapes

Each bounding volume type provides a static `CreateMerged` method that returns the smallest enclosing shape of the same type containing both inputs:

```cs
BoundingBox2D merged = BoundingBox2D.CreateMerged(boxA, boxB);

BoundingCircle2D merged = BoundingCircle2D.CreateMerged(circleA, circleB);

BoundingCapsule2D merged = BoundingCapsule2D.CreateMerged(capsuleA, capsuleB);

OrientedBoundingBox2D merged = OrientedBoundingBox2D.CreateMerged(obbA, obbB);

// CreateMerged for polygons computes the convex hull of the combined vertex sets
BoundingPolygon2D merged = BoundingPolygon2D.CreateMerged(polygonA, polygonB);
```

---

## Corner Access

`BoundingBox2D` and `OrientedBoundingBox2D` expose the four corner positions of the box:

```cs
// Returns a new array of 4 Vector2 values
Vector2[] corners = box.GetCorners();

// Writes into a pre-allocated array to avoid allocation
Vector2[] corners = new Vector2[BoundingBox2D.CornerCount];
box.GetCorners(corners);
```

---

## Deconstruction

All types support C# deconstruction:

```cs
BoundingBox2D box = new BoundingBox2D(new Vector2(0, 0), new Vector2(100, 50));

(Vector2 min, Vector2 max) = box;

BoundingCircle2D circle = new BoundingCircle2D(new Vector2(50, 50), 30f);

(Vector2 center, float radius) = circle;

BoundingCapsule2D capsule = new BoundingCapsule2D(new Vector2(0, 0), new Vector2(100, 0), 20f);

(Vector2 pointA, Vector2 pointB, float capsuleRadius) = capsule;
```

---

## Using Collision2D Directly

The `Collision2D` static class contains the underlying allocation-free implementations used by all bounding volumes and primitives. Most game code will not need it directly because the higher-level types delegate to it automatically. It is useful in performance-critical paths where you want to pass primitive data without constructing intermediate structs:

```cs
// Raw AABB-circle test using component data
bool hit = Collision2D.IntersectsCircleAabb(
    circleCenter: playerCircle.Center,
    circleRadius: playerCircle.Radius,
    aabbMin: wall.Min,
    aabbMax: wall.Max
);

// Containment test returning ContainmentType
ContainmentType result = Collision2D.ContainsAabbCircle(
    aabbMin: wall.Min,
    aabbMax: wall.Max,
    circleCenter: playerCircle.Center,
    circleRadius: playerCircle.Radius
);
```

`Collision2D.Epsilon` is the floating-point tolerance used in all queries:

```cs
const float tolerance = Collision2D.Epsilon; // 1e-6f
```

---

## Performance Tips

### Prefer `DistanceSquared` over `Distance`

Every type that exposes `DistanceToPoint` also exposes `DistanceSquaredToPoint`. Use the squared form for range comparisons and only compute the square root when the actual distance value is needed.

### Use `Intersects` when you do not need the contact point

The parametric forms (`out float? tMin, out float? tMax`) do more work. If you only need a yes/no answer, call the simpler overload:

```cs
bool hit = ray.Intersects(box); // cheaper than Intersects(box, out tMin, out tMax)
```

### Use `GetCorners(Vector2[])` over `GetCorners()`

The array overload writes into a pre-allocated array and avoids a heap allocation per call:

```cs
private readonly Vector2[] _corners = new Vector2[BoundingBox2D.CornerCount];

// Inside a loop or update method:
box.GetCorners(_corners);
```

### Avoid constructing `BoundingPolygon2D` every frame

The constructor computes and allocates the normals array. Store the polygon as a field and use `Translate` or `Transform` to move it:

```cs
// Construct once
_polygon = BoundingPolygon2D.CreateRegular(Vector2.Zero, 50f, 6);

// Move each frame without recomputing normals
BoundingPolygon2D worldPolygon = _polygon.Translate(position);
```

### Use `CreateMerged` to build broad-phase volumes

Merging several small volumes into one larger one for a first-pass intersection test is faster than testing all sub-volumes individually when most frames produce no collision:

```cs
BoundingBox2D broadPhase = BoundingBox2D.CreateMerged(headBox, bodyBox);

// Quick rejection first
if (!broadPhase.Intersects(queryBox))
{
    return;
}

// Narrow-phase only when the broad test passes
bool headHit = headBox.Intersects(queryBox);
bool bodyHit = bodyBox.Intersects(queryBox);
```
