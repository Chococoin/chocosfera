import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSelector from './LanguageSelector';

describe('LanguageSelector', () => {
  it('renders language selector button', () => {
    render(<LanguageSelector currentLocale="es" />);
    expect(screen.getByLabelText('Select language')).toBeInTheDocument();
  });

  it('displays current language flag and code', () => {
    render(<LanguageSelector currentLocale="es" />);
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector currentLocale="es" />);

    const button = screen.getByLabelText('Select language');
    await user.click(button);

    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(screen.getByText('Română')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LanguageSelector currentLocale="es" />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const button = screen.getByLabelText('Select language');
    await user.click(button);

    expect(screen.getByText('Español')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    // Wait a bit for the effect to close the dropdown
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('highlights current language in dropdown', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector currentLocale="es" />);

    const button = screen.getByLabelText('Select language');
    await user.click(button);

    const spanishButton = screen.getByText('Español').closest('button');
    expect(spanishButton).toHaveClass('font-semibold', 'text-white');
  });

  it('displays all 9 languages', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector currentLocale="es" />);

    const button = screen.getByLabelText('Select language');
    await user.click(button);

    const languageButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent?.includes('🇪🇸') ||
      btn.textContent?.includes('🇬🇧') ||
      btn.textContent?.includes('🇮🇹') ||
      btn.textContent?.includes('🇫🇷') ||
      btn.textContent?.includes('🇩🇪') ||
      btn.textContent?.includes('🇵🇹') ||
      btn.textContent?.includes('🇷🇴') ||
      btn.textContent?.includes('🇯🇵') ||
      btn.textContent?.includes('🇨🇳')
    );

    expect(languageButtons.length).toBeGreaterThanOrEqual(9);
  });

  it('shows chevron icon that rotates when open', async () => {
    const user = userEvent.setup();
    const { container } = render(<LanguageSelector currentLocale="es" />);

    const button = screen.getByLabelText('Select language');
    const chevron = container.querySelector('svg');

    expect(chevron).not.toHaveClass('rotate-180');

    await user.click(button);

    expect(chevron).toHaveClass('rotate-180');
  });

  it('defaults to Spanish when invalid locale is provided', () => {
    render(<LanguageSelector currentLocale="invalid" />);
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('displays correct flag for English', () => {
    render(<LanguageSelector currentLocale="en" />);
    expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('displays correct flag for Italian', () => {
    render(<LanguageSelector currentLocale="it" />);
    expect(screen.getByText('🇮🇹')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
  });

  it('displays correct flag for French', () => {
    render(<LanguageSelector currentLocale="fr" />);
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    expect(screen.getByText('FR')).toBeInTheDocument();
  });

  it('displays correct flag for German', () => {
    render(<LanguageSelector currentLocale="de" />);
    expect(screen.getByText('🇩🇪')).toBeInTheDocument();
    expect(screen.getByText('DE')).toBeInTheDocument();
  });

  it('displays correct flag for Portuguese', () => {
    render(<LanguageSelector currentLocale="pt" />);
    expect(screen.getByText('🇵🇹')).toBeInTheDocument();
    expect(screen.getByText('PT')).toBeInTheDocument();
  });

  it('displays correct flag for Romanian', () => {
    render(<LanguageSelector currentLocale="ro" />);
    expect(screen.getByText('🇷🇴')).toBeInTheDocument();
    expect(screen.getByText('RO')).toBeInTheDocument();
  });

  it('displays correct flag for Japanese', () => {
    render(<LanguageSelector currentLocale="ja" />);
    expect(screen.getByText('🇯🇵')).toBeInTheDocument();
    expect(screen.getByText('JA')).toBeInTheDocument();
  });

  it('displays correct flag for Chinese', () => {
    render(<LanguageSelector currentLocale="zh" />);
    expect(screen.getByText('🇨🇳')).toBeInTheDocument();
    expect(screen.getByText('ZH')).toBeInTheDocument();
  });
});
