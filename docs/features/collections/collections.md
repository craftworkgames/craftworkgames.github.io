---
id: collections
title: Collections
sidebar_label: Collections
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

## What is a collection?

A collection is a data structure with functionality built around it.  Think about a collection as a grouping of similar things.  All the enemies in a game, the items in the inventory, the textures being drawn, images in an animation, or bullets on the screen.

Collections are more advanced than a simple array or list, and each one can provide unique functionality.  There are benefits and disadvantages to each collection type.  Don't use a collection without a reason, especially if a simple array or list will suffice.  Make sure the collection you are choosing has a purpose that is advantageous to you and your project.

.NET has many default Collection types (List, Dictionary, Queue, Stack, and many more).  These are a few additional collections.

## General requirements for all collections

All of these require adding the using directive for `MonoGame.Extended.Collections` in your file.
```csharp
using MonoGame.Extended.Collections;
```

## Bag

A `Bag` is an un-ordered array of items with fast `Add` and `Remove` properties.

### Bag Functionality and Behavior
- It is much faster than an array when removing items.
- Takes less space than a linked list.
- Bag will resize itself (grow by 1.5 times current size) only when it needs to.  
- Used space won't shrink after removing elements.
- You can clear the bag.
- Can't sort the bag.
- Order is not preserved.
- Elements are added to the end of the collection.

### Bag Example

The example below creates a new `Bag` of size 3 with type `int`, adds three `integers` to the bag, adds a fourth item, and removes one item. When the fourth item is added this causes a resize of the capacity by 1.5 times the current capacity.

```csharp
var bag = new Bag<int>(3);
bag.Add(4);
bag.Add(8);
bag.Add(15);
// bag is now [4, 8, 15]

bag.Add(16); 
// bag is extended here, capacity is now 4 instead of 3 with items [4, 8, 15, 16]

bag.RemoveAt(1);
// bag is now [4, 16, 15] with a capacity of 4

bag.Remove(4);
// bag is now [15, 16] with a capacity of 4
```

Notice in the example when we removed the the second element (value 8) with `RemoveAt(1)` the last item (value 16) moved to it's place.  This is because when an item is removed the `bag` will reposition the last element into the removed spot.  This is to prevent the code from needing to move every element in the bag.  Meaning, **_do not count on the order of the items in the bag!_** 

This happens again when we use `Remove` to look for a specific VALUE in the bag, and remove that item.  15, the last element is swapped into the removed spot.

## Deque
Represents a collection of objects in which elements can be added to or removed either from the front or back. See [double ended queue](https://en.wikipedia.org/wiki/Double-ended_queue).

### Deque Functionality and Behavior

The front of the queue is the first item removed when you `Pop` an item off (The left of the list), where-as the back is the last item removed with `Pop` (The right of the list).
```
[3, 6, 8, 9, 0, 5, 32]
```

In the above list of elements, the 3 is the back, and the 32 is the front.

### Deque Example
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


## KeyedCollection

`KeyedCollection` is a wrapper around the `Dictionary` class where the key is obtained by a [delegate](https://www.tutorialspoint.com/csharp/csharp_delegates.htm).

This allows you to use a function as the key.  While this could be any function, a good example would be using a property of the class in the collection as the key, like an ID field.

### Keyed Collection Functionality and Behavior

 - The delegate function needs to return a unique value for the key since it will be used as the dictionaries key.
 - Simplify adding an Entity to a dictionary by a key value that's inside the Entity.
 - Provide helper methods to search for items in the collection `TryGetValue`

Lets create an object we can use in the keyed collection.
```csharp
public class MyEntity 
{
    public int Id {get; set;}
    public string Name {get; set;}

    public MyEntity() { }

    public MyEntity(int id, string name)
    {
        this.Id = id;
        this.Name = name;
    }
}
```

Now lets use that in the `KeyedCollection`.
```csharp
var keyedCollection = new KeyedCollection<int, MyEntity>(e => e.Id);
keyedCollection.Add(new MyEntity (1, "Player1"));
keyedCollection.Add(new MyEntity {Id = 2, Name = "Player2"});

keyedCollection.TryGetValue(1, out MyEntity entity); // gets Player1
```

Above we created a new KeyedCollection using the `Id` field as the key, and storing the `MyEntity` as the value.  In the example we added two new instances for MyEntity, and then retrieved an item from the collection using the ID field.

## Object Pooling

Pooling of Objects allows reuse of memory for a group of items to avoid Garbage Collection.  These are a bit more advanced, and an entire page is dedicated to them.

More information is in the [Object Pooling](docs/features/object-pooling/object-pooling.md) documentation.

## ObservableCollection

`ObservableCollection<T>` manages an `IList<T>` of items firing `ItemAdded`, `ItemRemoved`, `Clearing`, and `Cleared` events when the collection is changed.

This allows you to monitor when items are added, removed, being clearing, or cleared.  You could then perform an action whenever this happens.  If you're familiar with databases, this would be similar to insert/update/delete triggers.

It's for a more [event-driven architecture](https://en.wikipedia.org/wiki/Event-driven_programming) common in GUIs.

### ObservableCollection Example with Methods

In this first example, we'll create a blank `ObservableCollection<int>`, then add, remove, and clear from it to demonstrate the Event Handlers.
```csharp
ObservableCollection<int> observableCollection = new ObservableCollection<int>();
```

Next, we need to create some methods that will handle the events
```csharp
public void ItemAddedWatcher(object sender, ItemEventArgs<int> e)
{
    Debug.Print($"Item Added: {e.Item}");
}

public void ItemRemovedWatcher(object sender, ItemEventArgs<int> e)
{
    Debug.Print($"Item Removed: {e.Item}");
}

public void WatchedListClearing(object sender, EventArgs args)
{
    Debug.Print("List is clearing....");
}

public void WatchedListCleared(object sender, EventArgs args)
{
    Debug.Print("List is now cleared!");
}
```

Now we need to wire-up (associate) the event handlers to the methods so they are connected.
```csharp
observableCollection.ItemAdded += ItemAddedWatcher;
observableCollection.ItemRemoved += ItemRemovedWatcher;
observableCollection.Clearing += WatchedListClearing;
observableCollection.Cleared += WatchedListCleared;
```

Finally we need to manipulate the ObservableCollection so we can watch the events get triggered
```csharp
observableCollection.Add(1);
observableCollection.Add(2);
observableCollection.Add(77);
observableCollection.Add(3);
observableCollection.Remove(2);
observableCollection.Add(42);
observableCollection.Clear();
```

The output should be
```
Item Added: 1
Item Added: 2
Item Added: 77
Item Added: 3
Item Removed: 2
Item Added: 42
List is clearing....
List is now cleared!
```

### ObservableCollection Example with Anonymous functions

In this example we will pass in an already existing collection (A list), and use `Anonymous functions` in-line.

Create a list, and then pass it to an ObservableCollection with the same data type.
```csharp
List<int> sourceList = new List<int> {1, 2, 3, 55, 88, 13, 23, 42 };
ObservableCollection<int> observableCollectionAlt = new ObservableCollection<int>(sourceList);
```

Wire-up (associate) all the event handlers to the anonymous functions
```csharp       
observableCollectionAlt.ItemAdded += (sender, e) =>
{
    Debug.Print($"Item Added: {e.Item}");
};
observableCollectionAlt.ItemRemoved += (sender, e) =>
{
    Debug.Print($"Item Removed: {e.Item}");
};
observableCollectionAlt.Clearing += (sender, args) =>
{
    Debug.Print("List is clearing....");
};
observableCollectionAlt.Cleared += (sender, args) =>
{
    Debug.Print("List is now cleared!");
};
```

Perform some changes to the ObservableCollection and you'll see debug prints.
```csharp
observableCollectionAlt.Add(7);
observableCollectionAlt.Add(412);
observableCollectionAlt.Remove(88);
observableCollectionAlt.RemoveAt(3);
observableCollectionAlt.Clear();
```

This will print out the following:
```
Item Added: 7
Item Added: 412
Item Removed: 88
Item Removed: 55
List is clearing....
List is now cleared!
```

## Extensions to existing .NET collections

`MonoGame.Extended` contains `Collections` extensions to the C# collections that are useful for game programming.  An [extension](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods) in .NET is essentially just adding additional functionality to an existing Type Class, without needing to re-compile the source code for .NET 8.0.  Read more about them in the link above.

### ListExtensions

Adds `Shuffle(Random)` to all `IList<>` classes.  This extension requires that you pass in an instance of the `System.Random` class.

```csharp
// .... setup example 
using System;
using System.Collections.Generic;

Random random = new Random();
List<int> nums = new List<int>{1, 2, 3, 4, 5};
// .... end setup example 

using MonoGame.Extended.Collections;
// The Extension method for List `Shuffle` called
nums.Shuffle(random);
```

The list `nums` will now be randomly shuffled.  We didn't have to recompile .NET either.

### DictionaryExtensions

Extends all `Dictionary<>` classes with `GetValueOrDefault(key, default)`.  It allows you to specify a default to return when the key is not found.

```csharp
// .... setup example 
using System.Collections.Generic;

Dictionary<string, int> zipCodeLookupByCity = new Dictionary<string, int>();
// .... end setup example 

using MonoGame.Extended.Collections;
// The Extension method for dictionary to return a default if no key found
int zipCode = zipCodeLookupByCity.GetValueOrDefault("typo city name", 90210);
```

The above code has a made up situation where we want to be able to lookup zipcodes (Postal Codes) by the city name.  In this case, someone typed the city name wrong, but we want to always default the zip code to Beverly Hills zip code of 90210.
