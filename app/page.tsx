'use client';

import { useState, useCallback } from 'react';
import { Toast } from '@/components/ui/Toast';
import { HomeView } from '@/views/HomeView';
import { SoloFlow } from '@/views/SoloFlow';
import { GroupFlow } from '@/views/GroupFlow';
import { ContribView } from '@/views/ContribView';
import { DashboardView } from '@/views/DashboardView';
import { CardView } from '@/views/CardView';

type View = 'home' | 'solo' | 'group' | 'contrib' | 'dash' | 'card';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [toast, setToast] = useState({ msg: '', show: false });

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fff' }}>
      {view === 'home'    && <HomeView onSolo={() => go('solo')} onGroup={() => go('group')} onContribDemo={() => go('contrib')} onDashDemo={() => go('dash')} />}
      {view === 'solo'    && <SoloFlow onBack={() => go('home')} onToast={showToast} />}
      {view === 'group'   && <GroupFlow onBack={() => go('home')} onToDash={() => go('dash')} onToast={showToast} />}
      {view === 'contrib' && <ContribView onBack={() => go('home')} onToCard={() => go('card')} onToast={showToast} />}
      {view === 'dash'    && <DashboardView onBack={() => go('home')} onToCard={() => go('card')} onToast={showToast} />}
      {view === 'card'    && <CardView onBack={() => go('dash')} onToast={showToast} />}
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
