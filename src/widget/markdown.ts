// ============================================================================
// Widget Markdown — minimal, dependency-free renderer for AI replies.
// The embeddable widget is vanilla DOM inside a Shadow Root (see render.ts),
// so it can't pull in react-markdown like ChatWidget.tsx does. This covers
// the subset AI replies actually use: bold, italic, inline code, links.
// ============================================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderInlineMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Markdown links [label](url) and bare URLs both become <a> tags — bare
  // URLs are matched in the same pass so a markdown link's URL never gets
  // re-linked a second time.
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g,
    (_match, label?: string, mdUrl?: string, bareUrl?: string) => {
      if (mdUrl) {
        return `<a href="${mdUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      }
      let url = bareUrl as string;
      let trailing = "";
      const trailingMatch = url.match(/[).,;:!?]+$/);
      if (trailingMatch) {
        trailing = trailingMatch[0];
        url = url.slice(0, -trailing.length);
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${trailing}`;
    },
  );

  html = html.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+?)`/g, "<code>$1</code>");

  return html;
}
