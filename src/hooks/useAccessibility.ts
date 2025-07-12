/**
 * @fileoverview Accessibility utilities and hooks for WCAG 2.1 AA compliance
 * Implements industry best practices for web accessibility
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for managing focus within a component
 * Ensures proper focus management for accessibility
 */
export const useFocusManagement = () => {
  const elementRef = useRef<HTMLElement>(null);

  const focusFirst = useCallback(() => {
    if (!elementRef.current) return;
    
    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (!elementRef.current) return;
    
    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !elementRef.current) return;

    const focusableElements = elementRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  return {
    elementRef,
    focusFirst,
    focusLast,
    trapFocus,
  };
};

/**
 * Hook for managing ARIA live regions
 * Provides screen reader announcements
 */
export const useLiveRegion = () => {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, urgent = false) => {
    setPoliteness(urgent ? 'assertive' : 'polite');
    setAnnouncement(''); // Clear first to ensure the message is announced
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  const clearAnnouncement = useCallback(() => {
    setAnnouncement('');
  }, []);

  return {
    announcement,
    politeness,
    announce,
    clearAnnouncement,
  };
};

/**
 * Hook for keyboard navigation support
 * Implements standard keyboard interaction patterns
 */
export const useKeyboardNavigation = (
  items: unknown[],
  onSelect?: (index: number) => void,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
  } = {}
) => {
  const { loop = true, orientation = 'vertical' } = options;
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    
    let newIndex = activeIndex;
    
    if (orientation === 'vertical') {
      if (key === 'ArrowDown') {
        event.preventDefault();
        newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : loop ? 0 : activeIndex;
      } else if (key === 'ArrowUp') {
        event.preventDefault();
        newIndex = activeIndex > 0 ? activeIndex - 1 : loop ? items.length - 1 : activeIndex;
      }
    } else {
      if (key === 'ArrowRight') {
        event.preventDefault();
        newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : loop ? 0 : activeIndex;
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        newIndex = activeIndex > 0 ? activeIndex - 1 : loop ? items.length - 1 : activeIndex;
      }
    }
    
    if (key === 'Home') {
      event.preventDefault();
      newIndex = 0;
    } else if (key === 'End') {
      event.preventDefault();
      newIndex = items.length - 1;
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (onSelect && activeIndex >= 0) {
        onSelect(activeIndex);
      }
    }
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, items.length, loop, orientation, onSelect]);

  const resetActiveIndex = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    resetActiveIndex,
  };
};

/**
 * Hook for managing reduced motion preferences
 * Respects user's motion preferences for accessibility
 */
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
};

/**
 * Hook for color contrast utilities
 * Helps ensure WCAG color contrast requirements
 */
export const useColorContrast = () => {
  const calculateContrast = useCallback((color1: string, color2: string): number => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const meetsAA = useCallback((contrast: number): boolean => {
    return contrast >= 4.5;
  }, []);

  const meetsAAA = useCallback((contrast: number): boolean => {
    return contrast >= 7;
  }, []);

  return {
    calculateContrast,
    meetsAA,
    meetsAAA,
  };
};

/**
 * Hook for screen reader utilities
 * Provides utilities for screen reader interaction
 */
export const useScreenReader = () => {
  const isScreenReaderActive = useRef(false);

  useEffect(() => {
    // Detect if screen reader is active by checking for common screen reader indicators
    const hasScreenReader = !!(
      window.navigator.userAgent.match(/NVDA|JAWS|WindowEyes|SARAFI|VoiceOver/) ||
      window.speechSynthesis ||
      (document.body as any).createTextRange ||
      (window as any).speechSynthesis
    );

    isScreenReaderActive.current = hasScreenReader;
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    isScreenReaderActive: isScreenReaderActive.current,
    announceToScreenReader,
  };
};

/**
 * Hook for managing skip links
 * Provides navigation shortcuts for keyboard users
 */
export const useSkipLinks = (targets: Array<{ id: string; label: string }>) => {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    skipToContent,
  };
};