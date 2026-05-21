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
const VIEWS: View[] = ['home', 'solo', 'group', 'contrib', 'dash', 'card'];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [contribSlug, setContribSlug] = useState('');
  const [toast, setToast] = useState({ msg: '', show: false });

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  // Handle query param navigation (admin toolbar) and Stripe redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v') as View | null;
    const payment = params.get('payment');
    const cardSlug = params.get('card');
    if (v && VIEWS.includes(v)) setView(v);
    if (payment === 'success') showToast('Payment confirmed! You\'re on the card 🎉');
    if (payment === 'cancelled') showToast('Payment cancelled — you can try again anytime.');
    if (cardSlug) {
      setContribSlug(cardSlug);
      setView('contrib');
    }
    window.history.replaceState({}, '', '/');
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
      {view === 'home'    && <HomeView onSolo={() => go('solo')} onGroup={() => go('group')} onNav={go} />}
      {view === 'solo'    && <SoloFlow onBack={() => go('home')} onToast={showToast} onNav={go} />}
      {view === 'group'   && <GroupFlow onBack={() => go('home')} onToDash={() => go('dash')} onToast={showToast} onNav={go} />}
      {view === 'contrib' && <ContribView onBack={() => go('home')} onToCard={() => go('card')} onToast={showToast} onNav={go} campaignSlug={contribSlug || undefined} />}
      {view === 'dash'    && <DashboardView onBack={() => go('home')} onToCard={() => go('card')} onToast={showToast} onNav={go} />}
      {view === 'card'    && <CardView onBack={() => go('dash')} onToast={showToast} onNav={go} />}
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
