import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CharacterDetail from './components/CharacterDetail';
import Items from './components/Items';
import Bestiary from './components/Bestiary';
import Quests from './components/Quests';
import Location from './components/Location';
import NPCs from "./components/NPCs";
import Spells from "./components/Spells";
import CharacterManager from "./components/Character";
import Login from "./components/Login";
import { auth } from './api';

function ProtectedRoute({ children, isAuthenticated }) {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
    const [user, setUser] = useState(auth.getUser());

    useEffect(() => {
        const handleLogout = () => {
            setIsAuthenticated(false);
            setUser(null);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        setUser(auth.getUser());
    };

    const handleLogout = () => {
        auth.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <div className="flex h-screen">
            <Sidebar user={user} onLogout={handleLogout} />
            <main className="flex-1 p-4 overflow-auto">
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/characters" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CharacterManager />
                        </ProtectedRoute>
                    } />
                    <Route path="/characters/:id" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <CharacterDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/locations" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Location />
                        </ProtectedRoute>
                    } />
                    <Route path="/items" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Items />
                        </ProtectedRoute>
                    } />
                    <Route path="/bestiary" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Bestiary />
                        </ProtectedRoute>
                    } />
                    <Route path="/quests" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Quests />
                        </ProtectedRoute>
                    } />
                    <Route path="/npcs" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <NPCs />
                        </ProtectedRoute>
                    } />
                    <Route path="/spells" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Spells />
                        </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}
