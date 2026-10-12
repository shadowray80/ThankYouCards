'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { PrintableCard, type PrintCampaign, type PrintContribution, type PrintMode } from '@/components/print/PrintableCard';

const SANS = "'Nunito',sans-serif";

// Used only when the server's browser renders this page (?render=1) into the print file.
// A4 landscape, no page margin (the card has its own safe margin built in), exact colours.
const RENDER_CSS = `
html, body { margin: 0 !important; padding: 0 !important; }
@page { size: A4 landscape; margin: 0; }
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
@media print {
  html, body { background: #fff !important; }
  .tyc-sheet { box-shadow: none !important; margin: 0 !important; break-after: page; }
  .tyc-render > .tyc-sheet:last-child { break-after: auto; }
}
@media screen {
  .tyc-render { display: inline-flex; flex-direction: column; padding: 24px 24px 0; background: #F3F1F7; }
}
`;
function optionStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, textAlign: 'left', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontFamily: SANS,
    border: active ? '2px solid #3A8FA0' : '2px solid #E8E2F0', background: active ? '#EAF4FB' : '#fff',
  };
}

// What the server's browser loads: just the sheets, and a marker once they're laid out.
function RenderOnly({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const mode: PrintMode = searchParams.get('mode') === 'single' ? 'single' : 'double';
  const flip = searchParams.get('flip') === '1';
  const [campaign, setCampaign] = useState<(PrintCampaign & { status: string }) | null>(null);
  const [contributions, setContributions] = useState<PrintContribution[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`/api/campaigns/${slug}`).then(r => r.json()).then(json => {
      if (json.campaign) { setCampaign(json.campaign); setContributions(json.contributions ?? []); }
    });
  }, [slug]);

  return (
    <>
      <style>{RENDER_CSS}</style>
      <div className="tyc-render" data-print-ready={ready ? '1' : undefined}>
        {campaign && (
          <PrintableCard
            campaign={campaign} contributions={contributions} mode={mode} flip={flip}
            watermark={campaign.status !== 'sent'} onReady={() => setReady(true)}
          />
        )}
      </div>
    </>
  );
}

function PrintContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const isPreview = searchParams.get('preview') === '1';
  const isRender = searchParams.get('render') === '1';

  const [status, setStatus] = useState<'loading' | 'ok' | 'error' | 'not-sent'>('loading');
  const [mode, setMode] = useState<PrintMode>('double');
  const [flip, setFlip] = useState(false);
  const [previewState, setPreviewState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!slug || isRender) return;
    fetch(`/api/campaigns/${slug}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setStatus('error');
        else setStatus(json.campaign.status !== 'sent' && !isPreview ? 'not-sent' : 'ok');
      })
      .catch(() => setStatus('error'));
  }, [slug, isRender, isPreview]);

  if (isRender) return <RenderOnly slug={slug} />;

  if (status === 'error') return <div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#E8724A' }}>This card link isn&apos;t valid.</div>;
  if (status === 'loading') return <div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#7A7585' }}>Loading your card…</div>;
  if (status === 'not-sent') return <div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#3A8FA0' }}>This card hasn&apos;t been sent yet.</div>;

  const query = (extra: Record<string, string>) =>
    new URLSearchParams({ slug, ...(isPreview ? { preview: '1' } : {}), ...extra }).toString();
  const printFileUrl = `/api/render/print?${query({ mode, flip: flip ? '1' : '0' })}`;
  const previewUrl = `/api/render/print?${query({ mode: 'single', format: 'png' })}`;

  return (
    <div style={{ minHeight: '100dvh', background: '#F3F1F7' }}>
      <Nav onHome={() => router.push('/')} badge={null} />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 40px', fontFamily: SANS }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#2A2A2A', marginBottom: 14 }}>Print card</div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button onClick={() => setMode('double')} style={optionStyle(mode === 'double')}>
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#2A2A2A' }}>Double-sided</div>
            <div style={{ fontSize: '.75rem', color: '#7A7585', fontWeight: 600, marginTop: 2 }}>One sheet, folded once</div>
          </button>
          <button onClick={() => setMode('single')} style={optionStyle(mode === 'single')}>
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#2A2A2A' }}>Single-sided</div>
            <div style={{ fontSize: '.75rem', color: '#7A7585', fontWeight: 600, marginTop: 2 }}>Two sheets, one inside the other</div>
          </button>
        </div>

        <div style={{ fontSize: '.82rem', color: '#5A5566', fontWeight: 600, lineHeight: 1.6, marginBottom: 12 }}>
          {mode === 'double'
            ? 'Print double-sided on A4. Fold the sheet in half with the cover on the outside. Any extra message sheets fold and tuck inside.'
            : 'Print single-sided on A4. Fold each sheet in half: the cover sheet picture-side out, the message sheets messages-side in. Slip the message sheets inside the cover.'}
        </div>

        {mode === 'double' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem', fontWeight: 700, color: '#2A2A2A', marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={flip} onChange={e => setFlip(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#3A8FA0' }} />
            Inside came out upside down? Flip it, then print again
          </label>
        )}

        <a
          href={printFileUrl} target="_blank" rel="noopener"
          style={{ display: 'block', textAlign: 'center', background: '#3A8FA0', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 800, fontSize: '1rem', textDecoration: 'none' }}
        >
          Open print file
        </a>
        <div style={{ fontSize: '.74rem', color: '#7A7585', fontWeight: 600, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
          It takes a few seconds to prepare. On a phone, tap Share, then Print.
        </div>

        <div style={{ marginTop: 22, background: '#fff', borderRadius: 12, padding: 10, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
          {previewState !== 'ok' && (
            <div style={{ padding: '30px 10px', textAlign: 'center', fontSize: '.82rem', fontWeight: 700, color: '#B0A8BC' }}>
              {previewState === 'error' ? 'Couldn’t load the preview — the print file still works.' : 'Preparing preview…'}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl} alt="Preview of the printed card"
            onLoad={() => setPreviewState('ok')} onError={() => setPreviewState('error')}
            style={{ width: '100%', display: previewState === 'ok' ? 'block' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#7A7585' }}>Loading…</div>}>
      <PrintContent />
    </Suspense>
  );
}
