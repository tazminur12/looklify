'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const defaultToolbarGroups = [
  [
    { label: 'Bold', command: () => document.execCommand('bold'), icon: 'B' },
    { label: 'Italic', command: () => document.execCommand('italic'), icon: 'I' },
    { label: 'Underline', command: () => document.execCommand('underline'), icon: 'U' },
    { label: 'Strikethrough', command: () => document.execCommand('strikeThrough'), icon: 'S' },
  ],
  [
    { label: 'Heading 2', command: () => document.execCommand('formatBlock', false, 'H2'), icon: 'H2' },
    { label: 'Heading 3', command: () => document.execCommand('formatBlock', false, 'H3'), icon: 'H3' },
    { label: 'Paragraph', command: () => document.execCommand('formatBlock', false, 'P'), icon: 'P' },
  ],
  [
    { label: 'Bulleted list', command: () => document.execCommand('insertUnorderedList'), icon: '• List' },
    { label: 'Numbered list', command: () => document.execCommand('insertOrderedList'), icon: '1. List' },
    { label: 'Quote', command: () => document.execCommand('formatBlock', false, 'BLOCKQUOTE'), icon: '❝' },
  ],
  [
    { label: 'Align left', command: () => document.execCommand('justifyLeft'), icon: '⬅' },
    { label: 'Align center', command: () => document.execCommand('justifyCenter'), icon: '↔' },
    { label: 'Align right', command: () => document.execCommand('justifyRight'), icon: '➡' },
    { label: 'Justify', command: () => document.execCommand('justifyFull'), icon: '☰' },
  ],
  [
    { label: 'Insert link', command: () => {
        const url = prompt('Enter URL');
        if (url) {
          document.execCommand('createLink', false, url);
        }
      }, icon: '🔗' },
    { label: 'Remove link', command: () => document.execCommand('unlink'), icon: '✖︎ link' },
  ],
  [
    { label: 'Clear formatting', command: () => {
        document.execCommand('removeFormat');
        document.execCommand('formatBlock', false, 'P');
      }, icon: 'Clear' },
  ],
];

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  toolbarGroups = defaultToolbarGroups,
  className = '',
}) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const sanitizedValue = useMemo(() => (typeof value === 'string' ? value : ''), [value]);

  const normalizeHtml = useCallback((html) => {
    if (!html) return '';
    const textOnly = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return textOnly.length === 0 ? '' : html;
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (sanitizedValue !== html) {
        editorRef.current.innerHTML = sanitizedValue;
      }
    }
  }, [sanitizedValue]);

  const emitChange = useCallback(() => {
    if (editorRef.current && typeof onChange === 'function') {
      const html = editorRef.current.innerHTML;
      const normalized = normalizeHtml(html);
      if (normalized === '' && html !== '') {
        editorRef.current.innerHTML = '';
      }
      onChange(normalized);
    }
  }, [normalizeHtml, onChange]);

  const handleInput = useCallback(() => {
    emitChange();
  }, [emitChange]);

  const handleToolbarAction = useCallback((action) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    action();
    emitChange();
  }, [emitChange]);

  const handlePaste = useCallback((event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    emitChange();
  }, [emitChange]);

  return (
    <div className={`rich-text-editor space-y-3 ${className}`}>
      <div className="rte-toolbar flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/60">
        {toolbarGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex items-center gap-2">
            {group.map(({ label, command, icon }, idx) => (
              <button
                key={idx}
                type="button"
                className="rounded-lg border border-transparent bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleToolbarAction(command);
                }}
                title={label}
                aria-label={label}
              >
                {icon}
              </button>
            ))}
            {groupIdx !== toolbarGroups.length - 1 && (
              <span className="hidden h-6 w-px bg-gray-200 dark:bg-gray-700 sm:block" aria-hidden />
            )}
          </div>
        ))}
      </div>

      <div
        ref={editorRef}
        className={`rte-editable min-h-[320px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${isFocused ? 'ring-2 ring-purple-400/70' : ''}`}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onPaste={handlePaste}
      />
    </div>
  );
}


