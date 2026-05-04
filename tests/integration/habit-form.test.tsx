import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitList from '@/components/habits/HabitList';
import { Habit } from '@/types/habit';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

const userId = 'user-123';

function renderHabitList(habits: Habit[] = []) {
  const setHabits = vi.fn();
  render(
    <HabitList
      habits={habits}
      setHabits={setHabits}
      userId={userId}
    />
  );
  return { setHabits };
}

describe('habit form', () => {
  it('shows a validation error when habit name is empty', async () => {
    renderHabitList();

    fireEvent.click(screen.getByTestId('create-habit-button'));

    fireEvent.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(
        screen.getByText('Habit name is required')
      ).toBeInTheDocument();
    });
  });

  it('creates a new habit and renders it in the list', async () => {
    const setHabits = vi.fn();
    const { rerender } = render(
      <HabitList habits={[]} setHabits={setHabits} userId={userId} />
    );

    fireEvent.click(screen.getByTestId('create-habit-button'));

    await userEvent.type(
      screen.getByTestId('habit-name-input'),
      'Drink Water'
    );

    fireEvent.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(setHabits).toHaveBeenCalled();
      const newHabits = setHabits.mock.calls[0][0];
      expect(newHabits[0].name).toBe('Drink Water');
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const habit: Habit = {
      id: 'habit-1',
      userId,
      name: 'Drink Water',
      description: '',
      frequency: 'daily',
      createdAt: '2026-01-01',
      completions: ['2026-04-27'],
    };

    const setHabits = vi.fn();
    render(
      <HabitList
        habits={[habit]}
        setHabits={setHabits}
        userId={userId}
      />
    );

    fireEvent.click(screen.getByTestId('habit-edit-drink-water'));

    const nameInput = screen.getByTestId('habit-name-input');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Read Books');

    fireEvent.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(setHabits).toHaveBeenCalled();
      const updated = setHabits.mock.calls[0][0];
      expect(updated[0].name).toBe('Read Books');
      expect(updated[0].id).toBe('habit-1');
      expect(updated[0].createdAt).toBe('2026-01-01');
      expect(updated[0].completions).toEqual(['2026-04-27']);
    });
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const habit: Habit = {
      id: 'habit-1',
      userId,
      name: 'Drink Water',
      description: '',
      frequency: 'daily',
      createdAt: '2026-01-01',
      completions: [],
    };

    const setHabits = vi.fn();
    render(
      <HabitList
        habits={[habit]}
        setHabits={setHabits}
        userId={userId}
      />
    );

    fireEvent.click(screen.getByTestId('habit-delete-drink-water'));

    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(setHabits).toHaveBeenCalled();
      const updated = setHabits.mock.calls[0][0];
      expect(updated).toHaveLength(0);
    });
  });

  it('toggles completion and updates the streak display', async () => {
    const today = new Date().toISOString().split('T')[0];
    const habit: Habit = {
      id: 'habit-1',
      userId,
      name: 'Drink Water',
      description: '',
      frequency: 'daily',
      createdAt: '2026-01-01',
      completions: [],
    };

    const setHabits = vi.fn();
    render(
      <HabitList
        habits={[habit]}
        setHabits={setHabits}
        userId={userId}
      />
    );

    expect(
      screen.getByTestId('habit-streak-drink-water')
    ).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('habit-complete-drink-water'));

    await waitFor(() => {
      expect(setHabits).toHaveBeenCalled();
      const updated = setHabits.mock.calls[0][0];
      expect(updated[0].completions).toContain(today);
    });
  });
});