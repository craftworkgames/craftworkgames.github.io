---
id: contentManager
title: ContentManager
sidebar_label: ContentManager
description: Extensions for the MonoGame ContentManager class.
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

# ContentManager extensions

## ContentManager.OpenStream

`System.IO.Stream ContentManager.OpenStream(string filename)`

**OpenStream** allows easy access to load data from files.  Files loaded this way should be in the content folder defined by `Content.RootDirectory`.

Example below loads a text file "song-lyrics" directly.  This file is assumed to have it's properties set to "Copy to Output Directory".
```csharp
// Put this in your Game1 class
private string songLyrics;
```

```csharp
// Put this in your Initialize() method
// song-lyrics.txt is in the Content Directory
using (var stream = Content.OpenStream("song-lyrics.txt"))
{
    using (var reader = new StreamReader(stream))
    {
        songLyrics = reader.ReadToEnd();
    }
}
```

In this next example, it is loading a PNG file, and creating a `Texture2D` from that stream.  This file is also assumed to have it's properties set to "Copy to Output Directory".

```csharp
// Put this in your Game1 class
private Texture2D monoTextureManual;
```

```csharp
// Put this in your Initialize() method
// extendedlogo.png is in the Content Directory
using (var stream = Content.OpenStream("extendedlogo.png"))
{
    monoTextureManual = Texture2D.FromStream(GraphicsDevice, stream);
}
```

## ContentManager.GetGraphicsDevice

`GraphicsDevice ContentManager.GetGraphicsDevice()`

**GetGraphicsDevice** returns the current `GraphicsDevice` from the services.

```csharp
var graphicsDevice = Content.GetGraphicsDevice();
var width = graphicsDevice.DisplayMode.Width;
```
