/**
 * Awaken Together Landing Page
 *
 * 5-Week Live Course Landing Page for Ceremonia
 * Accessible via: live.ceremoniacircle.org/lp/heartmind-awaken-together-live-course-feb-2026
 */
import { Metadata } from 'next';

import { AwakenTogetherLanding } from '@/features/AwakenTogetherLanding';

export const metadata: Metadata = {
  description:
    'A 5-Week Experiential Journey from Longing to Belonging. Learn the Skill of Connection — Live, Together. Begins February 10, 2026.',
  openGraph: {
    description:
      'A 5-Week Experiential Journey from Longing to Belonging. Learn the Skill of Connection — Live, Together.',
    images: [
      {
        height: 630,
        url: '/images/og-awaken-together.jpg',
        width: 1200,
      },
    ],
    title: 'Awaken Together — Live 5-Week Connection Training | Ceremonia',
    type: 'website',
  },
  title: 'Awaken Together — Live 5-Week Connection Training | Ceremonia',
  twitter: {
    card: 'summary_large_image',
    description:
      'A 5-Week Experiential Journey from Longing to Belonging. Learn the Skill of Connection — Live, Together.',
    images: ['/images/og-awaken-together.jpg'],
    title: 'Awaken Together — Live 5-Week Connection Training | Ceremonia',
  },
};

export default function AwakenTogetherPage() {
  return <AwakenTogetherLanding />;
}
