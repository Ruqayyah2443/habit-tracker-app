'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@/types/auth';

export default function LoginForm() {

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

        const foundUser = users.find(
            (user: User) => user.email === email && user.password === password
        )
        if(!foundUser) {
            setError('Invalid email or password');
            return;
        }

        const session: Session ={ 
            userId: foundUser.id, 
            email: foundUser.email}
        localStorage.setItem('habit-tracker-session', JSON.stringify(session))
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
                        data-testid="auth-login-email"
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
                        data-testid="auth-login-password"
                        onChange={(e)=> setPassword(e.target.value)}
                        required
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    data-testid="auth-login-submit"
                    className="w-full bg-indigo-600 text-white mt-3 py-2 px-4 rounded hover:bg-indigo-700 transition-colors "
                >
                    Login 
                </button>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Register here</a>
                </p>
           
            </form>
            
    )

    
        

}
