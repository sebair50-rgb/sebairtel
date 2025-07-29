
"use client";

import * as React from 'react';
import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, value, onChange, ...props}, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!, []);

    const autoResize = React.useCallback(() => {
        const textarea = internalRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 120; // max height 
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, []);
    
    React.useLayoutEffect(() => {
        autoResize();
    }, [value, autoResize]);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        autoResize();
        if (onChange) {
            onChange(event);
        }
    };

    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          className
        )}
        ref={internalRef}
        value={value}
        onChange={handleInputChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
