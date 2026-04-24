'use client';

import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { ShareLink } from '@/components/dashboard/ShareLink';
import { ContribList } from '@/components/dashboard/ContribList';
import { DEMO_MSGS, PENDING } from '@/lib/themes';

interface DashboardViewProps {
  onBack: () => void;
  onToCard: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

export function DashboardView({ onBack, onToCard, onToast, onNav }: DashboardViewProps) {
  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} badge="group" />

      <div style={{ padding: '22px 18px 60px', maxWidth: 480, margin: '0 auto' }}>
        <Pill variant="coral">🏉 AFL Coach</Pill>
        <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#2A2A2A', marginBottom: 5 }}>Coach Dave's Card</h2>
        <p style={{ color: '#7A7585', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.6, fontWeight: 600 }}>From the Under 12s — End of Season 2025</p>

        {/* Deadline */}
        <div style={{ background: '#EAF4FB', border: '2px solid rgba(58,143,160,.2)', borderRadius: 13, padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#7A7585' }}>Deadline</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3A8FA0', marginTop: 2 }}>Fri 14 Nov</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#7A7585' }}>Days left</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#E8724A', marginTop: 2 }}>4</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {([['9', 'Messages', '#EAF4FB', '#3A8FA0'], ['6', 'Contributed', '#FDF0E8', '#E8724A'], ['$67', 'Raised', '#E8F5EF', '#5A9070']] as [string, string, string, string][]).map(([n, l, bg, c]) => (
            <div key={l} style={{ borderRadius: 14, padding: '14px 10px', textAlign: 'center', border: '2px solid #E8E2F0', background: bg }}>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: c }}>{n}</div>
              <div style={{ fontSize: '.69rem', color: '#7A7585', marginTop: 2, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Gift progress */}
        <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Gift fund — $67 of $80</div>
        <div style={{ background: '#E8E2F0', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', width: '84%', background: 'linear-gradient(90deg,#E8724A,#F09070)', borderRadius: 8, transition: 'width .5s ease' }} />
        </div>

        {/* Link */}
        <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Your link</div>
        <ShareLink link="thankyoucards.au/card/coach-dave-u12s" onCopy={() => onToast('Link copied! 🎉')} />

        {/* Contribs */}
        <div style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2A2A2A', margin: '20px 0 10px' }}>Responded (8)</div>
        <ContribList contribs={DEMO_MSGS} pending={PENDING} onRemind={name => onToast(`Reminder sent to ${name}! 📣`)} />

        <Btn variant="teal" full onClick={() => onToast('Reminders sent to 4 people! 📣')} style={{ marginTop: 20 }}>📣 Remind all who haven't responded</Btn>
        <Btn variant="coral" full onClick={() => { onToast('Closing card and generating PDF… 📄'); setTimeout(onToCard, 1200); }}>📄 Close & generate card</Btn>
        <Btn variant="outline" full onClick={onBack} style={{ marginTop: 10 }}>← Home</Btn>
      </div>
    </div>
  );
}
