import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './page';

describe('RegisterPage', () => {
  it('renders register form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('register.title')).toBeInTheDocument();
  });

  it('renders all form inputs', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('register.nick')).toBeInTheDocument();
    expect(screen.getByLabelText('register.email')).toBeInTheDocument();
    expect(screen.getByLabelText('register.password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: 'register.submit' })).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(<RegisterPage />);
    expect(screen.getByText('register.hasAccount')).toBeInTheDocument();
    const loginLink = screen.getByText('register.loginLink');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/es/login');
  });

  it('renders password requirements text', () => {
    render(<RegisterPage />);
    expect(screen.getByText('register.passwordRequirements')).toBeInTheDocument();
  });

  it('allows typing in nick field', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    const input = screen.getByLabelText('register.nick') as HTMLInputElement;

    await user.type(input, 'testnick');
    expect(input.value).toBe('testnick');
  });

  it('allows typing in email field', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    const input = screen.getByLabelText('register.email') as HTMLInputElement;

    await user.type(input, 'test@example.com');
    expect(input.value).toBe('test@example.com');
  });

  it('allows typing in password field', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    const input = screen.getByLabelText('register.password') as HTMLInputElement;

    await user.type(input, 'SecurePass123!');
    expect(input.value).toBe('SecurePass123!');
  });

  it('shows error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.nickRequired')).toBeInTheDocument();
      expect(screen.getByText('register.errors.emailRequired')).toBeInTheDocument();
      expect(screen.getByText('register.errors.passwordRequired')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'invalidemail');
    await user.type(passwordInput, 'SecurePass123!@#$');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.emailInvalid')).toBeInTheDocument();
    });
  });

  it('validates password length (minimum 15 characters)', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Short1!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.passwordTooShort')).toBeInTheDocument();
    });
  });

  it('validates password requires uppercase', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'securepass123!@#');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.passwordNoUppercase')).toBeInTheDocument();
    });
  });

  it('validates password requires lowercase', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SECUREPASS123!@#');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.passwordNoLowercase')).toBeInTheDocument();
    });
  });

  it('validates password requires number', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePassword!@#');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.passwordNoNumber')).toBeInTheDocument();
    });
  });

  it('validates password requires special character', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.passwordNoSpecial')).toBeInTheDocument();
    });
  });

  it('submits successfully with valid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const emailInput = screen.getByLabelText('register.email');
    const passwordInput = screen.getByLabelText('register.password');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    await user.type(nickInput, 'testnick');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'SecurePass123!@#$');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Register attempt:', {
        nick: 'testnick',
        email: 'test@example.com',
        password: 'SecurePass123!@#$',
      });
    });
  });

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nickInput = screen.getByLabelText('register.nick');
    const submitButton = screen.getByRole('button', { name: 'register.submit' });

    // Trigger error
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('register.errors.nickRequired')).toBeInTheDocument();
    });

    // Start typing to clear error
    await user.type(nickInput, 't');

    await waitFor(() => {
      expect(screen.queryByText('register.errors.nickRequired')).not.toBeInTheDocument();
    });
  });
});
