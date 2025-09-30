---
id: introduction
title: Introduction
sidebar_label: Introduction
---

Welcome to the **MonoGame.Extended** documentation!

## What Is MonoGame.Extended
**MonoGame.Extended** is a [free and open-source (FOSS)](https://en.wikipedia.org/wiki/Free_and_open-source_software) library that provides common implementations and solutions for game development with [MonoGame](https://monogame.net). It is not an engine or a framework. For more information on the foundational principles of **MonoGame.Extended**, please read the [Principles](/docs/about/principles) document.

## Main Features
Some of the main features of **MonoGame.Extended** include:

| Feature                                                                                | Description                                                                                                                                              |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Texture Handling](/docs/features/texture-handling/texture2dregion/texture2dregion.md) | Offers utility classes like `Texture2DRegion`, `Texture2DAtlas`, and `Sprite` to better manage using `Texture2D` and rendering 2D sprite graphics        |
| [2D Animations](/docs/features/2d-animations/spritesheet/spritesheet.md)               | Offers utility class such as `SpriteSheet` and `AnimatedSprite` for creating and managing 2D sprite animations.                                          |
| [Fonts](/docs/features/fonts/bitmapfont/bitmapfont.md)                                 | Provides support for Bitmap Fonts created with BMFont or Hiero.                                                                                          |
| [Input](/docs/features/input/keyboardextended/keyboardextended.md)                     | Utility classes that extend the base input states provided by MonoGame as well as an `InputListener` for event based input events instead of poll based. |
| [Camera](/docs/features/camera/camera.md)                                              | Class wrapper for viewport objects.  Allows easily moving the viewable area of your world.                                                               |
| [Collections](/docs/features/collections/collections.md)                               | Containers for data with efficient insertion, removal, and memory usage. Each with unique reasons usage.                                                 |
| [Collisions](/docs/features/collision/collision.md)                                    | Features to handle collision detection using different Space Algorithms.                                                                                 |
| [Content Extensions](/docs/features/content-extensions/contentManager.md)              | Extension methods for ContentManager and ContentReader                                                                                                   |
| [ECS](/docs/features/entities/entities.md)                                             | Entity Component System                                                                                                                           |
| [Graphics](/docs/features/scene-graphs/scene-graphs.md)                                | ⚠️ Documentation needs updating                                                                                                                           |
| [Object Pooling](/docs/features/object-pooling/object-pooling.md)                      | Collection types that reduce performance issues related to things like Garbage Collection.                                                               |
| [Particles](/docs/features/particles/quick_start_guide.md)                             | MonoGame Extended's particle system guides                                                                                                               |
| [Serialization](/docs/features/serialization/serialization.md)                         | ⚠️ Documentation needs updating                                                                                                                           |
| [Screen Management](/docs/features/screen-management/screen-management.md)             | ⚠️ Documentation needs updating                                                                                                                           |
| [Tilemap](/docs/features/tiled/tiled.md)                                               | ⚠️ Documentation needs updating                                                                                                                           |
| [Tweening](/docs/features/tweening/tweening.md)                                        | ⚠️ Documentation needs updating                                                                                                                           |

## How to Use These Docs
On the left side of the screen, you will find the documentation navbar. On mobile devices, this can be accessed by clicking the hamburger menu in the top left. Since **MonoGame.Extended** is a set of utilities and not an engine, the documentation does not need to be read in a specific order however the documentation within each category may be ordered to build off of the previous document.. Each section or document is an isolated topic, so you can skip ahead or read only the ones relevant to your use case.

On the right side of the screen, you will see a table of contents that makes it easier to navigate between sections of the current document. On mobile, this can be found as a drop-down at the top of the document page.

## Prerequisite Knowledge
Where possible, the documentation is designed to be beginner-friendly. However, a baseline must be established to maintain focus on **MonoGame.Extended** functionality. Links to additional documentation will be provided when needed.

Readers should have a solid foundational skill in C# and an understanding of how to create a game project with [MonoGame](https://monogame.net). These documents are not intended to teach C#, [MonoGame](https://monogame.net), or game development in general, but to focus on the functionality provided by **MonoGame.Extended**.

## Join our Community
If you have any questions related to **MonoGame.Extended**, you are welcome to join one of our community hubs and ask questions:

- [GitHub Discussions](https://github.com/MonoGame-Extended/MonoGame-Extended/discussions)
- [MonoGame.Extended Discord](https://discord.gg/FvZ8Z7EzPJ)

The maintainers are also active in the main [MonoGame Discord](https://discord.gg/monogame).

## Something Missing?
If you discover any issues with the documentation or have suggestions for improvement, please create an issue in the [documentation GitHub repository](https://github.com/monogame-extended/monogame-extended.github.io) or join the [MonoGame.Extended Discord](https://discord.gg/FvZ8Z7EzPJ) and leave a message. Contributions to the documentation are encouraged and welcome; please read the [Contributing](/docs/about/contributing) document first.

For issues or feature requests in the **MonoGame.Extended** library itself, please open new requests on the [MonoGame.Extended GitHub](https://github.com/MonoGame-Extended/MonoGame-Extended).
