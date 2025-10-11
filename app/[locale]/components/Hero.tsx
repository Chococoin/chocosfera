'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <>
      <div
        className="h-80 w-full bg-cover bg-center bg-no-repeat md:h-96"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXwCvHdwuc0I-0NZM5R34OXa5OPjWrXaxfvLUB3AV-_VcPkaztyMkM0z-mPT7QAdl_-MIdtsGnRtZx86UJHqPt-ZwvMxPiF6RwR1nyjdNuWZqh_yPe8muXKMXeOZ5zOo8zhHI0Mx_CPx2ukXRAM03Y2s-IvDPKhlnKRBfw2W0sYWOzAs38_RbUsSjSMABB3Jg-M430gq4Ik7NshmdCpA4Xe5JEKS3eaOENqghZ4RjiG0XDr7L44y4FE2pQAT9ZFDVT45veF8_QFHw")',
        }}
      />
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed">
          {t('description')}
        </p>
      </div>
    </>
  );
}
