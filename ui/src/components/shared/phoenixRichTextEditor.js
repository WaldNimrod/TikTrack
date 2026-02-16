/**
 * Phoenix Rich-Text Editor - TipTap (SOP-012, ADR-013)
 * -----------------------------------------------------
 * Extensions: StarterKit (filtered), Link, Underline, Heading (H3,H4),
 * TextAlign, dir (RTL/LTR), phx-rt marks
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import {
  PhoenixRTSuccess,
  PhoenixRTWarning,
  PhoenixRTDanger,
  PhoenixRTHighlight
} from './phoenixRTStyleMark.js';
import { sanitizeRichTextHtml } from '../../utils/dompurifyRichText.js';

/** Disable extensions that produce tags not in SOP allowlist */
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
  Heading.configure({ levels: [3, 4] }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
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
    textDirection: 'auto',
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
      function updateActiveState() {
        toolbar.querySelectorAll('[data-rt-cmd]').forEach((btn) => {
          const cmd = btn.getAttribute('data-rt-cmd');
          let active = false;
          if (cmd === 'phx-success') active = editor.isActive('phoenixRtSuccess');
          else if (cmd === 'phx-warning') active = editor.isActive('phoenixRtWarning');
          else if (cmd === 'phx-danger') active = editor.isActive('phoenixRtDanger');
          else if (cmd === 'phx-highlight') active = editor.isActive('phoenixRtHighlight');
          else if (cmd === 'bold') active = editor.isActive('bold');
          else if (cmd === 'italic') active = editor.isActive('italic');
          else if (cmd === 'underline') active = editor.isActive('underline');
          else if (cmd === 'heading3') active = editor.isActive('heading', { level: 3 });
          else if (cmd === 'heading4') active = editor.isActive('heading', { level: 4 });
          else if (cmd === 'alignLeft') active = editor.isActive({ textAlign: 'left' });
          else if (cmd === 'alignCenter') active = editor.isActive({ textAlign: 'center' });
          else if (cmd === 'alignRight') active = editor.isActive({ textAlign: 'right' });
          else if (cmd === 'alignJustify') active = editor.isActive({ textAlign: 'justify' });
          else if (cmd === 'dirLtr') active = editor.isActive({ textDirection: 'ltr' });
          else if (cmd === 'dirRtl') active = editor.isActive({ textDirection: 'rtl' });
          else if (cmd === 'bulletList') active = editor.isActive('bulletList');
          else if (cmd === 'orderedList') active = editor.isActive('orderedList');
          btn.classList.toggle('is-active', !!active);
        });
      }
      updateActiveState();
      editor.on('selectionUpdate', updateActiveState);
      editor.on('transaction', updateActiveState);

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
          else if (cmd === 'heading3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          else if (cmd === 'heading4') editor.chain().focus().toggleHeading({ level: 4 }).run();
          else if (cmd === 'alignLeft') editor.chain().focus().setTextAlign('left').run();
          else if (cmd === 'alignCenter') editor.chain().focus().setTextAlign('center').run();
          else if (cmd === 'alignRight') editor.chain().focus().setTextAlign('right').run();
          else if (cmd === 'alignJustify') editor.chain().focus().setTextAlign('justify').run();
          else if (cmd === 'dirLtr') editor.chain().focus().setTextDirection('ltr').run();
          else if (cmd === 'dirRtl') editor.chain().focus().setTextDirection('rtl').run();
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
