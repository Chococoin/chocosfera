import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('login.title')).toBeInTheDocument();
  });

  it('renders username/email input', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('login.usernameOrEmail')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('login.password')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: 'login.submit' })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<LoginPage />);
    const forgotPasswordLink = screen.getByText('login.forgotPassword');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/es/forgot-password');
  });

  it('renders register link', () => {
    render(<LoginPage />);
    expect(screen.getByText('login.noAccount')).toBeInTheDocument();
    const registerLink = screen.getByText('login.registerLink');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/es/register');
  });

  it('allows typing in username/email field', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const input = screen.getByLabelText('login.usernameOrEmail') as HTMLInputElement;

    await user.type(input, 'testuser@example.com');
    expect(input.value).toBe('testuser@example.com');
  });

  it('allows typing in password field', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const input = screen.getByLabelText('login.password') as HTMLInputElement;

    await user.type(input, 'password123');
    expect(input.value).toBe('password123');
  });

  it('handles form submission', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const user = userEvent.setup();
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText('login.usernameOrEmail');
    const passwordInput = screen.getByLabelText('login.password');
    const submitButton = screen.getByRole('button', { name: 'login.submit' });

    await user.type(usernameInput, 'testuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith('Login attempt:', {
      usernameOrEmail: 'testuser@example.com',
      password: 'password123',
    });
  });

  it('password input has correct type', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText('login.password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('form inputs are required', () => {
    render(<LoginPage />);
    const usernameInput = screen.getByLabelText('login.usernameOrEmail');
    const passwordInput = screen.getByLabelText('login.password');

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
