'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ContentSection from './components/ContentSection';
import Footer from './components/Footer';

export default function Home() {
  const locale = useLocale();
  const tSections = useTranslations('sections');
  const tHero = useTranslations('hero');
  const tCta = useTranslations('cta');
  const tDashboardMain = useTranslations('dashboard.main');
  const tStats = useTranslations('dashboard.main.stats');
  const tImpact = useTranslations('dashboard.main.impactSummary');
  const tFooter = useTranslations('footer');
  const registerHref = `/${locale}/register`;

  // Skin tone animation for baby emoji
  const babyEmojis = ['👶', '👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿'];
  const [currentBabyIndex, setCurrentBabyIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBabyIndex((prev) => (prev + 1) % babyEmojis.length);
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerHeight = 104;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const contentSections = [
    {
      key: 'cacao',
      title: tSections('cacao.title'),
      description: tSections('cacao.description'),
      imageSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAse3NTxISaNf_-4omEv-wXxQU2ka44l9BceQGc80sBhFnTWBUl83yQLyPoqazjB15oLBNYmJ2ieeilc46yiqFkZNqNXif0xTd28xcKVEOibJhw3DC_kHmoX3UfX9HUMp77SDVJTA9vPONXcv8wr2DL7yiEUzgxLJ0FjKkrRJBACPMCNdoWJFEIGT1FpNMvtQgru6ahuykMMs01pXcWmNsq9ellVLqk0GSb3DdIvvbAltnWfv0CP4C4fyQoWDVeIrqp_8KIaunD7OA',
      imageAlt: 'Cacao beans',
    },
    {
      key: 'blockchain',
      title: tSections('blockchain.title'),
      description: tSections('blockchain.description'),
      imageSrc:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD17HGTdU5HgkuAZiZk4b8xhYrx0D9oCN6c6CPQS3nwQFX2-OTni8O-E1yeXFiQYLs31-pYVKUdgd8XMMRunyM9xIVo_lu8RwwEMn6ksHDo12s70mxNMjQ1hdaAFPkCiG5XyM1ML4IZxLOou1OXC40hzxSx8nZGqild6Jd4L6XlT0L1_ENq2hPoFriueoPNYZW5Pk6suGxl9TKCD5NZaR7pNe0ooFRF1sGqQiLkAIL_eRynENM_NaG1_yZIRhT4T6o-LL9awRf7c_8',
      imageAlt: 'Blockchain technology',
    },
    {
      key: 'justice',
      title: tSections('justice.title'),
      description: tSections('justice.description'),
      imageSrc: '/images/family-drawing-characters.png',
      imageAlt: 'Family drawing characters together',
    },
  ];

  const impactMetrics = [
    { label: tStats('adoptedTrees'), value: '12', accent: '🌳' },
    { label: tStats('cocoaProduced'), value: '248 kg', accent: '🍫' },
    { label: tStats('carbonOffset'), value: '1.2 ton', accent: '♻️' },
    { label: tStats('communitiesHelped'), value: '5', accent: '🤝' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Header />
      <main className="flex flex-col gap-6 pt-20 md:gap-12">
        <Hero />

        <section id="feature" className="iko-section feature-section">
          <div className="iko-section__heading">
            <h2 className="text-3xl font-bold text-heading md:text-4xl">
              {tHero('title')}
            </h2>
            <p className="text-base md:text-lg text-muted">{tHero('description')}</p>
          </div>
          <div className="content-grid px-6 sm:px-8 md:px-10 lg:px-0">
            {contentSections.map((section) => (
              <ContentSection
                key={section.key}
                title={section.title}
                description={section.description}
                imageSrc={section.imageSrc}
                imageAlt={section.imageAlt}
              />
            ))}
          </div>
        </section>

        <section id="impact" className="iko-section">
          <div className="iko-section__heading">
            <h2 className="text-3xl font-bold text-heading md:text-4xl">
              {tImpact('title')}
            </h2>
            <p className="text-base md:text-lg text-muted">{tFooter('about')}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:px-8 lg:grid-cols-2 lg:px-0">
            <div className="surface-panel p-8">
              <h3 className="text-xl md:text-2xl font-semibold text-heading">
                {tDashboardMain('quickActions')}
              </h3>
              <p className="mt-3 text-base md:text-lg text-muted">
                {tSections('blockchain.description')}
              </p>
              <div className="mt-6 grid gap-4">
                {impactMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4"
                  >
                    <span className="text-base md:text-lg text-muted">
                      <span className="text-2xl mr-2">{metric.accent}</span>
                      {metric.label}
                    </span>
                    <span className="text-xl md:text-2xl font-semibold text-heading">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-panel p-8">
              <h3 className="text-xl md:text-2xl font-semibold text-heading">
                {tImpact('title')}
              </h3>
              <ul className="mt-4 space-y-3 text-base md:text-lg text-muted">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🌳</span>
                  <span>{tImpact('treesGrowing')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🌾</span>
                  <span>{tImpact('farmersSupported')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">♻️</span>
                  <span>{tImpact('sustainablePractices')}</span>
                </li>
              </ul>
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm md:text-base text-muted mb-2">
                  <span className="uppercase tracking-[0.3em]">2025 Roadmap</span>
                  <span className="font-semibold text-heading">72%</span>
                </div>
                <div className="iko-hero__panel-progress">
                  <span style={{ width: '72%' }} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[var(--color-surface)] px-3 py-2">
                    <div className="text-xl md:text-2xl font-bold text-heading">18</div>
                    <div className="text-xs md:text-sm text-muted uppercase tracking-wider">Completado</div>
                  </div>
                  <div className="rounded-xl bg-[rgba(223,134,170,0.15)] px-3 py-2">
                    <div className="text-xl md:text-2xl font-bold text-[rgba(223,134,170,1)]">7</div>
                    <div className="text-xs md:text-sm text-muted uppercase tracking-wider">En Progreso</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-surface)] px-3 py-2">
                    <div className="text-xl md:text-2xl font-bold text-muted">25</div>
                    <div className="text-xs md:text-sm text-muted uppercase tracking-wider">Total</div>
                  </div>
                </div>
                <div className="mt-16 flex items-center justify-center gap-4 text-5xl md:text-6xl opacity-90">
                  <span className="inline-block transition-all duration-300 animate-pulse">
                    {babyEmojis[currentBabyIndex]}
                  </span>
                  <span>❤️</span>
                  <span>🌍</span>
                  <span>🎓</span>
                  <span>🍫</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="cta"
          className="iko-section pb-12"
        >
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(223,134,170,0.25)] via-[rgba(16,18,29,0.8)] to-[rgba(87,41,214,0.25)] p-10 text-center backdrop-blur-xl">
              <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-[rgba(223,134,170,0.35)] blur-3xl" />
              <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-[rgba(87,41,214,0.35)] blur-[110px]" />
              <div className="relative flex flex-col items-center gap-6">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  {tSections('justice.title')}
                </h2>
                <p className="max-w-2xl text-base md:text-lg leading-relaxed text-[rgba(255,255,255,0.75)]">
                  {tFooter('about')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={registerHref} className="iko-button-primary text-xs">
                    {tCta('start')}
                  </Link>
                  <a
                    href="#feature"
                    className="iko-button-secondary text-xs"
                    onClick={handleAnchorClick}
                  >
                    {tSections('blockchain.title')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
