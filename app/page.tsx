'use client';

import { useState, useCallback, useEffect } from 'react';
import { Toast } from '@/components/ui/Toast';
import { HomeView } from '@/views/HomeView';
import { SoloFlow } from '@/views/SoloFlow';
import { GroupFlow } from '@/views/GroupFlow';
import { ContribView } from '@/views/ContribView';
import { DashboardView } from '@/views/DashboardView';
import { CardView } from '@/views/CardView';

type View = 'home' | 'solo' | 'group' | 'contrib' | 'dash' | 'card';

const DEV_VIEWS: { label: string; view: View }[] = [
  { label: '🏠 Home',        view: 'home' },
  { label: '📨 Solo Card',   view: 'solo' },
  { label: '👥 Group Card',  view: 'group' },
  { label: '✍️ Contributor', view: 'contrib' },
  { label: '📊 Dashboard',   view: 'dash' },
  { label: '🎴 Card View',   view: 'card' },
];

function DevButton({ onNav }: { onNav: (v: View) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 99999 }}>
      {open && (
        <div style={{ position: 'absolute', bottom: 48, right: 0, background: '#F7F5FB', border: '1.5px dashed #D1C8DC', borderRadius: 12, padding: '10px 12px', width: 180, boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#B0A8BC', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Dev — jump to</div>
          {DEV_VIEWS.map(item => (
            <button key={item.view} onClick={() => { onNav(item.view); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', border: '1.5px solid #E8E2F0', borderRadius: 8, padding: '7px 10px', marginBottom: 5, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: '.8rem', color: '#2A2A2A' }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ background: '#fff', border: '1.5px dashed #B0A8BC', borderRadius: 10, padding: '8px 12px', fontSize: '.8rem', color: '#B0A8BC', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
        {open ? '✕' : '🛠'}
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [contribSlug, setContribSlug] = useState('');
  const [toast, setToast] = useState({ msg: '', show: false });

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  // Handle Stripe redirect back after payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      showToast('Payment confirmed! You\'re on the card 🎉');
      window.history.replaceState({}, '', '/');
    }
    if (params.get('payment') === 'cancelled') {
      showToast('Payment cancelled — you can try again anytime.');
      window.history.replaceState({}, '', '/');
    }
  }, [showToast]);

  const go = (v: string) => {
    // Support "contrib:slug" nav strings from GroupFlow
    if (v.startsWith('contrib:')) {
      setContribSlug(v.slice(8));
      setView('contrib');
    } else {
      setContribSlug('');
      setView(v as View);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff', position: 'relative' }}>
      {view === 'home'    && <HomeView onSolo={() => go('solo')} onGroup={() => go('group')} onContribDemo={() => go('contrib')} onDashDemo={() => go('dash')} onNav={go} />}
      {view === 'solo'    && <SoloFlow onBack={() => go('home')} onToast={showToast} onNav={go} />}
      {view === 'group'   && <GroupFlow onBack={() => go('home')} onToDash={() => go('dash')} onToast={showToast} onNav={go} />}
      {view === 'contrib' && <ContribView onBack={() => go('home')} onToCard={() => go('card')} onToast={showToast} onNav={go} campaignSlug={contribSlug || undefined} />}
      {view === 'dash'    && <DashboardView onBack={() => go('home')} onToCard={() => go('card')} onToast={showToast} onNav={go} />}
      {view === 'card'    && <CardView onBack={() => go('dash')} onToast={showToast} onNav={go} />}
      <DevButton onNav={v => go(v)} />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
