'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Hero() {
  const tHero = useTranslations('hero');
  const tSections = useTranslations('sections');
  const tImpact = useTranslations('dashboard.main.impactSummary');
  const tCta = useTranslations('cta');
  const tStats = useTranslations('dashboard.main.stats');
  const locale = useLocale();
  const registerHref = `/${locale}/register`;

  return (
    <section id="home" className="iko-hero">
      <div className="iko-hero__gradient" />
      <div className="iko-hero__ripple">
        <span />
        <span />
        <span />
      </div>

      <div className="iko-hero__content mx-auto max-w-6xl px-6">
        <div className="space-y-6">
          <span className="iko-hero__eyebrow">
            <span>🍫</span>
            Chocósfera
          </span>
          <h1 className="iko-hero__title">{tHero('title')}</h1>
          <p className="iko-hero__description">{tHero('description')}</p>
          <div className="iko-hero__actions">
            <Link href={registerHref} className="iko-button-primary text-xs">
              {tCta('start')}
            </Link>
            <a href="#feature" className="iko-button-secondary text-xs">
              {tSections('blockchain.title')}
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-panel px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {tSections('cacao.title')}
              </p>
              <p className="mt-2 text-2xl font-bold text-heading">100% Fair</p>
              <p className="mt-1 text-xs text-muted">
                {tSections('cacao.description').slice(0, 68)}…
              </p>
            </div>
            <div className="surface-panel px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {tSections('blockchain.title')}
              </p>
              <p className="mt-2 text-2xl font-bold text-heading">Traceable</p>
              <p className="mt-1 text-xs text-muted">
                {tSections('blockchain.description').slice(0, 68)}…
              </p>
            </div>
            <div className="surface-panel px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {tSections('justice.title')}
              </p>
              <p className="mt-2 text-2xl font-bold text-heading">Impacto</p>
              <p className="mt-1 text-xs text-muted">
                {tSections('justice.description').slice(0, 68)}…
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="surface-panel relative overflow-hidden rounded-3xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(223,134,170,0.2)] via-transparent to-[rgba(87,41,214,0.2)]" />
            <div className="relative flex flex-col gap-4">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXwCvHdwuc0I-0NZM5R34OXa5OPjWrXaxfvLUB3AV-_VcPkaztyMkM0z-mPT7QAdl_-MIdtsGnRtZx86UJHqPt-ZwvMxPiF6RwR1nyjdNuWZqh_yPe8muXKMXeOZ5zOo8zhHI0Mx_CPx2ukXRAM03Y2s-IvDPKhlnKRBfw2W0sYWOzAs38_RbUsSjSMABB3Jg-M430gq4Ik7NshmdCpA4Xe5JEKS3eaOENqghZ4RjiG0XDr7L44y4FE2pQAT9ZFDVT45veF8_QFHw"
                alt="Cacao farmers working together"
                width={640}
                height={420}
                className="h-48 w-full rounded-2xl object-cover"
                priority
              />
              <div className="grid gap-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>{tStats('adoptedTrees')}</span>
                  <span className="font-semibold text-heading">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{tStats('communitiesHelped')}</span>
                  <span className="font-semibold text-heading">5</span>
                </div>
                <div className="iko-hero__panel-progress">
                  <span style={{ width: '78%' }} />
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
                  <span>2025 Q1</span>
                  <span>{tStats('thisMonth')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="iko-hero__panel">
            <h3>Road to Impact</h3>
            <ul>
              <li>🌳 {tImpact('treesGrowing')}</li>
              <li>🧑🏾‍🌾 {tImpact('farmersSupported')}</li>
              <li>♻️ {tImpact('sustainablePractices')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
