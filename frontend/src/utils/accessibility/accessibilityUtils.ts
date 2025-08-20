/**
 * Accessibility utility functions for improving user experience
 */

/**
 * Sets focus on an element while maintaining tab order
 * @param elementId - ID of the element to focus on
 * @param fallbackId - ID of fallback element if first one doesn't exist
 */
export const setAccessibleFocus = (elementId: string, fallbackId?: string): void => {
  try {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus({ preventScroll: false });
      return;
    }
    
    if (fallbackId) {
      const fallback = document.getElementById(fallbackId);
      if (fallback) {
        fallback.focus({ preventScroll: false });
        return;
      }
    }
    
    console.warn(`Element with ID ${elementId} not found for focusing`);
  } catch (error) {
    console.error('Error setting accessible focus:', error);
  }
};

/**
 * Creates a proper ARIA announcement for screen readers
 * @param message - The message to announce
 * @param priority - The announcement priority (polite or assertive)
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  try {
    // Look for existing announcer
    let announcer = document.getElementById('screen-reader-announcer');
    
    // Create if it doesn't exist
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    } else {
      // Update priority if needed
      announcer.setAttribute('aria-live', priority);
    }
    
    // Clear previous content (recommended for some screen readers)
    announcer.textContent = '';
    
    // Set timeout to ensure DOM updates before announcement
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = message;
      }
    }, 50);
  } catch (error) {
    console.error('Error announcing to screen reader:', error);
  }
};

/**
 * Keyboard accessibility handler for custom interactive elements
 * @param event - The keyboard event
 * @param onActivate - Function to call when element is activated
 */
export const handleKeyboardAccessibility = (
  event: React.KeyboardEvent,
  onActivate: () => void
): void => {
  // Handle both Enter and Space for interactive elements
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    onActivate();
  }
};

/**
 * Creates proper ARIA labels for interactive elements
 * @param label - The visible label
 * @param context - Additional context for screen readers
 */
export const createAccessibleLabel = (label: string, context?: string): string => {
  return context ? `${label} (${context})` : label;
};

/**
 * Determines if high contrast mode is enabled
 * Useful for adjusting UI elements for better visibility
 */
export const isHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Windows high contrast mode
  // This is a basic detection that works in some browsers
  const highContrastQuery = window.matchMedia('(-ms-high-contrast: active)');
  if (highContrastQuery.matches) return true;
  
  // Check for forced colors mode (newer browsers)
  const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
  return forcedColorsQuery.matches;
};

/**
 * Manages focus trapping within a modal dialog
 * @param containerId - ID of the container to trap focus within
 */
export class FocusTrap {
  private container: HTMLElement | null = null;
  private previouslyFocused: HTMLElement | null = null;
  
  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    this.previouslyFocused = document.activeElement as HTMLElement;
  }
  
  activate(): void {
    if (!this.container) return;
    
    // Store currently focused element
    this.previouslyFocused = document.activeElement as HTMLElement;
    
    // Find all focusable elements
    const focusableElements = this.container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    // Focus first element
    (focusableElements[0] as HTMLElement).focus();
    
    // Set up event listener
    this.container.addEventListener('keydown', this.handleKeyDown);
  }
  
  deactivate(): void {
    if (!this.container) return;
    
    // Remove event listener
    this.container.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }
  
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || !this.container) return;
    
    // Find all focusable elements
    const focusableElements = Array.from(this.container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Handle tabbing forward from last element
    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    } 
    // Handle tabbing backward from first element
    else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  };
}
