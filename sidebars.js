////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Defines the sidebar navigation used for the /docs page
/// Each section of the navbar is broken down into it's own object below and then combined into the overall sidebar
/// at the end during the module.export
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Defines the "MonoGame.Extended" sidebar category
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const monogameExtendedCategory = {
  type: 'category',
  label: 'MonoGame.Extended',
  items: [
    {
      type: 'doc',
      id: 'about/introduction'
    },
    {
      type: 'doc',
      id: 'about/principles'
    },
    {
      type: 'doc',
      id: 'about/contributing'
    }
  ]
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Defines the "Getting Started" sidebar category
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const gettingStartedCategory = {
  type: 'category',
  label: 'Getting Started',
  items: [
    {
      type: 'doc',
      id: 'getting-started/installation-monogame'
    },
    {
      type: 'doc',
      id: 'getting-started/installation-kni'
    },
    {
      type: 'doc',
      id: 'getting-started/installation-fna'
    },
  ]
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Defines the "Features" sidebar category. 
/// The "Features" sidebar category is broken down into individual categories below and then combined into the overall
//  "Features" category at the end using the individual categories.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// "Texture Handling" features category
////////////////////////////////////////////////////////////////////////////////
const textureHandlingCategory = {
  type: 'category',
  label: "Texture Handling",
  items: [
    {
      type: 'doc',
      id: 'features/texture-handling/texture2dregion/texture2dregion'
    },
    {
      type: 'doc',
      id: 'features/texture-handling/texture2datlas/texture2datlas'
    },
    {
      type: 'doc',
      id: 'features/texture-handling/sprite/sprite'
    }
  ]
};

////////////////////////////////////////////////////////////////////////////////
/// "Texture Handling" features category
////////////////////////////////////////////////////////////////////////////////
const _2dAnimationsCategory = {
  type: 'category',
  label: "2D Animations",
  items: [
    {
      type: 'doc',
      id: 'features/2d-animations/spritesheet/spritesheet'
    },
    {
      type: 'doc',
      id: 'features/2d-animations/animatedsprite/animatedsprite'
    },
  ]
};

////////////////////////////////////////////////////////////////////////////////
/// "Fonts" features category
////////////////////////////////////////////////////////////////////////////////
const fontsCategory = {
  type: 'category',
  label: 'Fonts',
  items: [
    {
      type: 'doc',
      id: 'features/fonts/bitmapfont/bitmapfont'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Input" features category
////////////////////////////////////////////////////////////////////////////////
const inputCategory = {
  type: 'category',
  label: 'Input',
  items: [
    {
      type: 'doc',
      id: 'features/input/keyboardextended/keyboardextended'
    },
    {
      type: 'doc',
      id: 'features/input/mouseextended/mouseextended'
    },
    {
      type: 'doc',
      id: 'features/input/inputlistener/inputlistener'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Camera" features category
////////////////////////////////////////////////////////////////////////////////
const cameraCategory = {
  type: 'category',
  label: 'Camera',
  items: [
    {
      type: 'doc',
      id: 'features/camera/camera'
    },
    {
      type: 'doc',
      id: 'features/camera/orthographic-camera/orthographiccamera'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Collections" features category
////////////////////////////////////////////////////////////////////////////////
const collectionsCategory = {
  type: 'category',
  label: 'Collections',
  items: [
    {
      type: 'doc',
      id: 'features/collections/collections'
    }
  ]
}


////////////////////////////////////////////////////////////////////////////////
/// "ObjectPool" features category
////////////////////////////////////////////////////////////////////////////////
const objectPoolCategory = {
  type: 'category',
  label: 'Object Pooling',
  items: [
    {
      type: 'doc',
      id: 'features/object-pooling/object-pooling'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "User Interface" features category
////////////////////////////////////////////////////////////////////////////////
const uiCategory = {
  type: 'category',
  label: 'User Interface',
  items: [
    {
      type: 'doc',
      id: 'features/ui/gum/gum-forms/gum-forms'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Collisions" category
////////////////////////////////////////////////////////////////////////////////
const collisionCategory = {
  type: 'category',
  label: 'Collisions',
  items: [
    {
      type: 'doc',
      id: 'features/collision/collision'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "ContentExtensions" category
////////////////////////////////////////////////////////////////////////////////
const contentExtensionsCategory = {
  type: 'category',
  label: 'Content Extensions',
  items: [
    {
      type: 'doc',
      id: 'features/content-extensions/contentManager'
    },
    {
      type: 'doc',
      id: 'features/content-extensions/contentReader'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Entities" category
////////////////////////////////////////////////////////////////////////////////
const entitiesCategory = {
  type: 'category',
  label: 'Entities',
  items: [
    {
      type: 'doc',
      id: 'features/entities/entities'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Particles" category
////////////////////////////////////////////////////////////////////////////////
const particlesCategory = {
  type: 'category',
  label: 'Particles',
  items: [
    {
      type: 'doc',
      id: 'features/particles/quick_start'
    },
    {
      type: 'doc',
      id: 'features/particles/emission_profiles'
    },
    {
      type: 'doc',
      id: 'features/particles/modifiers'
    },
    {
      type: 'doc',
      id: 'features/particles/interpolators'
    },
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Scene Graphs" category
////////////////////////////////////////////////////////////////////////////////
const sceneGraphsCategory = {
  type: 'category',
  label: 'Scene Graphs',
  items: [
    {
      type: 'doc',
      id: 'features/scene-graphs/scene-graphs'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Screen Management" category
////////////////////////////////////////////////////////////////////////////////
const screenManagement = {
  type: 'category',
  label: 'Screen Management',
  items: [
    {
      type: 'doc',
      id: 'features/screen-management/screen-management'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Serialization" category
////////////////////////////////////////////////////////////////////////////////
const serializationCategory = {
  type: 'category',
  label: 'Serialization',
  items: [
    {
      type: 'doc',
      id: 'features/serialization/serialization'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Tweening" category
////////////////////////////////////////////////////////////////////////////////
const tweeningCategory = {
  type: 'category',
  label: 'Tweening',
  items: [
    {
      type: 'doc',
      id: 'features/tweening/tweening'
    }
  ]
}

////////////////////////////////////////////////////////////////////////////////
/// "Tiled" category
////////////////////////////////////////////////////////////////////////////////
const tiledCategory = {
  type: 'category',
  label: 'Tiled',
  items: [
    {
      type: 'doc',
      id: 'features/tiled/tiled'
    }
  ]
}

const features = {
  type: 'category',
  label: 'Features',
  items: [
    textureHandlingCategory,
    _2dAnimationsCategory,
    fontsCategory,
    inputCategory,
    cameraCategory,
    collectionsCategory,
    objectPoolCategory,
    uiCategory,
    collisionCategory,
    contentExtensionsCategory,
    entitiesCategory,
    particlesCategory,
    sceneGraphsCategory,
    screenManagement,
    serializationCategory,
    tweeningCategory,
    tiledCategory
  ]
};

module.exports = {
  docs: [
    monogameExtendedCategory,
    gettingStartedCategory,
    features
  ]
};
