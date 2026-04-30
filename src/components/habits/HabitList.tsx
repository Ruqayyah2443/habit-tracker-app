'use client';

import { useState } from 'react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';
import { toggleHabitCompletion } from '@/lib/habits';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';

type Props = {
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  userId: string;
};

export default function HabitList({ habits, setHabits, userId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const saveHabits = (updated: Habit[]) => {
    const allHabits: Habit[] = JSON.parse(
      localStorage.getItem('habit-tracker-habits') || '[]'
    );
    const otherHabits = allHabits.filter((h) => h.userId !== userId);
    const newAll = [...otherHabits, ...updated];
    localStorage.setItem('habit-tracker-habits', JSON.stringify(newAll));
    setHabits(updated);
  };

  const handleSave = () => {
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error ?? '');
      return;
    }

    if (editingHabit) {
      const updated = habits.map((h) =>
        h.id === editingHabit.id
          ? { ...h, name: validation.value, description }
          : h
      );
      saveHabits(updated);
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        userId,
        name: validation.value,
        description,
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      };
      saveHabits([...habits, newHabit]);
    }

    setShowForm(false);
    setEditingHabit(null);
    setName('');
    setDescription('');
    setNameError('');
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    saveHabits(updated);
    setDeletingId(null);
  };

  const handleToggle = (habit: Habit) => {
    const updated = habits.map((h) =>
      h.id === habit.id ? toggleHabitCompletion(h, today) : h
    );
    saveHabits(updated);
  };

  return (
    <div>
      {!showForm && (
        <button
          data-testid="create-habit-button"
          onClick={() => {
            setEditingHabit(null);
            setName('');
            setDescription('');
            setShowForm(true);
          }}
          className="w-full bg-indigo-600 text-white py-2 rounded font-medium mb-6"
        >
          + Create Habit
        </button>
      )}

      {showForm && (
        <div data-testid="habit-form" className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-bold text-lg mb-4">
            {editingHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                data-testid="habit-name-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g. Drink Water"
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1">{nameError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description (optional)
              </label>
              <input
                data-testid="habit-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g. 8 glasses a day"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency
              </label>
              <select
                data-testid="habit-frequency-select"
                value="daily"
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
                onChange={() => {}}
              >
                <option value="daily">Daily</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                data-testid="habit-save-button"
                onClick={handleSave}
                className="flex-1 bg-indigo-600 text-white py-2 rounded font-medium"
              >
                Save
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingHabit(null); setNameError(''); }}
                className="flex-1 border py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {habits.length === 0 && !showForm && (
        <div data-testid="empty-state" className="text-center py-12 text-gray-500">
          <p className="text-lg">No habits yet</p>
          <p className="text-sm mt-1">Create your first habit above</p>
        </div>
      )}

      {habits.map((habit) => {
        const slug = getHabitSlug(habit.name);
        const streak = calculateCurrentStreak(habit.completions, today);
        const isCompleted = habit.completions.includes(today);

        return (
          <div
            key={habit.id}
            data-testid={`habit-card-${slug}`}
            className={`bg-white rounded-lg shadow p-4 mb-3 border-l-4 ${
              isCompleted ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{habit.name}</h3>
                {habit.description && (
                  <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                )}
                <p
                  data-testid={`habit-streak-${slug}`}
                  className="text-sm text-indigo-600 mt-1 font-medium"
                >
                  🔥 {streak} day streak
                </p>
              </div>

              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  data-testid={`habit-complete-${slug}`}
                  onClick={() => handleToggle(habit)}
                  className={`text-xs px-2 py-1 rounded ${
                    isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓ Done' : 'Mark Done'}
                </button>

                <button
                  data-testid={`habit-edit-${slug}`}
                  onClick={() => handleEdit(habit)}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600"
                >
                  Edit
                </button>

                <button
                  data-testid={`habit-delete-${slug}`}
                  onClick={() => setDeletingId(habit.id)}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {deletingId === habit.id && (
              <div className="mt-3 p-3 bg-red-50 rounded">
                <p className="text-sm text-red-700 mb-2">
                  Are you sure you want to delete this habit?
                </p>
                <div className="flex gap-2">
                  <button
                    data-testid="confirm-delete-button"
                    onClick={() => handleDelete(habit.id)}
                    className="text-xs bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-xs border px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}