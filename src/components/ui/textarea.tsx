import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!, []);

    React.useLayoutEffect(() => {
        const textarea = internalRef.current;
        if (textarea) {
            // Temporarily disable scroll to get the real scrollHeight
            const originalOverflow = textarea.style.overflow;
            textarea.style.overflow = 'hidden';
            textarea.style.height = 'auto'; // Reset height to recalculate
            
            const scrollHeight = textarea.scrollHeight;
            
            textarea.style.height = `${scrollHeight}px`;
             // Restore overflow property
            textarea.style.overflow = originalOverflow;
        }
    }, [props.value]);


    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none overflow-y-auto',
          className
        )}
        ref={internalRef}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
