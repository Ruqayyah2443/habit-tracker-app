'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@/types/auth';
import Link from 'next/link';

export default function SignupForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit =  (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let users: User[] = []

        try{
            users = JSON.parse(localStorage.getItem('habit-tracker-users') || '[]')
        } catch {
            users = [];
        }

       const normalizedEmail = email.trim().toLowerCase();


       if (!email.trim()) {
        setError('User already exists');
        return;
        }

        const existingUser = users.find(
            (user: User) => user.email === normalizedEmail
        )
        if(existingUser){
            setError('User already exists. Please login instead.');
            return;
        }
        const newUser: User = {
            id: crypto.randomUUID(),
            email: normalizedEmail,
            password: password,
            createdAt: new Date().toISOString(),
        }

        const updatedUsers = [...users, newUser];
        localStorage.setItem('habit-tracker-users', JSON.stringify(updatedUsers));

        const session: Session = {
            userId: newUser.id,
            email: newUser.email,
        }
        localStorage.setItem('habit-tracker-session', JSON.stringify(session));
        router.replace('/dashboard');
    }
    

    return(
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            {error && (
                <div className='bg-red-50 text-red-600 px-4 py-2 rounded text-sm'>
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    data-testid="auth-signup-email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1 mt-3">Password</label>
                    <input type="password"
                        id="password"
                        value={password}
                        data-testid="auth-signup-password"
                        onChange={(e)=> setPassword(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    data-testid="auth-signup-submit"
                    className="w-full mt-3 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                >
                    Sign Up
                </button>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account? <Link href="/login" className="text-blue-500 hover:underline">Register here</Link>
                </p>
           
            </form>
            
    )

    
        

}
