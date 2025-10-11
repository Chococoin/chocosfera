'use client';

import { useTranslations } from 'next-intl';
import Header from './components/Header';
import Hero from './components/Hero';
import ContentSection from './components/ContentSection';
import Footer from './components/Footer';

export default function Home() {
  const t = useTranslations('sections');
  const tCta = useTranslations('cta');

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col justify-between overflow-x-hidden bg-background-light text-gray-800 dark:bg-background-dark dark:text-gray-200">
      <Header />

      <div className="flex flex-grow flex-col pt-20">
        <Hero />

        <ContentSection
          title={t('cacao.title')}
          description={t('cacao.description')}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAse3NTxISaNf_-4omEv-wXxQU2ka44l9BceQGc80sBhFnTWBUl83yQLyPoqazjB15oLBNYmJ2ieeilc46yiqFkZNqNXif0xTd28xcKVEOibJhw3DC_kHmoX3UfX9HUMp77SDVJTA9vPONXcv8wr2DL7yiEUzgxLJ0FjKkrRJBACPMCNdoWJFEIGT1FpNMvtQgru6ahuykMMs01pXcWmNsq9ellVLqk0GSb3DdIvvbAltnWfv0CP4C4fyQoWDVeIrqp_8KIaunD7OA"
          imageAlt="Cacao beans"
          imagePosition="left"
        />

        <ContentSection
          title={t('blockchain.title')}
          description={t('blockchain.description')}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuD17HGTdU5HgkuAZiZk4b8xhYrx0D9oCN6c6CPQS3nwQFX2-OTni8O-E1yeXFiQYLs31-pYVKUdgd8XMMRunyM9xIVo_lu8RwwEMn6ksHDo12s70mxNMjQ1hdaAFPkCiG5XyM1ML4IZxLOou1OXC40hzxSx8nZGqild6Jd4L6XlT0L1_ENq2hPoFriueoPNYZW5Pk6suGxl9TKCD5NZaR7pNe0ooFRF1sGqQiLkAIL_eRynENM_NaG1_yZIRhT4T6o-LL9awRf7c_8"
          imageAlt="Blockchain technology"
          imagePosition="right"
        />

        <ContentSection
          title={t('justice.title')}
          description={t('justice.description')}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCMhD5BIYR0Kuvk2Tegm1P6G-_p2QhkQ7KeFUx4sM3zhVOALpNTeiB73X-q6WsPCmVjuCky4oFi0uygzU1iQ4RggUCkIYQKq0mZfeeL55JfrL9F8KFjBHPQu0eWFmV6EIKDoKYoHp5ECeuLTQ0F6MEwBlsY9b8pyq1iFjC6IMVuJQXlmm4X8GrhfmFAB7mfWI7IT0vw5U3j7rAlLWDd6du_O5mFDoSpmvcvEU_LVBckzkhXQe_bJoJO8hyoqSg2pR7FAPtCIM1Iu5g"
          imageAlt="Community impact"
          imagePosition="left"
        />

        <div className="p-6 text-center">
          <button className="w-full max-w-xs cursor-pointer rounded-lg bg-primary px-5 py-3 text-base font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105">
            {tCta('start')}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
