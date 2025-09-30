---
id: contentReader
title: ContentReader
sidebar_label: ContentReader
description: Extensions for the MonoGame ContentReader class.
---

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`.  If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

# ContentReader extensions

The `ContentReader` extensions help when writing your own content pipeline readers.

## ContentReader.GetGraphicsDevice

`GraphicsDevice ContentReader.GetGraphicsDevice()`

**GetGraphicsDevice** returns the current `GraphicsDevice` to help when loading content for the current display.

```csharp
public class MyTypeReader : ContentTypeReader<MyType> 
{
    protected override MyType Read(ContentReader reader, MyType existingInstance)
    {
        var graphicsDevice = reader.GetGraphicsDevice();
    }
}
```

:::note
This `ContentReader.GetGraphicsDevice` already exists in `Monogame` and `KNI`.  It does not exist in `FNA`. This method remains in `Monogame.Extended` for `FNA` only.
:::

## ContentReader.GetRelativeAssetName

`string ContentReader.GetRelativeAssetName(string relativeName)`

**GetRelativeAssetName** helps when your content type loads a different type, and you want to know the name to give `ContentManager.Load`.


```csharp
public class MyTypeReader : ContentTypeReader<MyType> 
{
    protected override MyType Read(ContentReader reader, MyType existingInstance)
    {
        var assetName = reader.GetRelativeAssetName(reader.ReadString());
        var other = reader.ContentManager.Load<OtherType>(assetName);
    }
}
```

