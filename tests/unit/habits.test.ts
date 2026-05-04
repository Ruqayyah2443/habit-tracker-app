import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import { Habit } from '@/types/habit';

const baseHabit: Habit = {
  id: '1',
  userId: 'user1',
  name: 'Drink Water',
  description: '',
  frequency: 'daily',
  createdAt: '2026-01-01',
  completions: [],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2026-04-27');
    expect(result.completions).toContain('2026-04-27');
  });

  it('removes a completion date when the date already exists', () => {
    const habit = { ...baseHabit, completions: ['2026-04-27'] };
    const result = toggleHabitCompletion(habit, '2026-04-27');
    expect(result.completions).not.toContain('2026-04-27');
  });

  it('does not mutate the original habit object', () => {
    const habit = { ...baseHabit, completions: [] };
    toggleHabitCompletion(habit, '2026-04-27');
    expect(habit.completions).toHaveLength(0);
  });

  it('does not return duplicate completion dates', () => {
    const habit = { ...baseHabit, completions: ['2026-04-27'] };
    const result = toggleHabitCompletion(
      { ...habit, completions: ['2026-04-27', '2026-04-27'] },
      '2026-04-28'
    );
    const count = result.completions.filter(
      (d) => d === '2026-04-27'
    ).length;
    expect(count).toBe(1);
  });
});