'use client';

import { Nav } from '@/components/ui/Nav';
import { Btn } from '@/components/ui/Button';
import { CardScrollView } from '@/components/cards/CardScrollView';
import { THEMES, DEMO_MSGS } from '@/lib/themes';

interface CardViewProps {
  onBack: () => void;
  onToast: (msg: string) => void;
  onNav: (view: string) => void;
}

export function CardView({ onBack, onToast, onNav }: CardViewProps) {
  return (
    <div>
      <Nav onHome={onBack} onNav={onNav} />
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
