import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, fromEvent, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface SecurityEvent {
  type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'DEVTOOLS_OPENED' | 'COPY_ATTEMPT' | 'PASTE_ATTEMPT' | 'RIGHT_CLICK' | 'KEYBOARD_SHORTCUT';
  timestamp: number;
  details?: any;
}

export interface SecuritySettings {
  preventTabSwitching: boolean;
  preventCopyPaste: boolean;
  preventRightClick: boolean;
  preventKeyboardShortcuts: boolean;
  detectDevTools: boolean;
  maxViolations: number;
  autoSubmitOnViolation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AntiCheatService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private securityEvents$ = new BehaviorSubject<SecurityEvent[]>([]);
  private isActive = false;
  private violationCount = 0;
  private originalConsole: any;
  private devtoolsCheckInterval: any;
  private isAutoSubmitting = false;

  readonly defaultSettings: SecuritySettings = {
    preventTabSwitching: true,
    preventCopyPaste: true,
    preventRightClick: true,
    preventKeyboardShortcuts: true,
    detectDevTools: true,
    maxViolations: 3,
    autoSubmitOnViolation: true
  };

  private currentSettings: SecuritySettings = { ...this.defaultSettings };

  constructor() {
    this.originalConsole = { ...console };
  }

  getSecurityEvents() {
    return this.securityEvents$.asObservable();
  }

  getCurrentSettings(): SecuritySettings {
    return { ...this.currentSettings };
  }

  updateSettings(settings: Partial<SecuritySettings>) {
    this.currentSettings = { ...this.currentSettings, ...settings };
  }

  startMonitoring() {
    if (this.isActive) return;

    this.isActive = true;
    this.violationCount = 0;
    this.isAutoSubmitting = false;
    this.securityEvents$.next([]);

    // Tab switching detection
    if (this.currentSettings.preventTabSwitching) {
      this.setupTabSwitchingDetection();
    }

    // Window focus/blur monitoring
    this.setupWindowFocusMonitoring();

    // DevTools detection
    if (this.currentSettings.detectDevTools) {
      this.setupDevToolsDetection();
    }

    // Copy-paste prevention
    if (this.currentSettings.preventCopyPaste) {
      this.setupCopyPastePrevention();
    }

    // Right-click prevention
    if (this.currentSettings.preventRightClick) {
      this.setupRightClickPrevention();
    }

    // Keyboard shortcuts prevention
    if (this.currentSettings.preventKeyboardShortcuts) {
      this.setupKeyboardShortcutsPrevention();
    }
  }

  stopMonitoring() {
    if (!this.isActive) return;

    this.isActive = false;

    // Clear all event listeners
    this.destroy$.next();

    // Clear devtools check interval
    if (this.devtoolsCheckInterval) {
      clearInterval(this.devtoolsCheckInterval);
    }

    // Restore console
    this.restoreConsole();
  }

  private setupTabSwitchingDetection() {
    fromEvent(document, 'visibilitychange')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (document.hidden) {
          this.handleSecurityEvent('TAB_SWITCH', {
            message: 'User switched tabs or minimized window'
          });
        }
      });
  }

  private setupWindowFocusMonitoring() {
    merge(
      fromEvent(window, 'blur'),
      fromEvent(window, 'focus')
    ).pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.type === 'blur') {
          this.handleSecurityEvent('WINDOW_BLUR', {
            message: 'Window lost focus'
          });
        }
      });
  }

  private setupDevToolsDetection() {
    // Method 1: Console dimension detection
    this.devtoolsCheckInterval = setInterval(() => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
        this.handleSecurityEvent('DEVTOOLS_OPENED', {
          message: 'DevTools detected via dimension check'
        });
      }
    }, 1000);

    // Method 2: Console.clear detection
    const originalClear = console.clear;
    console.clear = () => {
      this.handleSecurityEvent('DEVTOOLS_OPENED', {
        message: 'Console.clear detected - possible DevTools usage'
      });
      originalClear();
    };

    // Method 3: Console.log override detection
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      // Check if called from DevTools
      if (new Error().stack?.includes('console')) {
        this.handleSecurityEvent('DEVTOOLS_OPENED', {
          message: 'Console usage detected from DevTools'
        });
      }
      originalLog(...args);
    };
  }

  private setupCopyPastePrevention() {
    // Prevent copy
    fromEvent(document, 'copy')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        event.preventDefault();
        this.handleSecurityEvent('COPY_ATTEMPT', {
          message: 'Copy attempt blocked'
        });
      });

    // Prevent paste
    fromEvent(document, 'paste')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        event.preventDefault();
        this.handleSecurityEvent('PASTE_ATTEMPT', {
          message: 'Paste attempt blocked'
        });
      });

    // Prevent cut
    fromEvent(document, 'cut')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        event.preventDefault();
        this.handleSecurityEvent('COPY_ATTEMPT', {
          message: 'Cut attempt blocked'
        });
      });
  }

  private setupRightClickPrevention() {
    fromEvent(document, 'contextmenu')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        event.preventDefault();
        this.handleSecurityEvent('RIGHT_CLICK', {
          message: 'Right-click blocked'
        });
      });
  }

  private setupKeyboardShortcutsPrevention() {
    const blockedKeys = [
      'F12',           // Developer tools
      'Ctrl+Shift+I',  // Developer tools
      'Ctrl+Shift+J',  // Developer tools
      'Ctrl+U',        // View source
      'Ctrl+Shift+C',  // Element inspector
      'Ctrl+S',        // Save page
      'Ctrl+P',        // Print
      'F11',           // Fullscreen
      'Ctrl+Shift+R',  // Hard reload
      'Ctrl+R'         // Reload
    ];

    fromEvent(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        const key = event.key;
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const alt = event.altKey;

        // Check for blocked combinations
        const isBlocked = blockedKeys.some(blockedKey => {
          const parts = blockedKey.toLowerCase().split('+');
          return parts.every(part => {
            switch (part) {
              case 'ctrl': return ctrl;
              case 'shift': return shift;
              case 'alt': return alt;
              default: return key.toLowerCase() === part;
            }
          });
        });

        if (isBlocked) {
          event.preventDefault();
          event.stopPropagation();
          this.handleSecurityEvent('KEYBOARD_SHORTCUT', {
            message: `Blocked keyboard shortcut: ${event.key}`,
            key: key,
            ctrl: ctrl,
            shift: shift,
            alt: alt
          });
        }
      });
  }

  private handleSecurityEvent(type: SecurityEvent['type'], details?: any) {
    // Prevent infinite recursion during auto-submit
    if (this.isAutoSubmitting) return;

    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      details
    };

    const currentEvents = this.securityEvents$.value;
    this.securityEvents$.next([...currentEvents, event]);

    this.violationCount++;

    // Auto-submit if max violations reached
    if (this.currentSettings.autoSubmitOnViolation &&
      this.violationCount >= this.currentSettings.maxViolations) {
      this.isAutoSubmitting = true;
      const autoSubmitEvent: SecurityEvent = {
        type: 'TAB_SWITCH', // Using existing type, component will check violation count
        timestamp: Date.now(),
        details: {
          message: 'Maximum violations reached - auto-submitting quiz',
          autoSubmit: true
        }
      };

      const updatedEvents = this.securityEvents$.value;
      this.securityEvents$.next([...updatedEvents, autoSubmitEvent]);
    }
  }

  private restoreConsole() {
    // Restore original console methods
    Object.keys(this.originalConsole).forEach(method => {
      (console as any)[method] = this.originalConsole[method];
    });
  }

  getViolationCount(): number {
    return this.violationCount;
  }

  resetViolations() {
    this.violationCount = 0;
    this.isAutoSubmitting = false;
    this.securityEvents$.next([]);
  }

  ngOnDestroy() {
    this.stopMonitoring();
    this.destroy$.complete();
  }
}
