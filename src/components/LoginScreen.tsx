import React, { useState } from 'react';
import { Bot, LogIn } from 'lucide-react';
import { authenticateUser } from '../services/db';
import type { User } from '../types';

interface LoginScreenProps {
    onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = authenticateUser(username, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid username or password.');
            setPassword('');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Bot size={40} className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">SHRM Guideline</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please sign in to continue</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="relative block w-full px-3 py-3 text-sm placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input" className="sr-only">Password</label>
                            <input
                                id="password-input"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-3 text-sm placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg appearance-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-center text-red-500">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <LogIn className="w-5 h-5 text-blue-300 group-hover:text-blue-200" />
                            </span>
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
