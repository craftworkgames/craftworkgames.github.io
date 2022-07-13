---
id: collections
title: Collections
sidebar_label: Collections
---

`MonoGame.Extended` contains `Collections` extensions to the C# collections that are useful for game programming.

## Installation

`Collections` is part of [MonoGame.Extended](https://www.nuget.org/packages/MonoGame.Extended) and is distributed via a NuGet package. You can add the NuGet package to your C# project through your IDE of choice (Visual Studio, Xamarin Studio, Rider, etc) or through the Command Line Interface (CLI) using the dotnet command.
```
dotnet add package MonoGame.Extended
```

## Bag

A `Bag` is an un-ordered array of items with fast `Add` and `Remove` properties.

It is much faster than an array when removing items, and takes less space than a linked list.

Bag will resize itself only when it needs to.

```csharp
var bag = new Bag<int>(3);
bag.Add(4);
bag.Add(8);
bag.Add(15);
// bag is now [4, 8, 15]

bag.Add(16); 
// bag is extended here, capacity is now 4 instead of 3 with items [4, 8, 15, 16]

bag.Remove(1);
// bag is now [4, 16, 15] with a capacity of 4
```

## Deque
Represents a collection of objects in which elements can be added to or removed either from the front or back. See [double ended queue](https://en.wikipedia.org/wiki/Double-ended_queue).

```csharp
var deque = new Deque<int>();
deque.AddToBack(1);
deque.AddToBack(2);
deque.AddToFront(4);
deque.AddToFront(5);
deque.AddToBack(3);

while (deque.Count > 0)
{
    int item = deque.Pop();
    Console.WriteLine(item);
}

```

Result
```
3
2
1
4
5
```


## keyedCollection

`KeyedCollection` is a wrapper around the `Dictionary` class where the key is obtained by a delegate.

```csharp
var keyedCollection = new KeyedCollection<int, MyEntity>(e => e.Id);
keyedCollection.Add(new MyEntity {Id = 1, Name = "Player1"});
keyedCollection.Add(new MyEntity {Id = 2, Name = "Player2"});

keyedCollection.TryGetValue(1, out MyEntity entity); // gets Player1
```

## Object Pooling

An `ObjectPool<T>` allows reuse of memory for a group of items to avoid Garbage Collection.
More information is in the [Object Pooling](../object-pooling/object-pooling.md) documentation.

## ObservableCollection

`ObservableCollection<T>` manages an `IList<T>` of items firing `ItemAdded`, `ItemRemoved`, `Clearing`, and `Cleared` events when the collection is changed.

## ListExtensions

Adds `Shuffle(Random)` to all `IList<>` classes.

## DictionaryExtensions

Extends all `Dictionary<>` classes with `GetValueOrDefault(key, default)`.
