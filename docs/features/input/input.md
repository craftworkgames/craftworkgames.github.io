---
id: input
title: Input
sidebar_label: Input
---

The `MonoGame.Extended.Input` provides extensions on top of the normal input classes. 

## Installation

[MonoGame.Extended.Input](https://www.nuget.org/packages/MonoGame.Extended.Input) is distributed via a NuGet package. You can add the NuGet package to your C# project through your IDE of choice (Visual Studio, Xamarin Studio, Rider, etc) or through the Command Line Interface (CLI) using the dotnet command.
```
dotnet add MonoGame.Extended.Input
```

## Usage

### MouseExtended

`MouseExtended` is an extension of the `Mouse` class. The `MouseStateExtended` struct, obtained with `MouseExtended.GetState()` provides useful utilities such as `WasButtonJustDown()` and `WasButtonJustUp()` by keeping track of the previous `MouseState`.

### KeyboardExtended

`KeyboardExtended` is an extension of the `Keyboard` class. The `KeyboardStateExtended` struct, obtained with `KeyboardExtended.GetState()` provides useful utilities such as `WasAnyKeyJustDown()`, `WasKeyJustDown()` and `WasKeyJustUp()` by keeping track of the previous `KeyboardState`.

## InputListeners

 `Listener` classes have events you can use to subscribe to input events, instead of having to poll for input changes.

### Usage

We start by including the required namespace.
```cs
using MonoGame.Extended.Input.InputListeners;
```

Next, we declare our `InputListener` fields

```cs
private readonly TouchListener _touchListener;
private readonly GamePadListener _gamePadListener;
private readonly KeyboardListener _keyboardListener;
private readonly MouseListener _mouseListener;
```

You can manually call the `Update` method of the `Listeners`, but you can also use `InputListenerComponent` like this.

```cs
_keyboardListener = new KeyboardListener();
_gamePadListener = new GamePadListener();
_mouseListener = new MouseListener();
_touchListener = new TouchListener();

Components.Add(new InputListenerComponent(this, _keyboardListener, _gamePadListener, _mouseListener, _touchListener));
```

Finaly, we subscribe to the events of the `InputListeners`

```cs
_mouseListener.MouseClicked += (sender, args) => { Window.Title = $"Mouse {args.Button} Clicked"; };
_keyboardListener.KeyPressed += (sender, args) => { Window.Title = $"Key {args.Key} Pressed"; };
_gamePadListener.ButtonDown +=  (sender, args) => { Window.Title = $"Key {args.Button} Down"; };
_touchListener.TouchStarted +=  (sender, args) => { Window.Title = $"Touched"; };
```
