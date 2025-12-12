'use client';

import { useEffect } from 'react';

/**
 * UPDATES THE THEME-COLOR META TAG BASED ON THE APP'S DARK MODE STATE
 * THIS AFFECTS THE PWA STATUS BAR COLOR ON MOBILE DEVICES
 */
export default function ThemeColorUpdater() {
  useEffect(() => {
    // FUNCTION TO UPDATE THE THEME-COLOR META TAG
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      
      // CREATE THE META TAG IF IT DOESN'T EXIST
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      
      // SET THE COLOR BASED ON DARK MODE
      // LIGHT MODE: ROSE-200 (#FECDD3) TO MATCH THE GLASS NAV HEADER (WHITE/50 OVER PINK-ROSE GRADIENT)
      // DARK MODE: INDIGO-600 (#4F46E5) TO MATCH THE GLASS NAV HEADER (GRAY-900/50 OVER INDIGO GRADIENT)
      if (isDark) {
        metaThemeColor.setAttribute('content', '#4F46E5'); // INDIGO-600
      } else {
        metaThemeColor.setAttribute('content', '#FECDD3'); // ROSE-200
      }
    };

    // INITIAL UPDATE ON MOUNT
    updateThemeColor();

    // WATCH FOR CLASS CHANGES ON THE HTML ELEMENT
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });

    // OBSERVE THE HTML ELEMENT FOR CLASS CHANGES
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // CLEANUP
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // THIS COMPONENT DOESN'T RENDER ANYTHING
}
