import type { Metadata } from 'next';
import { HowItWorks } from './HowItWorks';

export const metadata: Metadata = {
  title: 'How it works — thankyoucards.au',
  description: 'How solo and group cards work, what the organiser sees, and who we are.',
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
