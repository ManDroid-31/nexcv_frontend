import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsOptions {
  onSave?: () => void;
  onExport?: () => void;
  onAIPanel?: () => void;
  onCopyJSON?: () => void;
  onUndo?: () => void;
  onShowShortcuts?: () => void;
  isAIPanelLocked?: boolean;
}

export function useKeyboardShortcuts({
  onSave,
  onExport,
  onAIPanel,
  onCopyJSON,
  onUndo,
  onShowShortcuts,
  isAIPanelLocked = false
}: KeyboardShortcutsOptions) {
  const shortcutsVisible = useRef(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Ctrl + / - Show shortcuts
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      if (onShowShortcuts) {
        onShowShortcuts();
        shortcutsVisible.current = true;
      }
      return;
    }

    // Ctrl + S - Save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      if (onSave) {
        onSave();
        toast.success('Resume saved!');
      }
      return;
    }

    // Ctrl + P - Export PDF
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      if (onExport) {
        onExport();
        toast.success('Exporting PDF...');
      }
      return;
    }

    // Ctrl + A - AI Panel
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      if (onAIPanel) {
        if (isAIPanelLocked) {
          toast.error('AI Panel is locked. Please unlock it first.');
        } else {
          onAIPanel();
          toast.success('AI Panel opened!');
        }
      }
      return;
    }

    // Ctrl + C - Copy JSON
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      if (onCopyJSON) {
        onCopyJSON();
        toast.success('JSON copied to clipboard!');
      }
      return;
    }

    // Ctrl + Z - Undo
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      if (onUndo) {
        onUndo();
        toast.success('Changes undone!');
      }
      return;
    }
  }, [onSave, onExport, onAIPanel, onCopyJSON, onUndo, onShowShortcuts, isAIPanelLocked]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcutsVisible: shortcutsVisible.current
  };
} 