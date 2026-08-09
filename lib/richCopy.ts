// Plain-text URLs paste as bare, unstyled text in email clients (Outlook especially never
// unfurls a pasted link into a preview the way messaging apps do). Writing text/html to the
// clipboard alongside the text/plain fallback means pasting into any HTML-aware compose box
// (Outlook, Gmail, Apple Mail — effectively all of them) renders an actual styled mini-card
// instead. Falls back to a plain-text copy on anything that doesn't support rich clipboard
// writes (older Firefox, non-secure contexts).
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export async function copyLinkRich(url: string, opts: { title: string; subtitle?: string; imageUrl?: string; buttonLabel: string }): Promise<void> {
  const { title, subtitle, buttonLabel } = opts;
  // Always show *something* — fall back to the site logo when the card has no cover photo
  // (e.g. a corporate card without one uploaded), rather than a bare text block.
  const imageUrl = opts.imageUrl || (typeof window !== 'undefined' ? `${window.location.origin}/og-image.png` : undefined);

  const html = `<div style="max-width:420px;font-family:Arial,Helvetica,sans-serif;border:1px solid #E8E2F0;border-radius:14px;overflow:hidden;">
${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" style="width:100%;height:auto;display:block;" />` : ''}
<div style="padding:16px 18px;">
<div style="font-weight:800;font-size:16px;color:#2A2A2A;margin:0 0 4px;">${escapeHtml(title)}</div>
${subtitle ? `<div style="font-size:13px;color:#7A7585;margin:0 0 14px;">${escapeHtml(subtitle)}</div>` : ''}
<a href="${escapeHtml(url)}" style="display:inline-block;background:#3A8FA0;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:800;font-size:14px;">${escapeHtml(buttonLabel)}</a>
</div>
</div>`;

  try {
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([url], { type: 'text/plain' }),
    });
    await navigator.clipboard.write([item]);
  } catch {
    await navigator.clipboard.writeText(url);
  }
}
