'use client';

import { useEffect } from 'react';

/**
 * UPDATES THE THEME-COLOR META TAG BASED ON DARK/LIGHT MODE
 * FUSCHIA 800 FOR DARK MODE, ROSE FOR LIGHT MODE
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
      
      // CHECK IF DARK MODE IS ENABLED - CHECK BOTH CLASS AND LOCALSTORAGE
      const hasDarkClass = document.documentElement.classList.contains('dark');
      const localStorageDark = localStorage.getItem('darkMode') === 'true';
      const isDarkMode = hasDarkClass || localStorageDark;
      
      // SET FUSCHIA 800 FOR DARK MODE, ROSE FOR LIGHT MODE
      if (isDarkMode) {
        metaThemeColor.setAttribute('content', '#3b0764'); // PURPLE 950
      } else {
        metaThemeColor.setAttribute('content', '#f43f5e'); // ROSE 500
      }
    };

    // INITIAL UPDATE ON MOUNT WITH DELAY TO ENSURE DOM IS READY
    setTimeout(updateThemeColor, 0);

    // SET UP MUTATION OBSERVER TO WATCH FOR DARK MODE CHANGES
    const observer = new MutationObserver(() => {
      updateThemeColor();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // ALSO LISTEN TO LOCALSTORAGE CHANGES (FOR CROSS-TAB SYNC)
    const handleStorageChange = () => {
      updateThemeColor();
    };
    window.addEventListener('storage', handleStorageChange);

    // POLL FOR CHANGES (FALLBACK IN CASE OBSERVER DOESN'T CATCH IT)
    const intervalId = setInterval(updateThemeColor, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  return null; // THIS COMPONENT DOESN'T RENDER ANYTHING
}
