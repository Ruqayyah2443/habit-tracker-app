import { Habit } from '@/types/habit';

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  
  const alreadyCompleted = habit.completions.includes(date);

  let newCompletions: string[];

  if (alreadyCompleted) {

    newCompletions = habit.completions.filter((d) => d !== date);
  } else {
    newCompletions = [...new Set([...habit.completions, date])];
  }

  return {
    ...habit,
    completions: newCompletions,
  };
}