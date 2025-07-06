"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: string;
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts: KeyboardShortcut[] = [
  { key: 'Ctrl + S', description: 'Save resume', action: 'Save' },
  { key: 'Ctrl + P', description: 'Export as PDF', action: 'Export' },
  { key: 'Ctrl + A', description: 'Open AI panel', action: 'AI Panel' },
  { key: 'Ctrl + C', description: 'Copy JSON', action: 'Copy' },
  { key: 'Ctrl + Z', description: 'Undo changes', action: 'Undo' },
  { key: 'Ctrl + /', description: 'Show shortcuts', action: 'Shortcuts' },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.keyboard-shortcuts-container')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="keyboard-shortcuts-container bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {shortcut.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {shortcut.action}
                </div>
              </div>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click anywhere outside to close
          </p>
        </div>
      </div>
    </div>
  );
} 