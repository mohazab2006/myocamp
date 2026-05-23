/**
 * Email template rendering.
 *
 * Two transforms:
 *   1. Placeholder substitution — `{{name}}` lookups against a values map.
 *      Missing values render as empty string (safer than `[name]` leakage).
 *   2. Lightweight markdown → HTML — paragraphs, **bold**, *italic*, links,
 *      bullet lists, hard breaks. No external dependency. HTML in source is
 *      escaped first so users can't inject script tags via the GUI editor.
 *
 * Intentionally minimal — covers what every email in this codebase needs.
 */

export type TemplateValues = Record<string, string | number | null | undefined>;

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function substitute(template: string, values: TemplateValues): string {
  return template.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const v = values[key];
    if (v == null) return "";
    return String(v);
  });
}

/** List all `{{placeholders}}` referenced in a string. */
export function extractPlaceholders(template: string): string[] {
  const seen = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER_RE)) {
    seen.add(match[1]);
  }
  return [...seen];
}

// ---------------------------------------------------------------------------
// Markdown → HTML (purpose-built, no dep)
// ---------------------------------------------------------------------------

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Inline transforms: links, bold, italic. Operates on already-escaped text. */
function renderInline(safe: string): string {
  // Links: [text](url) — url is constrained to http(s) and mailto: only.
  let out = safe.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    (_m, text: string, href: string) =>
      `<a href="${href}" style="color:#2d5a4a;text-decoration:underline">${text}</a>`
  );
  // Bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text* (avoid matching the inside of bold — done first above means
  // any remaining single-asterisk pairs are italics).
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  return out;
}

export function renderMarkdownToHtml(markdown: string): string {
  // Normalize line endings + escape HTML once at the top.
  const escaped = escapeHtml(markdown).replace(/\r\n/g, "\n");

  // Split into blocks separated by 1+ blank lines.
  const blocks = escaped.split(/\n{2,}/);
  const html: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    // Bullet list — every non-empty line starts with "- " or "* ".
    const lines = block.split("\n");
    const allBullets = lines.every((line) => /^\s*[-*]\s+/.test(line));
    if (allBullets) {
      html.push("<ul style=\"margin:0 0 12px 0;padding-left:20px\">");
      for (const line of lines) {
        const text = line.replace(/^\s*[-*]\s+/, "");
        html.push(`<li style="margin:4px 0">${renderInline(text)}</li>`);
      }
      html.push("</ul>");
      continue;
    }

    // Regular paragraph — preserve hard line breaks as <br>.
    const withBreaks = lines.map(renderInline).join("<br>\n");
    html.push(
      `<p style="margin:0 0 16px 0;line-height:1.6;font-size:15px;color:#252420">${withBreaks}</p>`
    );
  }

  return html.join("\n");
}

// ---------------------------------------------------------------------------
// Final HTML wrapper — minimal email-safe shell
// ---------------------------------------------------------------------------

export interface BuildHtmlOptions {
  subject: string;
  bodyHtml: string;
  footerHtml?: string | null;
}

export function buildHtmlEmail({ subject, bodyHtml, footerHtml }: BuildHtmlOptions): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f5efe3;font-family:'Inter',-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#252420">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #d9d1bf">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #d9d1bf">
                <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#7a6c54">MYO Camp</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #d9d1bf;background:#f5efe3;font-size:12px;color:#7a6c54;line-height:1.6">
                ${footerHtml ?? "You're receiving this because you registered with MYO Camp. Reply directly to this email if you need help."}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ---------------------------------------------------------------------------
// One-shot render: take a template row + values, return subject + html + text
// ---------------------------------------------------------------------------

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface RenderTemplateInput {
  subjectTemplate: string;
  bodyTemplate: string;
  values: TemplateValues;
}

export function renderTemplate(input: RenderTemplateInput): RenderedEmail {
  const subject = substitute(input.subjectTemplate, input.values);
  const markdown = substitute(input.bodyTemplate, input.values);
  const bodyHtml = renderMarkdownToHtml(markdown);
  const html = buildHtmlEmail({ subject, bodyHtml });
  return { subject, html, text: markdown };
}
