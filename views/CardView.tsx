'use client';

import { Btn } from '@/components/ui/Button';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES, DEMO_MSGS } from '@/lib/themes';

interface CardViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

export function CardView({ onBack, onToast }: CardViewProps) {
  return (
    <div>
      <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200, borderBottom: '1px solid #E8E2F0' }}>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#3A8FA0' }}>
          thank<span style={{ color: '#E8724A' }}>you</span>cards<span style={{ color: '#7A7585', fontWeight: 600, fontSize: '.9rem' }}>.au</span>
        </div>
        <Btn variant="outline" sm onClick={onBack}>← Dashboard</Btn>
      </div>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 50px' }}>
        <CardScrollView theme={THEMES[0]} imgIdx={0} recipientName="Coach Dave" fromText="From the Under 12s" message="Thank you for an incredible season!" messages={DEMO_MSGS} giftAmount={67} />
        <div style={{ padding: '0 18px' }}>
          <Btn variant="teal" full onClick={() => onToast('Preparing your PDF… 📄')}>📄 Download PDF</Btn>
          <Btn variant="ghost" full onClick={() => onToast('Preparing your image… 🖼️')} style={{ marginTop: 10 }}>🖼️ Share as image</Btn>
        </div>
      </div>
    </div>
  );
}
