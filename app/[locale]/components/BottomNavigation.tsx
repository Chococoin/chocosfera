'use client';

import { useTranslations } from 'next-intl';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, label, href, isActive = false }: NavItemProps) {
  const colorClass = isActive
    ? 'text-primary'
    : 'text-gray-500 dark:text-gray-400';

  return (
    <a
      className={`flex flex-1 flex-col items-center justify-end gap-1 ${colorClass}`}
      href={href}
    >
      {icon}
      <p className="text-xs font-medium">{label}</p>
    </a>
  );
}

export default function BottomNavigation() {
  const t = useTranslations('navigation');
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-primary/20 bg-background-light dark:bg-background-dark">
      <div className="flex justify-around px-4 pt-2 pb-4">
        <NavItem
          icon={
            <svg
              fill="currentColor"
              height="24px"
              viewBox="0 0 256 256"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
          }
          label={t('home')}
          href="#"
          isActive
        />
        <NavItem
          icon={
            <svg
              fill="currentColor"
              height="24px"
              viewBox="0 0 256 256"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M212,80a28,28,0,1,0,28,28A28,28,0,0,0,212,80Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,212,120ZM72,108a28,28,0,1,0-28,28A28,28,0,0,0,72,108ZM44,120a12,12,0,1,1,12-12A12,12,0,0,1,44,120ZM92,88A28,28,0,1,0,64,60,28,28,0,0,0,92,88Zm0-40A12,12,0,1,1,80,60,12,12,0,0,1,92,48Zm72,40a28,28,0,1,0-28-28A28,28,0,0,0,164,88Zm0-40a12,12,0,1,1-12,12A12,12,0,0,1,164,48Zm23.12,100.86a35.3,35.3,0,0,1-16.87-21.14,44,44,0,0,0-84.5,0A35.25,35.25,0,0,1,69,148.82,40,40,0,0,0,88,224a39.48,39.48,0,0,0,15.52-3.13,64.09,64.09,0,0,1,48.87,0,40,40,0,0,0,34.73-72ZM168,208a24,24,0,0,1-9.45-1.93,80.14,80.14,0,0,0-61.19,0,24,24,0,0,1-20.71-43.26,51.22,51.22,0,0,0,24.46-30.67,28,28,0,0,1,53.78,0,51.27,51.27,0,0,0,24.53,30.71A24,24,0,0,1,168,208Z"></path>
            </svg>
          }
          label={t('adopt')}
          href="#"
        />
        <NavItem
          icon={
            <svg
              fill="currentColor"
              height="24px"
              viewBox="0 0 256 256"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
            </svg>
          }
          label={t('traceability')}
          href="#"
        />
        <NavItem
          icon={
            <svg
              fill="currentColor"
              height="24px"
              viewBox="0 0 256 256"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path>
            </svg>
          }
          label={t('impact')}
          href="#"
        />
        <NavItem
          icon={
            <svg
              fill="currentColor"
              height="24px"
              viewBox="0 0 256 256"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
            </svg>
          }
          label={t('create')}
          href="#"
        />
      </div>
    </div>
  );
}
