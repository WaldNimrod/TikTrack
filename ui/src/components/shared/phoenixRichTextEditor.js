/**
 * Phoenix Rich-Text Editor - TipTap (SOP-012, ADR-013)
 * -----------------------------------------------------
 * Vanilla JS TipTap init. NO inline style. Only .phx-rt--* classes.
 * Extensions: StarterKit (filtered), Link, Underline, phx-rt marks
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  PhoenixRTSuccess,
  PhoenixRTWarning,
  PhoenixRTDanger,
  PhoenixRTHighlight
} from './phoenixRTStyleMark.js';
import { sanitizeRichTextHtml } from '../../utils/dompurifyRichText.js';

/** Disable extensions that produce tags not in SOP allowlist (p, br, strong, em, u, a, ul, ol, li, span) */
const STARTER_KIT_CONFIG = {
  blockquote: false,
  code: false,
  codeBlock: false,
  heading: false,
  horizontalRule: false,
  strike: false,
};

const DEFAULT_EXTENSIONS = (placeholderText) => [
  StarterKit.configure(STARTER_KIT_CONFIG),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
  }),
  Underline,
  Placeholder.configure({ placeholder: placeholderText || 'הזן תיאור...' }),
  PhoenixRTSuccess,
  PhoenixRTWarning,
  PhoenixRTDanger,
  PhoenixRTHighlight,
];

/**
 * Create TipTap editor on a DOM element with optional toolbar
 * @param {HTMLElement} element - Container for editor
 * @param {Object} opts - { content, placeholder, toolbarId, editorProps }
 * @returns {{ editor: Editor, getHTML: () => string, destroy: () => void }}
 */
export function createPhoenixRichTextEditor(element, opts = {}) {
  const { content = '', placeholder = '', toolbarId = null, editorProps = {} } = opts;

  const placeholderText = placeholder || 'הזן תיאור...';
  const editor = new Editor({
    element,
    extensions: DEFAULT_EXTENSIONS(placeholderText),
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        dir: 'auto',
        class: 'phoenix-rt-editor',
        ...(editorProps.attributes || {}),
      },
      ...editorProps,
    },
  });

  if (toolbarId) {
    const toolbar = document.getElementById(toolbarId);
    if (toolbar) {
      toolbar.querySelectorAll('[data-rt-cmd]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cmd = btn.getAttribute('data-rt-cmd');
          if (cmd === 'phx-success') editor.chain().focus().toggleMark('phoenixRtSuccess').run();
          else if (cmd === 'phx-warning') editor.chain().focus().toggleMark('phoenixRtWarning').run();
          else if (cmd === 'phx-danger') editor.chain().focus().toggleMark('phoenixRtDanger').run();
          else if (cmd === 'phx-highlight') editor.chain().focus().toggleMark('phoenixRtHighlight').run();
          else if (cmd === 'bold') editor.chain().focus().toggleBold().run();
          else if (cmd === 'italic') editor.chain().focus().toggleItalic().run();
          else if (cmd === 'underline') editor.chain().focus().toggleUnderline().run();
          else if (cmd === 'bulletList') editor.chain().focus().toggleBulletList().run();
          else if (cmd === 'orderedList') editor.chain().focus().toggleOrderedList().run();
        });
      });
    }
  }

  return {
    editor,
    getHTML() {
      const html = editor.getHTML();
      return sanitizeRichTextHtml(html);
    },
    destroy() {
      editor.destroy();
    },
  };
}
