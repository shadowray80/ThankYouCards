'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Nav } from '@/components/ui/Nav';
import { PrintableCard, type PrintCampaign, type PrintContribution, type PrintMode } from '@/components/print/PrintableCard';
import { SHEET_W } from '@/lib/printLayout';

const SANS = "'Nunito',sans-serif";

// A4 landscape, no page margin (the card has its own safe margin built in), exact colours.
const PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  .tyc-print-hide { display: none !important; }
  .tyc-print-sheets { zoom: 1 !important; padding: 0 !important; background: none !important; }
  .tyc-sheet { box-shadow: none !important; margin: 0 !important; break-after: page; }
  .tyc-print-sheets > .tyc-sheet:last-child { break-after: auto; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}`;

function optionStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, textAlign: 'left', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontFamily: SANS,
    border: active ? '2px solid #3A8FA0' : '2px solid #E8E2F0', background: active ? '#EAF4FB' : '#fff',
  };
}

function PrintContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const isPreview = searchParams.get('preview') === '1';

  const [campaign, setCampaign] = useState<(PrintCampaign & { status: string }) | null>(null);
  const [contributions, setContributions] = useState<PrintContribution[]>([]);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<PrintMode>('double');
  const [flip, setFlip] = useState(false);
  const [insideSheets, setInsideSheets] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/campaigns/${slug}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); return; }
        setCampaign(json.campaign);
        setContributions(json.contributions ?? []);
      })
      .catch(() => setError('Could not load card'));
  }, [slug]);

  // Shrink the sheets to fit the screen (print always uses the real size).
  useEffect(() => {
    const fit = () => setZoom(Math.min(1, (window.innerWidth - 32) / SHEET_W));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  if (error) return <div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#E8724A' }}>This card link isn&apos;t valid.</div>;
  if (!campaign) return <div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#7A7585' }}>Loading your card…</div>;
  if (campaign.status !== 'sent' && !isPreview) {
    return <div style={{ padding: 32, fontFamily: SANS, fontWeight: 700, color: '#3A8FA0' }}>This card hasn&apos;t been sent yet.</div>;
  }

  const extra = Math.max(0, insideSheets - 1);

  return (
    <div style={{ minHeight: '100dvh', background: '#F3F1F7' }}>
      <style>{PRINT_CSS}</style>

      <div className="tyc-print-hide">
        <Nav onHome={() => router.push('/')} badge={null} />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 8px', fontFamily: SANS }}>
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
            {mode === 'double' ? (
              <>Print double-sided on A4. Fold the sheet in half with the cover on the outside.{extra > 0 && <> The {extra === 1 ? 'extra message sheet folds' : `${extra} extra message sheets fold`} and tucks inside.</>}</>
            ) : (
              <>Print single-sided on A4. Fold each sheet in half: the cover sheet picture-side out, the message {extra > 0 ? 'sheets' : 'sheet'} messages-side in. Slip the {extra > 0 ? 'message sheets' : 'message sheet'} inside the cover.</>
            )}
          </div>

          {mode === 'double' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem', fontWeight: 700, color: '#2A2A2A', marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={flip} onChange={e => setFlip(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#3A8FA0' }} />
              Inside came out upside down? Flip it, then print again
            </label>
          )}

          <button
            onClick={() => window.print()}
            disabled={!insideSheets}
            style={{ width: '100%', background: insideSheets ? '#3A8FA0' : '#B0A8BC', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: insideSheets ? 'pointer' : 'default', fontFamily: SANS }}
          >
            Print
          </button>
          <div style={{ fontSize: '.72rem', color: '#B0A8BC', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>
            Looks small or cut off? Set the printer&apos;s scale to 100% and paper to A4.
          </div>
        </div>
      </div>

      <div className="tyc-print-sheets" style={{ zoom, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <PrintableCard campaign={campaign} contributions={contributions} mode={mode} flip={flip} onReady={({ insideSheets: n }) => setInsideSheets(n)} />
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
