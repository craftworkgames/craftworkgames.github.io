---
slug: version-4-initial-release
title: Version 4.0.0 Initial Release
authors: aris
tags: ['updates', 'releases', 'four-oh']
enableComments: true
---

I've been working hard this past month on getting a new "stable" release of **MonoGame.Extended** out.  Not only was there a backlog of issues that needed to be resolved, but the current released NuGets were not compatible with the current version of [MonoGame](https://monogame.net) (v3.8.1.303).  This made it more difficult for users to actually use **MonoGame.Extended** if they wanted to use NuGets instead of referencing directly from source.

So why did I put the word "stable" in quotes above?  While not all planned issues have been resolved for the new release, after talking another developer friend, I've made the decision to release version 4.0 as it is right now (thanks [Vic](https://github.com/vchelaru)).  This allows users to go ahead and start using the current version which is compatible with MonoGame 3.8.1.303 and has many bug fixes already implemented.  In the meantime, work will continue to resolve outstanding issues and feature requests and they will be pushed as patch or minor semver releases as they are finished.

The trade off here is more smaller but more frequent releases but consumers can roll forward with bug fixes as they get resolved. 

So with that said, let's talk about some of the major changes that are coming in with this initial release and why these changes were made.

<!-- trunicated -->

## A Single Project
Well, really it's two projects, **MonoGame.Extended** and **MonoGame.Extended.Content.Pipeline**.  However, the decision was made to take all the individual library projects like **MonoGame.Extended.Graphics**, **MonoGame.Extended.Input**, **MonoGame.Extended.Entities**, etc and move them so they are just all part of **MonoGame.Extended**.  While each of these individual projects did add specific functionality that was separate from the core project, the majority of them were really tiny projects that just added noise both on NuGet and to the number of additional libraries to install.  

So gone are the days of installing multiple NuGets to get the full benefits of **MonoGame.Extended**.  There is now one NuGet to rule them all (and also the content pipeline one).

:::tip
If you have been using the prerelease versions from source before updating, ensure you delete the `.artifacts` directory after you update your local source so that the old project builds aren't still cached there. (thanks TurtleBaseAlpha (tigurx)).
:::

## Project Restructure
For many, updating to v4 initially is going to give you some red squigglies.  This is because many parts of the project were restructured to mirror the base MonoGame project where it could.  For instance, things related to graphics like `Texture2DRegion`, `Texture2DAtlas`, and `SpriteSheet` were moved to the `MonoGame.Extended.Graphics` namespace.  These classes all deal with using and extending `Texture2D` so they are in a mirrored namespace.

For many of the errors you will have initially when updating, it will just be needing to change the namespace.  Only a small handful of things were renamed to better reflect what they are (e.g. `TextureRegion2D` was renamed to `Texture2DRegion`).

## Content Pipeline Woes
One of the biggest headaches was using the **MonoGame.Extended.Content.Pipeline** extensions and adding the dll reference in the MGCB Editor.  This isn't a problem that is unique to **MonoGame.Extended**, all third party content pipeline extensions have to deal with this.  The problem is that the NuGets are downloaded to the global nuget cache on your PC.  So when you add the reference in the MGCB Editor, file path is stored as a relative path in the Content.mgcb file. This means that if you move your project folder, or if you are working with a team and sharing a repository, that relative path is going to break unless the project directory is always in the same place on every PC you use.

There have been many workarounds and suggestions on easing this for the consumer in talks between third party developers.  There is no one-solution-fits-all scenario and each workaround has its tradeoffs.  Previously **MonoGame.Extended** recommended adding a `nuget.config` file to your project to force the NuGets to download locally to your project directory, thus ensuring the relative path was always relative within the project directory.  This isn't a bad solution, but it does mean you're altering the default way NuGet is handled for that specific project, which isn't ideal if you don't want to actually do that (it affects all NuGets for the project, not just the **MonoGame.Extended.Content.Pipeline** one).

With version 4, I have implemented a new workaround to ease this issue.  The **MonoGame.Extended.Content.Pipeline** NuGet now ships with a `.targets` file.  Whenever you do a project build, this task will execute just before the actual build occurs and also before the MonoGame content task runs to build content.  The task will copy the `MonoGame.Extended.Content.Pipeline.dll` and its dependency assemblies to a path specified by you, the consumer, for easier referencing of the dll as well as making the relative path issue with the Content.mgcb not as brittle.

So how does this work?  The [documentation](/docs/getting-started/installation-monogame) was updated with the new steps, but we'll cover it briefly here.  After adding the **MonoGame.Extended.Content.Pipeline** NuGet, consumers will now need to update their project's `.csproj` file and add the following property manually

```xml
<PropertyGroup>
    <MonoGameExtendedPipelineReferencePath>$(MSBuildThisFileDirectory)pipeline-references</MonoGameExtendedPipelineReferencePath>
</PropertyGroup>
```

This new `MonoGameExtendedPipelineReferencePath` property defines the path that the task will copy the dependency dlls too.  The above snippet is the recommended default, however it was designed this way so that the consumer can choose the path instead of the library assuming the path for them.

If you use the content pipeline extensions, please give me any feedback on this new method, good or bad.  

## To Close Out
That's all I have for you for now.  Version 4 "stable" is officially released and smaller, but more frequent, releases will follow for various bug fixes and features.  If you have any questions or concerns, please let us know. You can use the comment section below which is linked with the [MonoGame.Extended GitHub Discussion](https://github.com/MonoGame-Extended/MonoGame-Extended/discussions) board, or you can come by the [MonoGame.Extended Discord](https://discord.gg/FvZ8Z7EzPJ) and yell at me.

Thanks everyone,

\- ❤️ Aris
