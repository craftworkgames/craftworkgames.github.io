---
id: collision
sidebar_label: Collision
title: Collision
description: 2D grid-based collision system.
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

## Requirements

To use the Collision code, you need to perform the following 4 steps:
1. Create a class that implements the `ICollisionActor` interface.
1. Implement the `OnCollision` method in the class created in step 1.  This defines what happens when something hits your object.
1. Create an instance of `CollisionComponent` which defines the bounds where collisions are checked.
1. `Insert` an instance of your class into the CollisionComponent.

### ICollisionActor

This is an interface you need to create a class from and implement the method and override the properties.  At minimum you need to implement `OnCollision` and override `Bounds` so you can provide the rectangle that is used to perform collision detection.

In the below example, you can see that `LayerName` overrides the interfaces implementation so we can state the layer this entity will belong to.  `Layers` are discussed in the [Advanced Topics](#advanced-topics-optional) section at the bottom.

The `OnCollision` method was implemented and simply reverses the direction of object by flipping it's velocity and moving it back the way it came.

```csharp
public class MyEntity : ICollisionActor
{
    public Vector2 Velocity;

    public MyEntity(RectangleF bounds, string layerName)
    {
        Bounds = bounds;
        LayerName = layerName;
    }

    public IShapeF Bounds { get; set; }

    public String LayerName { get; set; }

    public void OnCollision(CollisionEventArgs collisionInfo)
    {
        Velocity.X *= -1;
        Velocity.Y *= -1;
        Bounds.Position -= collisionInfo.PenetrationVector;
    }
}
```

### CollisionComponent

This is the main driver that manages the collide-able entities.  This class passes the entities position updates down to the [`Space Algorithm`](#space-algorithms).  Finally it does the collision checks between entities in layers.  All entities in each layer are always checked against the entities in the default layer.  

If you `Insert` entities into the `CollisionComponent`, it inserts them to a default layer, named appropriately "default".  `CollisionComponent` uses a `QuadTree` in the Default layer.  However if you create your own Layer, you can use a `SpatialHash` instead.

This allows you to add layers where you don't want certain elements to interact with each-other by adding them to different layers.  For instance if your game has a water layer, ground layer, and sky layer.  Each of those would only compare objects against the default layer.  

Entities within the same layer are not compared against each-other, except the default layer.

Comparisons are done:
1. `default` against `default`
1. `default` against `N layer` (Where "N layer" is any layer added via `CollisionComponent.Add`)

Example creating a CollisionComponent and replacing the default layer with "ground":
```csharp
// See Layers below under Advanced Topics for details on creating a Layer
CollisionComponent collisionComponent = new CollisionComponent("ground", myQuadLayer); 
```

## Full Example

In this example, we will make a simple sandbox where shapes can move and collide with each other.

We start by defining an `IEntity` interface that inherits `ICollisionActor`, so we can insert the entities into our `CollisionComponent`.  This is optional, but has benefits.

```csharp
public interface IEntity : ICollisionActor
{
    public void Update(GameTime gameTime);
    public void Draw(SpriteBatch spriteBatch);
}
```

Next, we define our entity classes

The `OnCollision` method and the Bounds property come from the `ICollisionActor` interface. These will be called by the `CollisionComponent`.

```csharp
public class CubeEntity : IEntity
{
    public Vector2 Velocity;
    public IShapeF Bounds { get; }

    public CubeEntity(RectangleF rectangleF)
    {
        Bounds = rectangleF;
        RandomizeVelocity();
    }

    public virtual void Draw(SpriteBatch spriteBatch)
    {
        spriteBatch.DrawRectangle((RectangleF)Bounds, Color.Red, 3);
    }

    public virtual void Update(GameTime gameTime)
    {
        Bounds.Position += Velocity * gameTime.GetElapsedSeconds() * 50;
    }

    public void OnCollision(CollisionEventArgs collisionInfo)
    {
        Velocity.X *= -1;
        Velocity.Y *= -1;
        Bounds.Position -= collisionInfo.PenetrationVector;
    }

    private void RandomizeVelocity()
    {
        Velocity.X = Random.Shared.Next(-1, 2);
        Velocity.Y = Random.Shared.Next(-1, 2);
    }
}

public class BallEntity : IEntity
{
    public Vector2 Velocity;
    public IShapeF Bounds { get; }

    public BallEntity(CircleF circleF)
    {
        Bounds = circleF;
        RandomizeVelocity();
    }

    public void Draw(SpriteBatch spriteBatch)
    {
        spriteBatch.DrawCircle((CircleF)Bounds, 8, Color.Red, 3f);
    }

    public void Update(GameTime gameTime)
    {
        Bounds.Position += Velocity * gameTime.GetElapsedSeconds() * 30;
    }

    public void OnCollision(CollisionEventArgs collisionInfo)
    {
        RandomizeVelocity();
        Bounds.Position -= collisionInfo.PenetrationVector;
    }


    private void RandomizeVelocity()
    {
        Velocity.X = Random.Shared.Next(-1, 2);
        Velocity.Y = Random.Shared.Next(-1, 2);
    }
}
```

### Setting up the game

First, we define our properties and fields

```csharp
private readonly List<IEntity> _entities = new List<IEntity>();
private readonly CollisionComponent _collisionComponent;
const int MapWidth = 500;
const int MapHeight = 500;
```

Then we Initialize our game by creating entities and adding them to the `CollisionComponent`.

```csharp

public Game1()
{
    _graphics = new GraphicsDeviceManager(this);
    _collisionComponent = new CollisionComponent(new RectangleF(0,0, MapWidth, MapHeight));

    Content.RootDirectory = "Content";
    IsMouseVisible = true;
}

protected override void Initialize()
{
    base.Initialize();
    _graphics.PreferredBackBufferHeight = MapHeight;
    _graphics.PreferredBackBufferWidth = MapWidth;
    _graphics.ApplyChanges();

    // Create some objects to use in the collision demo
    for (var i = 0; i < 50; i++)
    {
        var size = Random.Shared.Next(20, 40);
        var position = new Vector2(Random.Shared.Next(-MapWidth, MapWidth * 2), Random.Shared.Next(0, MapHeight));
        if (i % 2 == 0)
        {
            _entities.Add(new BallEntity(new CircleF(position, size)));
        }
        else
        {
            _entities.Add(new CubeEntity(new RectangleF(position, new SizeF(size, size))));
        }
    }

    // Add those objects to the collisionComponent so it will do the collision checking for us
    foreach (IEntity entity in _entities)
    {
        _collisionComponent.Insert(entity);
    }
}
```

### Updating the game
In the `Update` method, we update all entities and the `CollisionComponent`.

```csharp
protected override void Update(GameTime gameTime)
{
    // Make sure each entity moves around the screen
    foreach (IEntity entity in _entities)
    {
        entity.Update(gameTime);
    }

    // Make sure all collisions are detected and the OnCollision event for each is called
    _collisionComponent.Update(gameTime);

    base.Update(gameTime);
}
```

### Drawing the final result

```csharp
protected override void Draw(GameTime gameTime)
{
    GraphicsDevice.Clear(Color.CornflowerBlue);

    // Draw all the entities
    _spriteBatch.Begin();
    foreach (IEntity entity in _entities)
    {
        entity.Draw(_spriteBatch);
    }

    _spriteBatch.End();

    base.Draw(gameTime);
}
```

### Result

![collision](collision.gif)

## Advanced Topics (Optional)

### Space Algorithms

Currently there are 2 Space Algorithms implemented:
1. `QuadTree`
1. `SpatialHash`

#### Space Algorithms: QuadTree

A `QuadTree` is a data structure that starts off with a single rectangular area.  Entities are added, and if they reach the maximum number for that rectangular area (25 by default), the area is split up into 4 equal size parts or Quadrants.  This can continue until the maximum depth is reached (7 by default).

The benefit is that you reduce the number of entities you have to check collisions on, since you keep partitioning the screen into smaller and smaller sets of entities.

The management class is `QuadTreeSpace` which uses the `QuadTree`.

Example creation of a QuadTreeSpace:
```csharp
QuadTreeSpace quadTreeSpace = new QuadTreeSpace(new RectangleF(x, y, width, height));
```
See [QuadTrees](https://en.wikipedia.org/wiki/Quadtree) on Wikipedia for generic more information.

#### Space Algorithms: SpatialHash

Think of mipmaps or approximations.  The screen is split up into N sections, and the object is either in that large section or not.

Example creation of a SpatialHash:
```csharp
SpatialHash shash = new SpatialHash(new Vector2(32, 32));
```
See [Spatial Hashing](https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/spatial-hashing-r2697/) on GameDev.

### Layer

You can create a Layer and `Insert` "entities" (Instances of classes that extend `ICollisionAgent`).  Once you've added the entities, you can `Add` the Layer into a `CollisionComponent`.  Additionally, you may also add the layer without entities, so long as in your `ICollisionAgent` class you override the `LayerName` property so you can modify it to match the name of the layer you pass into the `CollisionComponent`.

```csharp
QuadTreeSpace quadTreeSpace = new QuadTreeSpace(new RectangleF(x, y, width, height));
Layer myQuadLayer = new Layer(quadTreeSpace);
// or
SpatialHash shash = new SpatialHash(new Vector2(32, 32));
Layer mySHashLayer = new Layer(shash);
```
