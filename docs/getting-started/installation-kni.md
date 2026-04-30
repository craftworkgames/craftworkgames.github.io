---
id: installation-kni
title: Installation (KNI)
sidebar_label: Installation (KNI)
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::tip[Up to date]
This page is **up to date** for MonoGame.Extended `@mgeversion@`. If you find outdated information, [please open an issue](https://github.com/monogame-extended/monogame-extended.github.io/issues).
:::

The following article details the steps necessary to get **MonoGame.Extended** installed and setup in your **KNI** project. **MonoGame.Extended** can be used with either [**MonoGame**](https://github.com/monogame/monogame), [**KNI**](https://github.com/kniEngine/kni), or [**FNA**](https://github.com/FNA-XNA/FNA). This article will detail how to setup and install **MonoGame.Extended** with an existing **KNI** project.

:::note
- If you are using MonoGame, please see the [Installation (MonoGame)](./installation-monogame.mdx) document. 
- If you are using FNA, please see the [Installation (FNA)](./installation-fna.md) document.
:::

## Prerequisites
The following prerequisites are required when using **MonoGame.Extended** with **KNI**.

- Download the latest release templates and install them so you can create a new **KNI** project
  - [https://github.com/kniEngine/kni/releases](https://github.com/kniEngine/kni/releases)

- A **KNI** project
  - You create a **KNI** project in much the same way you do a **MonoGame** project, only you select the **KNI** templates instead of the **MonoGame** templates.

## Installation
**KNI.Extended** is distributed via a NuGet package. You can add the NuGet package to your **KNI** project through your IDE (Visual Studio, Rider, etc) or through the Command Line Interface (CLI) using the `dotnet` commands

<Tabs>
  <TabItem value="net-cli" label=".NET Cli" default>
    ```sh
    dotnet add package KNI.Extended --version @mgeversion@
    ```
  </TabItem>
  <TabItem value="package-manager" label="Package Manager">
    ```sh
    NuGet\Install-Package KNI.Extended -Version @mgeversion@
    ```
    <small>
      This command is intended to be used within the Package Manager Console in Visual Studio, as it uses NuGet module's version of [Install-Package](https://docs.microsoft.com/nuget/reference/ps-reference/ps-ref-install-package)
    </small>
  </TabItem>
  <TabItem value="package-reference" label="Package Reference" default>
    ```xml
    <PackageReference Include="KNI.Extended" Version="@mgeversion@" />
    ```
    <small>
        For projects that support [PackageReference](https://docs.microsoft.com/nuget/consume-packages/package-references-in-project-files), copy this XML node into the project file to reference the package. 
    </small>
  </TabItem>  
</Tabs>

:::caution
**KNI.Extended** is currently being updated and prepped for version 4.0 release. In the mean time, the current stable version is the **4.0.0** version shown above. Please use this version for now even though it is marked prerelease until version 4.0 is released. For more information, please see the [MonoGame.Extended is Back](/blog/mongame-extended-is-back) blog post.
:::

## (Optional) Setup MGCB Editor
**KNI.Extended** provides MonoGame Content Pipeline Extensions to extend the asset types that can be imported through the MonoGame Content Pipeline. All asset preprocessing extensions provided as pipeline extensions can be used to load the assets at runtime from disk if you want, meaning that setting this up is optional and only needed if you are using the content pipeline for asset management in your game. 

### Download Pipeline Nuget
To get started first add the `KNI.Extended.Content.Pipeline` NuGet package to your MonoGame project

<Tabs>
  <TabItem value="net-cli" label=".NET Cli" default>
    ```sh
    dotnet add package KNI.Extended.Content.Pipeline --version 4.0.0
    ```
  </TabItem>
  <TabItem value="package-manager" label="Package Manager">
    ```sh
    NuGet\Install-Package KNI.Extended.Content.Pipeline -Version 4.0.0
    ```
    <small>
      This command is intended to be used within the Package Manager Console in Visual Studio, as it uses NuGet module's version of [Install-Package](https://docs.microsoft.com/nuget/reference/ps-reference/ps-ref-install-package)
    </small>
  </TabItem>
  <TabItem value="package-reference" label="Package Reference" default>
    ```xml
    <PackageReference Include="KNI.Extended.Content.Pipeline" Version="4.0.0" />
    ```
    <small>
        For projects that support [PackageReference](https://docs.microsoft.com/nuget/consume-packages/package-references-in-project-files), copy this XML node into the project file to reference the package. 
    </small>
  </TabItem>  
</Tabs>

### Add Reference to MGCB Editor
In order for the MonoGame Content Builder (MGCB) Editor to make use of the extension provided by **KNI.Extended.Content.Pipeline** you will need to add a reference to the `KNI.Extended.Content.Pipeline.dll` assembly to the content project. This assembly is downloaded as part of the **KNI.Extended.Content.Pipeline** NuGet you just installed, however the necessary files to reference do not get automatically copied to your project directory. To add the reference, complete the following steps:

1. Open you **Content.mgcb** file in the **MGCB Editor**

:::tip
When using Visual Studio, double clicking the **Content.mgcb** file in your project should open it for you using the **MGCB Editor** automatically if you have the MonoGame Visual Studio Extension installed. If, for some reason, it opens it as a plain text file instead, you can right-click the **Content.mgcb** file, choose **Open With**, then set the default default application to open with as the **MGCB Editor**. 

Alternatively, if you're not using Visual Studio, you can open it by using the following `dotnet` command in a command-line or terminal window from within your project directory

```sh
dotnet mgcb-editor ./Content/Content.mgcb
```
:::

2. Click the **Content** node located in the **Project** panel on the left.
3. In the **Properties** panel below it, scroll down to the **References** field. Click this field to open the **Reference Editor** dialog window.
4. Click the **Add** button in the **Reference Editor** dialog window.
5. Find and add the **KNI.Extended.Content.Pipeline.dll** that was downloaded from the NuGet package

:::tip
By default, NuGet will download packages to the global packages directory. The following shows where the location of the **KNI.Extended.Content.Pipeline.dll** will be with the default NuGet configs depending on your operating system.

<Tabs>
  <TabItem value="window" label="Windows" default>
    ```
    %USERPROFILE%\.nuget\packages\kni.extended.content.pipeline\4.0.0\tools\KNI.Extended.Content.Pipeline.dll
    ```
  </TabItem>
  <TabItem value="mac" label="macOS">
    ```sh
    ~/.nuget/packages/kni.extended.content.pipeline/4.0.0/tools/KNI.Extended.Content.Pipeline.dll
    ```
  </TabItem>
  <TabItem value="linux" label="Linux" default>
    ```sh
    ~/.nuget/packages/kni.extended.content.pipeline/4.0.0/tools/KNI.Extended.Content.Pipeline.dll
    ```
  </TabItem>  
</Tabs>

:::

6. Click **Ok** to close the **Reference Editor** dialog window.

You should now see the **KNI.Extended.Content.Pipeline.dll** in the **References** field of the **Property** panel.

```
dotnet add package MonoGame.Extended.Content.Pipeline
```

:::caution
The reference we just added to the MGCB Editor is stored as a relative path in the **Content.mgcb** file.  You can see this for yourself by opening the **Content.mgcb** file in a text editor and locating the references section. It will look something like this

```
#-------------------------------- References --------------------------------#

/reference:..\..\..\..\..\..\.nuget\packages\kni.extended.content.pipeline\4.0.0\tools\KNI.Extended.Content.Pipeline.dll
```

Since it is stored as a relative path, this reference can break if

- You move the project directory somewhere else on your computer.
- You use multiple workstations for development
- You have multiple team members working on the project from a shared git repo.

This is a limitation with the MGCB Editor, not with **KNI.Extended**, because it stores it as a relative path. Due to this, i strongly recommend setting up a **nuget.config** file for you project. By doing this, you can specify that the NuGet packages should be downloaded to a local directory within the project itself. Then the relative path will not break since it's local to the project.

For more information on creating a **nuget.config** file to do this, see the [nuget.config File Reference](https://learn.microsoft.com/en-us/nuget/reference/nuget-config-file) on Microsoft Learn.

:::


## Conclusion
Setting up **KNI.Extended** with an existing **KNI** project is straight forward and only requires that you add the NuGet reference. Once added, you can immediately start taking advantage of what **KNI.Extended** has to offer.
