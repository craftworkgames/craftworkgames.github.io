---
id: object-pooling
title: Object Pooling
sidebar_label: Object Pooling
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

Object pooling is an optimization pattern. It's used to improve performance, in certain cases, by re-using objects instead of allocating memory for them on demand. In C/C++, one the things object pooling has to offer is a solution to avoid [memory fragmentation](http://stackoverflow.com/questions/3770457/what-is-memory-fragmentation). In C#, we don't have to worry about memory fragmentation thanks to [garbage collection](https://msdn.microsoft.com/en-us/library/ee787088). However, garbage collection can be still be too expensive for certain parts of real-time applications, especially on mobile devices with slower CPUs and simpler garbage collectors. [More details on object pooling here](http://gameprogrammingpatterns.com/object-pool.html).

:::note[Abstract Analogy]  
You can think about an object pool like desks in a classroom.  There are a designated number of desks in each room for students to use.  When a student takes over a desk for the class period, their information is assigned to that spot, and they place their items in the desk.  When the student leaves for their next class, the desk still remains (_The pool still has the object_).  When a student arrives for the next class, the old desk isn't tossed in the trash (_Garbage collected_), nor is a new desk created (_Class instantiation_), and then installed in the class (_stored in a list_).  Instead the new student simply uses one of the open desks (_object reuse/pooling_).  This saves on time, just like with Object Pooling.
:::

`Monogame.Extended` has 2 different Object Pooling options you can utilize.
 - `Pool<T>` where T is any class
 - `ObjectPool<T>` where T is a class that implements the `IPoolable` interface

The main difference between these two is that `Pool<T>` does not track the "alive" objects.  It is simply a facility to manage a list of your objects, that are available to use from the pool, that are "dead".

:::caution
Always profile the game for performance problems!
Using a `Pool<T>`/`ObjectPool<T>` without first profiling for the need of one may result in a *decrease* in performance in certain cases. If you are unsure, don't use the object pooling pattern.
:::

## Pool

This is a simplified Pooling system that uses a [`Deque`](/docs/features/collections/collections.md#deque) for the dead objects.  Since this collection doesn't contain a way to track the alive objects, you'll need to do that yourself.  This example uses a List to keep track of the alive objects.

### Create example Enemy class for Pool
This class is just an example for demonstration purposes.

```csharp
public class Enemy 
{
    public int Health {get; set;}
    public float Position {get; set;}

    public Enemy(){ }

    public void Reset()
    {
        Health = 0;
        Position = 0;
    }
}
```

### Creating the Pool

Here we create an instance of `Pool<T>` where `T` is `Enemy`.  We pass in the function that is used to create new instances of Enemy, the reset function for when an enemy is placed back in the pool with the `Free` method, and the maximum capacity.

```csharp
Pool<Enemy> enemyPool = new Pool<Enemy>(
    createItem: () => new Enemy(),      // Function that will be executed when we need to create a new Enemy
    resetItem: enemy => enemy.Reset(),  // Method that will be executed when the Enemy is returned to the pool for re-use
    capacity: 10                        // Maximum pool capacity, can not grow
);
```

:::note
Having too large of a capacity will waste memory, but having too small of a capacity will limit the number of object instances that can be pooled.
:::

### Managing the list of alive Objects
Create a list to hold our Enemy (This could be anything you wish, even a Bag or Deque)
```csharp
List<Enemy> enemies = new List<Enemy>();
```

### Obtaining an Object from the Pool
The Obtain method here will return an already created (but reset) instance of Enemy if one exists in the pool, otherwise it will create a New Enemy and send it back.
```csharp
Enemy enemy = enemyPool.Obtain();
```

### Managing the Alive Objects
Add the Enemy instance to our "alive" list
```csharp
enemies.Add(enemy);
```

### Send an object back to the pool
When we no longer need the object, we can send it back to the pool for reuse.
```csharp
enemyPool.Free(enemy);
```

### Removing the object from the alive list
Finally we need to remove the enemy from our alive list
```csharp
enemies.Remove(enemy);
```


## ObjectPool

Managing the alive list with the `Pool<T>` can add a bit more work to your code, so if you don't want to manage that yourself, you can try the `ObjectPool<T>` below.

### ObjectPool Features
 - The Object you want to use in the `ObjectPool<T>` must implement the `IPoolable` interface.
 - The list of alive objects is stored in a [Doubly Linked List](https://en.wikipedia.org/wiki/Doubly_linked_list)
 - The list of dead objects is stored in a [Deque](/docs/features/collections/collections.md#deque)
 - The behavior when requesting an object from the pool when it is full has 3 behaviors or Policies:
   - ObjectPoolIsFullPolicy.*ReturnNull* - Returns the Null value
   - ObjectPoolIsFullPolicy.*IncreaseSize* - Adds 1 more spot, creates a new instance of the Type
   - ObjectPoolIsFullPolicy.*KillExisting* - Resets the last object in the pool, and reuses it.


### Creating a Pool-able Object with the `IPoolable` interface

The following is a code snippet with comments demonstrating how to implement the interface.  We'll use the same Enemy example here.

```csharp
class EnemyPoolable : IPoolable
{
    // Example attributes
    public int Health {get; set;}
    public float Position {get; set;}

    // ... Your other Enemy class code here

    // IPoolable interface methods/attributes implemented below
    private Action<IPoolable> _returnAction;

    void IPoolable.Initialize(Action<IPoolable> returnAction)
    {
        // copy the instance reference of the return function so we can call it later
        _returnAction = returnAction;
    }

    public void Return()
    {
        // Reset your classes attributes here
        Health = 0;
        Position = 0;

        // check if this instance has already been returned
        if (_returnAction != null)
        {
            // not yet returned, return it now
            _returnAction.Invoke(this);
            // set the delegate instance reference to null, so we don't accidentally return it again
            _returnAction = null;
        }
    }

    public IPoolable NextNode { get; set; }
    public IPoolable PreviousNode { get; set; }
}
```

### Creating an `ObjectPool`
Instantiating an `ObjectPool<T>` is similar to any generic collection, i.e `List<T>`, but `T` has to implement `IPoolable`.
```csharp
int startingCapacity = 10; // the default is 16
var objectPool = new ObjectPool<EnemyPoolable>(
    instantiationFunc: () => new EnemyPoolable(), 
    capacity: startingCapacity
);
```
The required `instantiationFunc` parameter is the delegate responsible for creating each object instance if there are no available instances.

### Getting a Pooled Object

A free pooled object instance can be requested from the objectPool instance.

```csharp
var myPoolable = objectPool.New();
```

:::warning
If the objectPool is full, and you're using the default isFullPolicy of ObjectPoolIsFullPolicy.ReturnNull, myPoolable will return a `null`
:::


### Returning an Object to the Pool
When the object instance is no longer needed it should be returned to the pool so it can be re-used.
```cs
myPoolable.Return();
```
