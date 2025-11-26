/**
 * Keyboard Shortcuts Hook
 * Manages global keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const KEYBOARD_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'd',
    ctrl: true,
    description: 'Go to Dashboard',
    action: () => {},
  },
  {
    key: 'w',
    ctrl: true,
    description: 'Go to Workflows',
    action: () => {},
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New Workflow',
    action: () => {},
  },
  {
    key: 't',
    ctrl: true,
    description: 'Go to Templates',
    action: () => {},
  },
  {
    key: 's',
    ctrl: true,
    description: 'Save Workflow',
    action: () => {},
  },
  {
    key: 'e',
    ctrl: true,
    description: 'Execute Workflow',
    action: () => {},
  },
  {
    key: 'k',
    ctrl: true,
    description: 'Open Command Palette',
    action: () => {},
  },
  {
    key: '/',
    ctrl: true,
    description: 'Show Keyboard Shortcuts',
    action: () => {},
  },
];

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modKey = ctrlKey || metaKey; // Support both Ctrl and Cmd

      // Dashboard: Ctrl+D
      if (modKey && key === 'd') {
        event.preventDefault();
        navigate('/app');
      }

      // Workflows: Ctrl+W
      if (modKey && key === 'w') {
        event.preventDefault();
        navigate('/app/workflows');
      }

      // New Workflow: Ctrl+N
      if (modKey && key === 'n') {
        event.preventDefault();
        navigate('/app/workflows/new');
      }

      // Templates: Ctrl+T
      if (modKey && key === 't') {
        event.preventDefault();
        navigate('/app/templates');
      }

      // Settings: Ctrl+,
      if (modKey && key === ',') {
        event.preventDefault();
        navigate('/app/settings');
      }

      // Command Palette: Ctrl+K
      if (modKey && key === 'k') {
        event.preventDefault();
        // Dispatch custom event for command palette
        window.dispatchEvent(new CustomEvent('openCommandPalette'));
      }

      // Keyboard Shortcuts Help: Ctrl+/
      if (modKey && key === '/') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('showKeyboardShortcuts'));
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

