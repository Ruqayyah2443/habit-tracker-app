'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@/types/auth';
import {Habit} from '@/types/habit';
import HabitList from '@/components/habits/HabitList';
export default function DashboardPage() {

  const [habits, setHabits] = useState<Habit[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(()=>{
    const storedUsers = localStorage.getItem('habit-tracker-session');

    if(!storedUsers) {
      router.push('/login');
      return;
    }

     const parsedSession: Session = JSON.parse(storedUsers)
      setSession(parsedSession)

    const allHabits: Habit[] = JSON.parse( localStorage.getItem('habit-tracker-habits') || '[]' );

    const userHabits = allHabits.filter(habit => habit.userId === parsedSession.userId);

    setHabits(userHabits);
    setLoading(false);
  },[router])

 

  if (loading) {
     return ( 
     <div className="min-h-screen flex items-center justify-center"> Loading... </div> ); 
  }

  return (
    <div data-testid="dashboard-page" className='min-h-screen bg-gray-50'>
      <header className="bg-white shadow px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Habit Tracker</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.email}</span>

          <button
            data-testid="auth-logout"
            onClick={() => {
              localStorage.removeItem('habit-tracker-session');
              router.push('/login');
            }}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8"> <HabitList habits={habits} setHabits={setHabits} userId={session?.userId ?? ''} /> </main>


    </div>
  );
}