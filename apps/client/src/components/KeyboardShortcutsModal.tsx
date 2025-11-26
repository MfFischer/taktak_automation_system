/**
 * Keyboard Shortcuts Modal
 * Displays available keyboard shortcuts
 */

import { useEffect, useState } from 'react';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener('showKeyboardShortcuts', handleShow);
    return () => window.removeEventListener('showKeyboardShortcuts', handleShow);
  }, []);

  if (!isOpen) return null;

  const formatShortcut = (shortcut: typeof KEYBOARD_SHORTCUTS[0]) => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 font-mono text-sm">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl + /</kbd> to toggle this dialog
        </div>
      </div>
    </div>
  );
}

