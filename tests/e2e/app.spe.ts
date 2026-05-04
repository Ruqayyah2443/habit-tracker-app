import { test, expect } from '@playwright/test';

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
      }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([]));
    });
    await page.goto('http://localhost:3000');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await page.getByTestId('auth-signup-email').fill('newuser@example.com');
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-users', JSON.stringify([{
        id: 'user-1',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date().toISOString(),
      }]));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: '',
          frequency: 'daily',
          createdAt: new Date().toISOString(),
          completions: [],
        },
        {
          id: 'habit-2',
          userId: 'other-user',
          name: 'Other Habit',
          description: '',
          frequency: 'daily',
          createdAt: new Date().toISOString(),
          completions: [],
        }
      ]));
    });

    await page.goto('http://localhost:3000/login');
    await page.getByTestId('auth-login-email').fill('test@example.com');
    await page.getByTestId('auth-login-password').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await expect(page.getByTestId('habit-card-other-habit')).not.toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
      }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([]));
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
      }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([{
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      }]));
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.getByTestId('habit-complete-drink-water').click();

    const streak = page.getByTestId('habit-streak-drink-water');
    await expect(streak).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
      }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([{
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      }]));
    });

    await page.goto('http://localhost:3000/dashboard');
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
      }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([]));
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
      }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([]));
    });

    await page.goto('http://localhost:3000');
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await page.context().setOffline(true);
    await page.reload();

    await expect(page).not.toHaveURL('about:blank');
    await page.context().setOffline(false);
  });
});