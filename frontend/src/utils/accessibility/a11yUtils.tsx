import React, { useEffect } from 'react';

// Custom hook for focus management
export const useFocusTrap = (ref: React.RefObject<HTMLElement>, active: boolean = true) => {
  useEffect(() => {
    if (!active || !ref.current) return;
    
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const element = ref.current;
    const focusableContent = element.querySelectorAll(focusableElements);
    
    const firstFocusableElement = focusableContent[0] as HTMLElement;
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;
    
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // If shift + tab and on first element, move to last element
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        // If tab and on last element, move to first element
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
    
    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, active]);
};

// Component for screen reader only content
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span 
      className="sr-only"
      style={{ 
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0'
      }}
    >
      {children}
    </span>
  );
};

// Skip to main content link
export const SkipToContent: React.FC = () => {
  return (
    <a 
      href="#main-content"
      className="skip-to-content"
      style={{ 
        position: 'absolute',
        top: '-40px',
        left: '0',
        background: '#007bff',
        color: 'white',
        padding: '8px',
        zIndex: 100,
        transition: 'top 0.3s'
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      Skip to main content
    </a>
  );
};

// Accessible announcement for dynamic content changes
export class Announcer {
  private static instance: Announcer;
  private announcer: HTMLDivElement | null = null;
  
  private constructor() {
    if (typeof document !== 'undefined') {
      this.announcer = document.createElement('div');
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.className = 'sr-only';
      this.announcer.style.position = 'absolute';
      this.announcer.style.width = '1px';
      this.announcer.style.height = '1px';
      this.announcer.style.padding = '0';
      this.announcer.style.margin = '-1px';
      this.announcer.style.overflow = 'hidden';
      this.announcer.style.clip = 'rect(0, 0, 0, 0)';
      this.announcer.style.whiteSpace = 'nowrap';
      this.announcer.style.border = '0';
      document.body.appendChild(this.announcer);
    }
  }
  
  public static getInstance(): Announcer {
    if (!Announcer.instance) {
      Announcer.instance = new Announcer();
    }
    return Announcer.instance;
  }
  
  public announce(message: string): void {
    if (this.announcer) {
      // Clear announcer
      this.announcer.textContent = '';
      
      // Force redraw
      void this.announcer.offsetWidth;
      
      // Add new message
      this.announcer.textContent = message;
    }
  }
}

// Create and export the announcer instance
export const announcer = Announcer.getInstance();
