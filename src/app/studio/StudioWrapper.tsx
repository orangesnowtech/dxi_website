"use client";

import { NextStudio } from 'next-sanity/studio';
import { useEffect, useLayoutEffect } from 'react';

export default function StudioWrapper({ config }: { config: any }) {
  // Use useLayoutEffect to run before React renders
  useLayoutEffect(() => {
    // Suppress React warnings in console
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const filterWarning = (...args: any[]) => {
      // Check if any argument contains the disableTransition warning
      const hasDisableTransitionWarning = args.some(
        (arg) =>
          typeof arg === 'string' &&
          (arg.includes('disableTransition') ||
            arg.includes('disabletransition') ||
            arg.includes('React does not recognize'))
      );
      
      return !hasDisableTransitionWarning;
    };

    console.error = (...args: any[]) => {
      if (filterWarning(...args)) {
        originalError.apply(console, args);
      }
    };

    console.warn = (...args: any[]) => {
      if (filterWarning(...args)) {
        originalWarn.apply(console, args);
      }
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return <NextStudio config={config} />;
}

