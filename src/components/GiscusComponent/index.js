import React from 'react';
import Giscus from "@giscus/react";
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    <Giscus    
      repo="monogame-extended/monogame-extended"
      repoId="MDEwOlJlcG9zaXRvcnkzODYxNTEzOA=="
      category="Announcements"
      categoryId="DIC_kwDOAk04Ys4Cf8Un"  
      mapping="title"                    
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={colorMode}
      lang="en"
      loading="lazy"
      crossorigin="anonymous"
      async
    />
  );
}
