/**
 * Phoenix RT Style Mark - TipTap extension for SOP-012 §1
 * --------------------------------------------------------
 * Injects only .phx-rt--* classes. NO inline style.
 * Allowed: phx-rt--success, phx-rt--warning, phx-rt--danger, phx-rt--highlight
 */

import { Mark, mergeAttributes } from '@tiptap/core';

function createPhoenixRTMark(styleName) {
  const className = `phx-rt--${styleName}`;
  return Mark.create({
    name: `phoenixRt${styleName.charAt(0).toUpperCase() + styleName.slice(1)}`,
    addOptions() {
      return { HTMLAttributes: { class: className } };
    },
    parseHTML() {
      return [{ tag: `span.${className}` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
  });
}

export const PhoenixRTSuccess = createPhoenixRTMark('success');
export const PhoenixRTWarning = createPhoenixRTMark('warning');
export const PhoenixRTDanger = createPhoenixRTMark('danger');
export const PhoenixRTHighlight = createPhoenixRTMark('highlight');

export { PhoenixRTSuccess as default };
