import { auth, api } from './api';

global.fetch = jest.fn();

describe('auth module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('login', () => {
        it('stores token and user data on successful login', async () => {
            const mockResponse = {
                token: 'test-jwt-token',
                username: 'testuser',
                role: 'USER'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                text: () => Promise.resolve(JSON.stringify(mockResponse))
            });

            await auth.login('testuser', 'password123');

            expect(localStorage.getItem('token')).toBe('test-jwt-token');
            expect(JSON.parse(localStorage.getItem('user'))).toEqual({
                username: 'testuser',
                role: 'USER'
            });
        });

        it('throws error on failed login', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                headers: {
                    get: () => 'application/json'
                },
                json: () => Promise.resolve({ error: 'Invalid credentials' })
            });

            await expect(auth.login('testuser', 'wrongpassword'))
                .rejects.toThrow('Invalid credentials');
        });
    });

    describe('logout', () => {
        it('clears token and user data', () => {
            localStorage.setItem('token', 'test-token');
            localStorage.setItem('user', JSON.stringify({ username: 'test' }));

            auth.logout();

            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('user')).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('returns true when token exists', () => {
            localStorage.setItem('token', 'test-token');
            expect(auth.isAuthenticated()).toBe(true);
        });

        it('returns false when token does not exist', () => {
            expect(auth.isAuthenticated()).toBe(false);
        });
    });

    describe('getUser', () => {
        it('returns user data when stored', () => {
            const user = { username: 'testuser', role: 'USER' };
            localStorage.setItem('user', JSON.stringify(user));

            expect(auth.getUser()).toEqual(user);
        });

        it('returns null when no user is stored', () => {
            expect(auth.getUser()).toBeNull();
        });
    });

    describe('register', () => {
        it('sends registration request', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: {
                    get: () => 'application/json'
                },
                text: () => Promise.resolve(JSON.stringify({ message: 'User registered successfully' }))
            });

            await auth.register('newuser', 'new@example.com', 'password123');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/register'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        username: 'newuser',
                        email: 'new@example.com',
                        password: 'password123'
                    })
                })
            );
        });
    });
});

describe('api module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'test-token');
    });

    it('includes authorization header when token is present', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            headers: {
                get: () => 'application/json'
            },
            text: () => Promise.resolve(JSON.stringify([]))
        });

        await api.getCharacters();

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-token'
                })
            })
        );
    });

    it('handles 401 response by clearing auth data', async () => {
        localStorage.setItem('token', 'expired-token');
        localStorage.setItem('user', JSON.stringify({ username: 'test' }));

        const logoutHandler = jest.fn();
        window.addEventListener('auth:logout', logoutHandler);

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {
                get: () => 'application/json'
            },
            json: () => Promise.resolve({ error: 'Unauthorized' })
        });

        await expect(api.getCharacters()).rejects.toThrow();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();

        window.removeEventListener('auth:logout', logoutHandler);
    });
});
