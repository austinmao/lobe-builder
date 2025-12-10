/**
 * HeroSection Usage Examples
 *
 * This file demonstrates various ways to use the HeroSection component.
 * These examples can be used in Storybook or as documentation.
 */
import { HeroSection } from './HeroSection';

// Example 1: Full-featured hero with all props
export function FullHeroExample() {
  return (
    <HeroSection
      backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
      ctaHref="https://example.com/signup"
      ctaLabel="Get Started Free"
      subtitle="Create beautiful, responsive pages in minutes with our intuitive page builder. No coding required."
      title="Build Amazing Landing Pages"
    />
  );
}

// Example 2: Minimal hero (title only)
export function MinimalHeroExample() {
  return <HeroSection title="Welcome to Our Platform" />;
}

// Example 3: Hero with title and subtitle (no CTA)
export function NoCtaHeroExample() {
  return (
    <HeroSection
      subtitle="We're on a mission to make web design accessible to everyone."
      title="Discover Our Story"
    />
  );
}

// Example 4: Hero with background image
export function BackgroundHeroExample() {
  return (
    <HeroSection
      backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"
      ctaHref="/about"
      ctaLabel="Learn More"
      subtitle="Join thousands of companies already using our platform"
      title="Transform Your Business"
    />
  );
}

// Example 5: Product launch hero
export function ProductLaunchHeroExample() {
  return (
    <HeroSection
      ctaHref="/product/v2"
      ctaLabel="See What's New"
      subtitle="The most powerful version yet. Faster, smarter, and easier to use."
      title="Introducing ProductX 2.0"
    />
  );
}

// Example 6: Long text example (testing wrapping)
export function LongTextHeroExample() {
  return (
    <HeroSection
      ctaHref="/signup?plan=extended"
      ctaLabel="Get Started with Our Extended Trial"
      subtitle="This is also a very long subtitle with extensive descriptive text that explains the value proposition in great detail, ensuring that users understand exactly what they're getting when they sign up for our platform and why it's the best choice for their needs."
      title="This is an exceptionally long title that will wrap across multiple lines to demonstrate the responsive text handling capabilities of the hero section component"
    />
  );
}

// Example 7: Event landing page hero
export function EventHeroExample() {
  return (
    <HeroSection
      backgroundImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920"
      ctaHref="/events/conf-2025/register"
      ctaLabel="Register Now"
      subtitle="Join us for three days of talks, workshops, and networking with industry leaders."
      title="Annual Developer Conference 2025"
    />
  );
}

// Example 8: Simple CTA-focused hero
export function CtaFocusedHeroExample() {
  return (
    <HeroSection
      ctaHref="/signup?trial=true"
      ctaLabel="Start Your Free Trial"
      title="Ready to Get Started?"
    />
  );
}

/**
 * Usage in PageRenderer:
 *
 * import { HeroSection } from '@/components/PageRenderer/sections';
 *
 * function PageRenderer({ sections }) {
 *   return sections.map((section) => {
 *     switch (section.blockType) {
 *       case 'hero':
 *         return (
 *           <HeroSection
 *             key={section.id}
 *             title={section.title}
 *             subtitle={section.subtitle}
 *             ctaLabel={section.ctaLabel}
 *             ctaHref={section.ctaHref}
 *             backgroundImage={section.backgroundImage?.url}
 *           />
 *         );
 *       default:
 *         return null;
 *     }
 *   });
 * }
 */
