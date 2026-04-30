export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
 
  const todayDate = today ?? new Date().toISOString().split('T')[0];

  // Remove duplicate dates
  const unique = [...new Set(completions)];

  // Sort dates oldest to newest
  const sorted = unique.sort();

  if (!sorted.includes(todayDate)) {
    return 0;
  }

  let streak = 0;
  let current = new Date(todayDate);

  while (true) {
    const dateStr = current.toISOString().split('T')[0];

    if (sorted.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}