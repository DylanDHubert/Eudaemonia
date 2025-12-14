'use client';

import { useEffect } from 'react';

/**
 * UPDATES THE THEME-COLOR META TAG TO ALWAYS BE BLACK
 * THIS AFFECTS THE PWA STATUS BAR COLOR ON MOBILE DEVICES
 */
export default function ThemeColorUpdater() {
  useEffect(() => {
    // FUNCTION TO UPDATE THE THEME-COLOR META TAG
    const updateThemeColor = () => {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      
      // CREATE THE META TAG IF IT DOESN'T EXIST
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      
      // ALWAYS SET TO BLACK FOR BOTH LIGHT AND DARK MODES
      metaThemeColor.setAttribute('content', '#000000'); // BLACK
    };

    // INITIAL UPDATE ON MOUNT
    updateThemeColor();
  }, []);

  return null; // THIS COMPONENT DOESN'T RENDER ANYTHING
}
