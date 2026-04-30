---
slug: version-5-3-1
title: Version 5.3.1 Release - BMFont Improvements
authors: aris
tags: ['updates', 'releases', 'five-oh']
enableComments: true
---

Hello everyone,

Last night version 5.3.1 of MonoGame.Extended was released.  This is a maintenance release to address issues with the Bitmap Font (BMFont) file loading and rendering that have been discovered.

Thanks to [dawnsbury](https://github.com/dawnsbury) for the detailed bug reports and reproduction repository that made these fixes easy to replicate and fix.  

- GitHub: https://github.com/monogame-extended/monogame-extended
- Release Notes: https://github.com/MonoGame-Extended/Monogame-Extended/releases/tag/v5.3.1

## BMFont File Loading Improvements

### UTF-8 Byte Order Mark (BOM) Support

BMFont files saved with UTF-8 encoding that include a Byte Order Mark (BOM) are now properly supported.  This was occurring when BMFont files were edited using third-party libraries such as SharpFNT.BitmapFont, which may save files with the UTF-8 BOM preamble.

Previously, the presence of the preamble would cause the file format detection to fail with an "Invalid BMFont file" error.  The reader now detects and skips the UTF-8 BOM preamble when present, allowing these files to load correctly.

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/1073

### Negative Spacing Support

BMFont files can now use negative spacing values for both horizontal and vertical spacing.  While the BMFont specifications defines spacing as unsigned bytes, tools like LibGDX Hiero allow negative spacing, and users can manually edit font files to use negative values for better visual results.

The `SpacingHoriz` and `SpacingVert` fields in the `InfoBlock` struct have been changed from `byte` to `sbyte` to support negative values:

```cs
[StructLayout(LayoutKind.Explicit)]
public struct InfoBlock
{
    // ...
    [FieldOffset(11)] public sbyte SpacingHoriz;
    [FieldOffset(12)] public sbyte SpacingVert;
    // ...
}
```

This change maintains binary compatibility (both types are single-byte values) while enabling spacing adjustments that font generation tools other than AngleCode BMFont Generator supports.

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/1074

### Invalid Character Glyph Support

BMFont files that define an invalid character glyph (e.g. character ID `-1`) are now properly supported.  The invalid character glyph serves as a fallback for missing characters. While the BMFont specifications defines the character id as an unsigned integer, users can manually edit the BMFont file to add the fall back font character id `-1` manually.

To address this, the `CharacterBlock.ID` field has been changed from `uint` to `int` to allow negative character IDs

```cs
[StructLayout(LayoutKind.Explicit)]
public struct CharacterBlock
{
    public const int StructSize = 20;
    
    [FieldOffset(0)] public int ID;
    // ...
}
```

This change maintains binary compatibility (both types are 4-byte values) while enabling negative character ID support.

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/1075

### Duplicate Kerning Pair Handling

While technically malformed according to the BMFont specification, some font files contain duplicate kerning paris.  According to the BMFont known issues, this commonly occurs with certain TrueType fonts where the font itself contains problematic kerning data.  To address this, the previous loading behavior of version 3.8.0 has been restored.  This behavior allows duplicate kerning paris to silently overwrite previous values by using the dictionary indexer assignment.

To provide better feedback at build time for developers, the content processor now validates kerning paris during the build process and emits warnings when duplicates are detected similar to the following:

```cs
// BMFont file contains 1 duplicate kerning pair(s).
//  This may cause runtime errors. Each character pair should only have one kerning entry.
//  Please regenerate or fix the font file
//
// Duplicate kerning: Character 81 ('Q') -> 47 ('/')
//  First entry (index 145): amount=1
//  Duplicate entry (index 544): amount=-1
```

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/1076

## BMFont Rendering Improvements

### Spacing Values Now Applied During Rendering

The spacing values defined in BMFont files are now properly applied during text rendering.  Previously, while these values were read from the font file, they were not maintained during the content writing to the XNB file so were not preserved.

The `BitmapFont` class now includes `LetterSpacing` and `LineSpacing` properties that are initialized from the font file spacing values.  The glyph enumerators have been update dto incorporate spacing when calculating positions:

```cs
// Letter spacing is applied to horizontal advance
_positionDelta.X += _currentGlyph.Character.XAdvance + _font.LetterSpacing;

// Line spacing is applied when advancing to new lines
_positionDelta.Y += _font.LineHeight + _font.LineSpacing;
```

Reference: https://github.com/MonoGame-Extended/Monogame-Extended/issues/1078

## Summary

With Version 5.3.1 released, the Bitmap Font system now supports working with font files generated and manipulated from other tools other than just AngleCode's BMFont Generator. Rendering now properly accounts for horizontal and vertical spacing configured in the font file and fall back character ids are now supported.  Additionally, build-time warnings for duplicate kerning paris provide feedback during development with fonts that may have issues.

Whether its through creating issue/bug reports, creating PRs, asking questions on discord, or supporting through GitHub sponsors, thank you all for you continued contributions and support to this project while I continue forward with updating it.  As always, please provide any feedback or report any bugs you might find.

\- Chris Whitley (AristurtleDev)
