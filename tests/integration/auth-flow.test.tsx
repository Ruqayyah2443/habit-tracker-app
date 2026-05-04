import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Helper to clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe('auth flow', () => {
  it('submits the signup form and creates a session', async () => {
    render(<SignupForm />);
    
    await userEvent.type(
      screen.getByTestId('auth-signup-email'),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByTestId('auth-signup-password'),
      'password123'
    );
    
    fireEvent.click(screen.getByTestId('auth-signup-submit'));
    
    await waitFor(() => {
      const session = localStorage.getItem('habit-tracker-session');
      expect(session).not.toBeNull();
      const parsed = JSON.parse(session!);
      expect(parsed.email).toBe('test@example.com');
    });
  });

  it('shows an error for duplicate signup email', async () => {
    // Create existing user first
    const existingUser = [{
      id: '1',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
    }];
    localStorage.setItem('habit-tracker-users', JSON.stringify(existingUser));

    render(<SignupForm />);

    await userEvent.type(
      screen.getByTestId('auth-signup-email'),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByTestId('auth-signup-password'),
      'password123'
    );

    fireEvent.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('submits the login form and stores the active session', async () => {
    // Create existing user
    const existingUser = [{
      id: '1',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
    }];
    localStorage.setItem('habit-tracker-users', JSON.stringify(existingUser));

    render(<LoginForm />);

    await userEvent.type(
      screen.getByTestId('auth-login-email'),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByTestId('auth-login-password'),
      'password123'
    );

    fireEvent.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      const session = localStorage.getItem('habit-tracker-session');
      expect(session).not.toBeNull();
      const parsed = JSON.parse(session!);
      expect(parsed.email).toBe('test@example.com');
    });
  });

  it('shows an error for invalid login credentials', async () => {
    render(<LoginForm />);

    await userEvent.type(
      screen.getByTestId('auth-login-email'),
      'wrong@example.com'
    );
    await userEvent.type(
      screen.getByTestId('auth-login-password'),
      'wrongpassword'
    );

    fireEvent.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid email or password')
      ).toBeInTheDocument();
    });
  });
});