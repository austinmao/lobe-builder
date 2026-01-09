/**
 * AwakenTogetherLanding Feature
 *
 * Landing page for the 5-week live course "Awaken Together"
 * Uses UntitledUI design patterns with Ceremonia brand colors
 */
'use client';

const handleEnrollClick = () => {
  // Replace with actual enrollment link when available
  window.location.href = '#enrollment';
};

export function AwakenTogetherLanding() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">Live • Experiential • Playful • Limited Seats</div>
          <h1 className="hero-title">Learn the Skill of Connection — Live, Together</h1>
          <p className="hero-subtitle">A 5-Week Experiential Journey from Longing to Belonging</p>
          <p className="hero-keywords">Joyful. Easeful. Radiant. Loving.</p>
          <p className="hero-description">
            If you&apos;ve done the inner work —<br />
            but connection still doesn&apos;t feel as natural, playful, or alive as you know it
            could…
          </p>
          <p className="hero-tagline">This experience was designed for you.</p>
          <button className="cta-button primary" onClick={handleEnrollClick} type="button">
            👉 Enroll Now — Begins February 10
          </button>
          <p className="hero-details">Tuesdays | 1:00–2:30pm ET</p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="content-section bg-secondary">
        <div className="container">
          <h2 className="section-title">
            You&apos;ve Done the Work… So Why Isn&apos;t Connection Flowing?
          </h2>
          <p className="section-text">
            You&apos;ve meditated. You&apos;ve reflected. You&apos;ve explored healing, growth, and
            awareness.
          </p>
          <p className="section-text">And yet, connection may still feel:</p>
          <ul className="pain-points">
            <li>Effortful instead of easeful</li>
            <li>Serious instead of joyful</li>
            <li>Deep in certain spaces, but missing in daily life</li>
            <li>Inconsistent with people you care about most</li>
          </ul>
          <div className="reframe-box">
            <h3 className="reframe-title">Here&apos;s the reframe most people never receive:</h3>
            <p className="reframe-text">
              Connection doesn&apos;t take years to earn.
              <br />
              It&apos;s <strong>immediately available</strong> — when you know how to access it.
            </p>
            <p className="reframe-text">
              You weren&apos;t blocked. You didn&apos;t fail.
              <br />
              You were simply never taught the skill of connection.
            </p>
          </div>
        </div>
      </section>

      {/* Big Domino Section */}
      <section className="content-section">
        <div className="container">
          <h2 className="section-title">
            Connection Is a Skill — Not a Personality Trait or Spiritual Achievement
          </h2>
          <p className="section-text">Most people believe connection:</p>
          <ul className="belief-list">
            <li>Takes a long time</li>
            <li>Requires the &quot;right&quot; people</li>
            <li>Depends on chemistry, mood, or circumstances</li>
          </ul>
          <p className="section-text emphasis">
            That belief quietly keeps connection just out of reach.
          </p>
          <div className="truth-box">
            <p className="truth-text">The truth is far simpler — and far more liberating:</p>
            <p className="truth-highlight">
              Connection is available <strong>right now</strong>, with anyone, anywhere.
            </p>
            <p className="section-text">
              And when practiced intentionally, it can deepen to unimaginable levels:
            </p>
            <ul className="benefits-list">
              <li>With partners, friends, and family</li>
              <li>With people you want to rebuild trust with</li>
              <li>With yourself</li>
              <li>And with life itself</li>
            </ul>
            <p className="truth-highlight">
              Connection isn&apos;t something you wait for. It&apos;s something you practice.
            </p>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="content-section bg-secondary">
        <div className="container">
          <h2 className="section-title">Why This Training Feels Different</h2>
          <h3 className="subsection-title">The Fastest Way to Learn Connection Is Through Play</h3>
          <p className="section-text">
            Most personal growth spaces are heavy and serious. This one is alive.
          </p>
          <p className="section-text">Because play:</p>
          <ul className="benefits-list">
            <li>Calms the nervous system</li>
            <li>Builds safety without force</li>
            <li>Opens curiosity instead of performance</li>
            <li>Allows connection to emerge naturally</li>
          </ul>
          <div className="feature-box">
            <p className="section-text">This training is:</p>
            <ul className="feature-list">
              <li>Connective</li>
              <li>Relational</li>
              <li>Light, human, and deeply meaningful</li>
            </ul>
            <p className="section-text emphasis">
              You won&apos;t be pushed. You won&apos;t be fixed.
              <br />
              You&apos;ll be invited — again and again — into real presence with real people.
            </p>
            <p className="section-text emphasis">
              This is how connection becomes joyful, easeful, and embodied.
            </p>
          </div>
        </div>
      </section>

      {/* Program Introduction */}
      <section className="content-section">
        <div className="container">
          <h2 className="section-title">Introducing: Awaken Together</h2>
          <p className="section-text large">
            <strong>Awaken Together</strong> is a 5-week live, experiential training where you
            practice the skill of connection — together, in real time.
          </p>
          <p className="section-text">
            Not by trying harder. Not by analyzing yourself.
            <br />
            But by <strong>experiencing what works immediately</strong>.
          </p>
          <p className="section-text emphasis">
            You won&apos;t just learn <em>about</em> connection.
            <br />
            You&apos;ll <strong>feel it</strong> — and know how to return to it anytime.
          </p>
        </div>
      </section>

      {/* Weekly Breakdown */}
      <section className="content-section bg-secondary">
        <div className="container">
          <h2 className="section-title">5-Week Journey</h2>
          <div className="weeks-grid">
            <div className="week-card">
              <div className="week-icon">🌟</div>
              <h3 className="week-title">Week 1 — Connection</h3>
              <p className="week-description">
                Feel what real connection actually feels like — in your body, not your head.
              </p>
            </div>
            <div className="week-card">
              <div className="week-icon">🌟</div>
              <h3 className="week-title">Week 2 — Curiosity</h3>
              <p className="week-description">
                Open doors into others&apos; inner worlds without pressure or performance.
              </p>
            </div>
            <div className="week-card">
              <div className="week-icon">🌟</div>
              <h3 className="week-title">Week 3 — Compassion</h3>
              <p className="week-description">
                Meet emotions — yours and others&apos; — with safety and presence.
              </p>
            </div>
            <div className="week-card">
              <div className="week-icon">🌟</div>
              <h3 className="week-title">Week 4 — Clarity</h3>
              <p className="week-description">Speak truth with kindness, confidence, and care.</p>
            </div>
            <div className="week-card">
              <div className="week-icon">🌟</div>
              <h3 className="week-title">Week 5 — Courage</h3>
              <p className="week-description">
                Integrate connection into daily life, relationships, and community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="content-section">
        <div className="container">
          <h2 className="section-title">Is This For You?</h2>
          <div className="two-column">
            <div className="column">
              <h3 className="column-title">This experience is for you if you:</h3>
              <ul className="checklist">
                <li>Have done personal or spiritual work</li>
                <li>Long for joyful, easeful, loving connection</li>
                <li>Value safety, integrity, and presence</li>
                <li>Are willing to show up live and participate</li>
              </ul>
            </div>
            <div className="column">
              <h3 className="column-title">This is not for people who:</h3>
              <ul className="checklist negative">
                <li>Want quick fixes</li>
                <li>Avoid emotional discomfort</li>
                <li>Want passive content</li>
                <li>Aren&apos;t willing to show up live</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Section */}
      <section className="content-section bg-secondary">
        <div className="container">
          <h2 className="section-title">Your Guide</h2>
          <div className="guide-section">
            <div className="guide-avatar">
              <div className="avatar-placeholder">AM</div>
            </div>
            <div className="guide-content">
              <h3 className="guide-name">Austin Mao</h3>
              <p className="guide-bio">
                Austin Mao is a licensed psychedelic facilitator, keynote speaker, and founder of
                Ceremonia, a leading legal and non-profit psychedelic healing center in Colorado
                dedicated to the science and art of connection.
              </p>
              <p className="guide-bio">
                He has been featured on TEDx, Mindvalley, MAPS Psychedelic Science, and in the New
                York Times, sharing how connection — to self, others, and the natural world — is the
                foundation of healing and meaning.
              </p>
              <p className="guide-bio">
                Austin has guided over 600 individuals, from Fortune 500 executives to combat
                veterans, through transformational experiences that awaken presence, purpose, and
                belonging.
              </p>
              <p className="guide-bio">
                He is also the host of the Modern Enlightenment podcast, featuring conversations
                with leaders such as Rick Doblin, Robin Carhart-Harris, and Louie Schwartzberg.
              </p>
              <p className="guide-bio">
                His integrative approach weaves together Internal Family Systems (IFS), Circling,
                Somatic Experiencing, and Mindfulness, with an emphasis on emotional safety, play,
                and real human connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="content-section">
        <div className="container">
          <h2 className="section-title">What Participants Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;What surprised me most was how quickly strangers became family. I felt a level
                of connection and safety that I&apos;ve never experienced anywhere else.&quot;
              </p>
              <p className="testimonial-author">— Greg Deckert</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;I felt truly seen and held in community. There was a deep sense of belonging
                that I didn&apos;t even realize I had been missing my whole life.&quot;
              </p>
              <p className="testimonial-author">— Stephanie McGurren</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;I came in feeling disconnected and left feeling deeply connected — not just to
                the group, but to myself in a way I didn&apos;t know was possible.&quot;
              </p>
              <p className="testimonial-author">— Railey Z</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;There was an overwhelming sense of togetherness. I didn&apos;t feel alone for
                a single moment — I felt supported, connected, and deeply cared for.&quot;
              </p>
              <p className="testimonial-author">— Tamara Golden</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">
                &quot;I left feeling more connected than I ever have — to myself, to others, and to
                life itself.&quot;
              </p>
              <p className="testimonial-author">— Audrey M.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Receive */}
      <section className="content-section bg-secondary">
        <div className="container">
          <h2 className="section-title">What You Receive</h2>
          <div className="receive-section">
            <div className="core-experience">
              <h3 className="subsection-title">Core Experience:</h3>
              <ul className="checklist">
                <li>5 Live, 90-Minute Experiential Sessions</li>
                <li>Playful, guided connection practices</li>
                <li>Live relational exercises (solo + with others)</li>
                <li>Integration and Q&A each week</li>
                <li>A clear framework for immediate, lasting connection</li>
              </ul>
            </div>
            <div className="bonuses">
              <div className="bonus-card">
                <div className="bonus-icon">🌟</div>
                <h4 className="bonus-title">
                  BONUS #1 — The &quot;Awaken Together&quot; Blueprint Workbook + Templates
                </h4>
                <p className="bonus-description">
                  Your Personal Roadmap to Deep, Lasting Connection
                </p>
                <p className="bonus-value">Value: $197</p>
              </div>
              <div className="bonus-card">
                <div className="bonus-icon">🌟</div>
                <h4 className="bonus-title">BONUS #2 — The 7-Day Connection Reset Challenge</h4>
                <p className="bonus-description">
                  Simple 5-Minute Daily Practices to Reopen Your Heart
                </p>
                <p className="bonus-value">Value: $97</p>
              </div>
              <div className="bonus-card">
                <div className="bonus-icon">🌟</div>
                <h4 className="bonus-title">BONUS #3 — $250 Credit Toward Any Ceremonia Retreat</h4>
                <p className="bonus-description">Your Invitation to Go Deeper</p>
                <p className="bonus-value">Value: $250</p>
              </div>
              <p className="total-value">💎 Total Bonus Value: $494</p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="content-section investment-section">
        <div className="container">
          <h2 className="section-title">Investment</h2>
          <div className="price-box">
            <p className="price">$247</p>
            <p className="price-note">No payment plans. Limited seats.</p>
            <button className="cta-button primary large" onClick={handleEnrollClick} type="button">
              👉 Enroll Now — Awaken Together
            </button>
          </div>
        </div>
      </section>

      {/* Live Details */}
      <section className="content-section bg-secondary">
        <div className="container">
          <h2 className="section-title">Live Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Start Date:</strong> Tuesday, February 10
            </div>
            <div className="detail-item">
              <strong>Time:</strong> 1:00–2:30pm ET
            </div>
            <div className="detail-item">
              <strong>Format:</strong> Live, experiential
            </div>
            <div className="detail-item">
              <strong>Duration:</strong> 5 weeks
            </div>
            <div className="detail-item">
              <strong>Seats:</strong> Intentionally limited
            </div>
          </div>
        </div>
      </section>

      {/* Why Limited */}
      <section className="content-section">
        <div className="container">
          <h2 className="section-title">Why Seats Are Limited</h2>
          <p className="section-text">This work depends on:</p>
          <ul className="benefits-list">
            <li>Presence</li>
            <li>Playful pacing</li>
            <li>Emotional safety</li>
          </ul>
          <p className="section-text emphasis">Once the container is full, enrollment closes.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="content-section final-cta">
        <div className="container">
          <h2 className="section-title">Your Invitation</h2>
          <p className="section-text large center">
            Connection doesn&apos;t have to be hard.
            <br />
            It doesn&apos;t have to take years.
            <br />
            And it doesn&apos;t have to be serious to be deep.
          </p>
          <p className="section-text large center">
            When practiced together, connection becomes joyful, radiant, and immediately available.
          </p>
          <p className="section-text large center emphasis">If you feel the pull toward that…</p>
          <button className="cta-button primary large" onClick={handleEnrollClick} type="button">
            👉 Enroll Now — Awaken Together
          </button>
          <p className="tagline">Connection isn&apos;t found. It&apos;s practiced. Together.</p>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background-color: var(--color-bg-primary);
        }

        .hero-section {
          padding: 80px 24px;
          text-align: center;
          background: linear-gradient(135deg, #fef3e7 0%, #f8ede3 100%);
          border-bottom: 1px solid var(--color-border-secondary);
        }

        .hero-content {
          max-width: 768px;
          margin: 0 auto;
        }

        .badge {
          display: inline-block;
          padding: 8px 16px;
          background-color: #9d7c4d;
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 24px;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 40px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--color-text-primary);
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .hero-keywords {
          font-size: 18px;
          font-style: italic;
          color: #9d7c4d;
          margin: 0 0 24px 0;
        }

        .hero-description {
          font-size: 18px;
          color: var(--color-text-secondary);
          margin: 0 0 12px 0;
          line-height: 1.6;
        }

        .hero-tagline {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 32px 0;
        }

        .hero-details {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin: 16px 0 0 0;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          box-shadow: var(--shadow-sm);
        }

        .cta-button.primary {
          color: white;
          background-color: #9d7c4d;
        }

        .cta-button.primary:hover {
          background-color: #866738;
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }

        .cta-button.primary:active {
          transform: translateY(0);
          box-shadow: var(--shadow-sm);
        }

        .cta-button.large {
          padding: 16px 32px;
          font-size: 18px;
        }

        .content-section {
          padding: 64px 24px;
        }

        .content-section.bg-secondary {
          background-color: var(--color-bg-secondary);
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 24px 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .subsection-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 16px 0;
        }

        .section-text {
          font-size: 18px;
          color: var(--color-text-secondary);
          margin: 0 0 16px 0;
          line-height: 1.6;
        }

        .section-text.large {
          font-size: 20px;
        }

        .section-text.center {
          text-align: center;
        }

        .section-text.emphasis {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .pain-points,
        .belief-list,
        .benefits-list,
        .feature-list,
        .checklist {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
        }

        .pain-points li,
        .belief-list li,
        .benefits-list li,
        .feature-list li,
        .checklist li {
          font-size: 18px;
          color: var(--color-text-secondary);
          margin: 0 0 12px 0;
          padding-left: 28px;
          position: relative;
          line-height: 1.6;
        }

        .pain-points li::before,
        .belief-list li::before {
          content: '✗';
          position: absolute;
          left: 0;
          color: #f04438;
          font-weight: 600;
        }

        .benefits-list li::before,
        .feature-list li::before,
        .checklist li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #9d7c4d;
          font-weight: 600;
        }

        .checklist.negative li::before {
          content: '✗';
          color: #f04438;
        }

        .reframe-box,
        .truth-box,
        .feature-box {
          background-color: #fef3e7;
          border-left: 4px solid #9d7c4d;
          padding: 24px;
          margin: 24px 0;
          border-radius: 8px;
        }

        .reframe-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 12px 0;
        }

        .reframe-text,
        .truth-text {
          font-size: 18px;
          color: var(--color-text-secondary);
          margin: 0 0 12px 0;
          line-height: 1.6;
        }

        .reframe-text:last-child,
        .truth-text:last-child {
          margin-bottom: 0;
        }

        .truth-highlight {
          font-size: 20px;
          font-weight: 600;
          color: #9d7c4d;
          margin: 12px 0;
          line-height: 1.4;
        }

        .weeks-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-top: 32px;
        }

        .week-card {
          background-color: var(--color-bg-primary);
          padding: 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border-secondary);
        }

        .week-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .week-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 8px 0;
        }

        .week-description {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-top: 24px;
        }

        .column-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 16px 0;
        }

        .guide-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 24px;
        }

        .guide-avatar {
          flex-shrink: 0;
        }

        .avatar-placeholder {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #9d7c4d 0%, #c4956a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 700;
          color: white;
          margin: 0 auto;
        }

        .guide-name {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 16px 0;
        }

        .guide-bio {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin: 0 0 16px 0;
          line-height: 1.6;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-top: 32px;
        }

        .testimonial-card {
          background-color: var(--color-bg-primary);
          padding: 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border-secondary);
        }

        .testimonial-text {
          font-size: 16px;
          font-style: italic;
          color: var(--color-text-secondary);
          margin: 0 0 12px 0;
          line-height: 1.6;
        }

        .testimonial-author {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-tertiary);
          margin: 0;
        }

        .receive-section {
          margin-top: 24px;
        }

        .core-experience {
          margin-bottom: 32px;
        }

        .bonuses {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .bonus-card {
          background-color: var(--color-bg-primary);
          padding: 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 2px solid #9d7c4d;
        }

        .bonus-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .bonus-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 8px 0;
        }

        .bonus-description {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .bonus-value {
          font-size: 16px;
          font-weight: 600;
          color: #9d7c4d;
          margin: 0;
        }

        .total-value {
          font-size: 20px;
          font-weight: 700;
          color: #9d7c4d;
          margin: 24px 0 0 0;
          text-align: center;
        }

        .investment-section {
          text-align: center;
        }

        .price-box {
          max-width: 500px;
          margin: 0 auto;
          padding: 32px;
          background-color: #fef3e7;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
        }

        .price {
          font-size: 56px;
          font-weight: 700;
          color: #9d7c4d;
          margin: 0 0 8px 0;
        }

        .price-note {
          font-size: 16px;
          color: var(--color-text-secondary);
          margin: 0 0 24px 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 24px;
        }

        .detail-item {
          font-size: 18px;
          color: var(--color-text-secondary);
          padding: 12px;
          background-color: var(--color-bg-primary);
          border-radius: 8px;
        }

        .final-cta {
          text-align: center;
          padding: 80px 24px;
          background: linear-gradient(135deg, #fef3e7 0%, #f8ede3 100%);
        }

        .tagline {
          font-size: 20px;
          font-style: italic;
          color: #9d7c4d;
          margin: 24px 0 0 0;
        }

        /* Tablet and up */
        @media (min-width: 768px) {
          .hero-section {
            padding: 120px 32px;
          }

          .hero-title {
            font-size: 56px;
          }

          .hero-subtitle {
            font-size: 28px;
          }

          .weeks-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .two-column {
            grid-template-columns: repeat(2, 1fr);
          }

          .guide-section {
            flex-direction: row;
          }

          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Desktop and up */
        @media (min-width: 1024px) {
          .hero-title {
            font-size: 64px;
          }

          .weeks-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
