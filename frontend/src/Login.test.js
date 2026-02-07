import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './components/Login';
import { auth } from './api';

jest.mock('./api', () => ({
    auth: {
        login: jest.fn(),
        register: jest.fn(),
    }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Login component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form by default', () => {
        render(
            <MemoryRouter>
                <Login onLogin={() => {}} />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    it('switches to register form when clicking register link', () => {
        render(
            <MemoryRouter>
                <Login onLogin={() => {}} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Don't have an account? Register"));

        expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('calls auth.login and onLogin on successful login', async () => {
        const onLogin = jest.fn();
        auth.login.mockResolvedValue({ token: 'test-token', username: 'testuser', role: 'USER' });

        render(
            <MemoryRouter>
                <Login onLogin={onLogin} />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(auth.login).toHaveBeenCalledWith('testuser', 'password123');
            expect(onLogin).toHaveBeenCalled();
        });
    });

    it('displays error message on login failure', async () => {
        auth.login.mockRejectedValue({ data: { error: 'Invalid credentials' } });

        render(
            <MemoryRouter>
                <Login onLogin={() => {}} />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('calls auth.register on successful registration', async () => {
        auth.register.mockResolvedValue({ message: 'User registered successfully' });
        window.alert = jest.fn();

        render(
            <MemoryRouter>
                <Login onLogin={() => {}} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Don't have an account? Register"));

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
            expect(auth.register).toHaveBeenCalledWith('newuser', 'new@example.com', 'password123');
        });
    });

    it('disables button while loading', async () => {
        auth.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

        render(
            <MemoryRouter>
                <Login onLogin={() => {}} />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });
});
