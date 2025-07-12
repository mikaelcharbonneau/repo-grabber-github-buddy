/**
 * @fileoverview Screen reader only utility component
 * Provides content accessible only to screen readers
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  focusable?: boolean;
}

/**
 * Screen reader only component
 * Content is visually hidden but accessible to screen readers
 */
export const SrOnly: React.FC<SrOnlyProps> = ({
  children,
  className,
  asChild = false,
  focusable = false,
}) => {
  const Component = asChild ? React.Fragment : 'span';
  
  const srOnlyClasses = cn(
    'absolute w-px h-px p-0 -m-px overflow-hidden',
    'whitespace-nowrap border-0',
    !focusable && 'sr-only',
    focusable && 'focus:not-sr-only focus:w-auto focus:h-auto focus:p-2 focus:m-0',
    className
  );

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn((children as React.ReactElement).props.className, srOnlyClasses),
    });
  }

  return (
    <Component className={srOnlyClasses}>
      {children}
    </Component>
  );
};

export default SrOnly;