'use client';

import { useMemo } from 'react';
import JoditEditor from 'jodit-react';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
}) {
  const config = useMemo(() => ({
    readonly: false,
    placeholder: placeholder,
    height: 400,
    toolbar: true,
    toolbarButtonSize: 'medium',
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough',
      '|',
      'ul', 'ol',
      '|',
      'outdent', 'indent',
      '|',
      'font', 'fontsize', 'brush',
      '|',
      'align',
      '|',
      'image', 'link', 'video',
      '|',
      'undo', 'redo',
      '|',
      'hr', 'eraser', 'fullsize',
      '|',
      'source'
    ],
    uploader: {
      insertImageAsBase64URI: false,
      url: '/api/upload',
      format: 'json',
      filesVariableName: 'file',
      withCredentials: false,
      pathVariableName: 'path',
      defaultHandlerSuccess: (resp) => {
        if (resp.success && resp.data && resp.data.url) {
          return resp.data.url;
        }
        return resp;
      },
      defaultHandlerError: (error) => {
        console.error('Upload error:', error);
      }
    },
    image: {
      edit: true,
      upload: true,
      url: true,
      popup: true
    },
    link: {
      openInNewTab: true
    },
    style: {
      background: 'transparent'
    }
  }), [placeholder]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <JoditEditor
        value={value}
        config={config}
        onBlur={(newContent) => {
          if (typeof onChange === 'function') {
            onChange(newContent);
          }
        }}
        onChange={(newContent) => {
          if (typeof onChange === 'function') {
            onChange(newContent);
          }
        }}
        tabIndex={1}
      />
    </div>
  );
}


