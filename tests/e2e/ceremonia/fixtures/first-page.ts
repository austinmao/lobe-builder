/**
 * Test fixture: First real landing page data for Ceremonia
 * "Softening the Season: 3 Simple Skills for Connection in the Chaos"
 */

export const firstLandingPage = {
  _status: 'draft' as const,
  designSystem: 'untitledui' as const,
  sections: [
    {
      blockType: 'hero',
      ctaHref: '#register',
      ctaLabel: 'Join Us',
      subtitle: '3 Simple Skills for Connection in the Chaos',
      title: 'Softening the Season',
    },
    {
      blockType: 'features',
      heading: "What You'll Learn",
      items: [
        {
          description: 'Tools to manage stress during the holidays',
          icon: 'heart',
          title: 'Emotional Regulation',
        },
        {
          description: 'Deepen relationships with loved ones',
          icon: 'users',
          title: 'Connection Skills',
        },
        {
          description: 'Stay present amidst the chaos',
          icon: 'brain',
          title: 'Mindfulness Practices',
        },
      ],
    },
    {
      blockType: 'cta',
      description: 'Join us for this transformative workshop',
      heading: 'Ready to Transform Your Holidays?',
      primaryButton: {
        href: '#register',
        label: 'Register Now',
      },
    },
  ],
  slug: 'softening-the-season-3-simple-skills-for-connection-in-the-chaos',
  tenantId: 'ceremonia',
  title: 'Softening the Season: 3 Simple Skills for Connection in the Chaos',
  userId: 'user_ceremonia_admin',
};

export const publishedFirstLandingPage = {
  ...firstLandingPage,
  _status: 'published' as const,
};
