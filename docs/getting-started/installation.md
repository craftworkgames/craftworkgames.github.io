---
id: installation
title: Installation
sidebar_label: Installation
---

These are instructions on to get `Extended` installed and setup with `MonoGame`.

## Prerequisites

- [.NET Core 3.1 SDK](https://dotnet.microsoft.com/download/dotnet-core/3.1)
- [DirectX June 2010 runtime](https://www.microsoft.com/en-us/download/details.aspx?id=8109) (Only if working with DirectX on Windows)
- [A `MonoGame` project](https://docs.monogame.net/articles/getting_started/0_getting_started.html#creating-a-new-project)

## NuGet packages

`Extended` is distributed via NuGet packages. You can add the NuGet package to your C# project through your IDE of choice (Visual Studio, Xamarin Studio, Rider, etc) or through the Command Line Interface (CLI) using the `dotnet` command.

```
dotnet add package MonoGame.Extended
```

## Referencing the Content Pipeline

:::note
The `MonoGame` Content Pipeline is being phased out with `Extended`; in the future, you won't need to deal with the Content Pipeline. For more information see [this GitHub issue](https://github.com/craftworkgames/MonoGame.Extended/issues/676).
:::

To use some features of `Extended`  you'll need to install the Content Pipeline Nuget package.

```
dotnet add package MonoGame.Extended.Content.Pipeline
```

This package is not included as part of the base `Extended` package and must be installed separately. It won't add any build artifacts to your project; instead it will install the dependencies that are intended to be referenced from the [MonoGame Content Pipeline tool](http://www.monogame.net/documentation/?page=Pipeline).

You'll need to manually add the reference to your content file (usually `Content.mgcb`) using one of the following methods.

### Using the MonoGame Pipeline GUI

To add the reference using the Pipeline GUI tool follow these steps:

 1. Click on the **Content** node in the root of the tree.
 2. In the properties window, modify the **References** property.
 3. Find and add the `MonoGame.Extended.Content.Pipeline.dll`. It's usually located in the **packages** folder of your solution.  The default location of the **packages** folder in .NET Core is  `C:\Users\[User]\.nuget\packages`.

### Using a text editor

An alternative way to add the reference is by manually editing the `Content.mgcb` file in a text editor or Visual Studio. Look for the references section and update it like this:

```
#-------------------------------- References --------------------------------#

/reference:..\..\packages\MonoGame.Extended.Content.Pipeline.0.6.372\tools\MonoGame.Extended.Content.Pipeline.dll
```

:::tip Remember
The `MonoGame.Extended.dll` and the `MonoGame.Extended.Content.Pipeline.dll` come as a pair. Always make sure the version referenced by your game matches the version referenced by the Pipeline tool.
:::

## Conclusion

That's it! Once you've setup `Extended` you can start using it to make your games even more awesome.





