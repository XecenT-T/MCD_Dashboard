import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

interface User {
    id: string;
    name: string;
    username: string;
    role: 'official' | 'worker' | 'hr';
    department?: string;
    faceDescriptor?: number[];
    isFaceRegistered?: boolean;
    isOnboarded?: boolean;
    preferredLanguage?: 'en' | 'hi';
    profileImage?: string;
    phoneNo?: string;
    email?: string;
    post?: string;
    aadharCardNo?: string;
    dob?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (formData: any) => Promise<User | any>;
    register: (formData: any) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
    reloadUser: () => Promise<void>;
    loginAsHR?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Configure axios defaults
    if (token) {
        api.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete api.defaults.headers.common['x-auth-token'];
    }

    const loadUser = async () => {
        if (localStorage.getItem('token')) {
            api.defaults.headers.common['x-auth-token'] = localStorage.getItem('token');
        }
        try {
            const res = await api.get('/api/auth/user');
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common['x-auth-token'];
        }
    };

    useEffect(() => {
        if (token) loadUser();
    }, []);

    const login = async (formData: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Login failed');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loginAsHR = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockHR: User = {
                id: 'mock-hr-1',
                name: 'Demo Admin',
                username: 'admin',
                role: 'official', // acts as official/admin
                department: 'Administration',
                isFaceRegistered: true,
                isOnboarded: true,
                preferredLanguage: 'en'
            };
            setUser(mockHR);
            setLoading(false);
        }, 800);
    };

    const register = async (formData: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Registration failed');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['x-auth-token'];
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, error, clearError, reloadUser: loadUser, loginAsHR }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
