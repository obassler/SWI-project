import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';

describe('Sidebar component', () => {
    it('renders all navigation links', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        );

        const expectedLabels = [
            'Dashboard',
            'Locations',
            'Items',
            'Bestiary',
            'Quests',
            'NPCs',
            'Spells',
            'Characters',
        ];

        expectedLabels.forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('applies active class to the active link', () => {
        render(
            <MemoryRouter initialEntries={['/items']}>
                <Sidebar />
            </MemoryRouter>
        );

        const activeLink = screen.getByText('Items');
        expect(activeLink).toHaveClass('bg-yellow-700');

        const otherLinks = ['Dashboard', 'Locations', 'Bestiary', 'Quests', 'NPCs', 'Spells', 'Characters'];
        otherLinks.forEach(label => {
            const link = screen.getByText(label);
            expect(link).not.toHaveClass('bg-yellow-700');
        });
    });

    it('displays username when user is provided', () => {
        const user = { username: 'testuser', role: 'USER' };

        render(
            <MemoryRouter>
                <Sidebar user={user} onLogout={() => {}} />
            </MemoryRouter>
        );

        expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('displays logout button when user is provided', () => {
        const user = { username: 'testuser', role: 'USER' };

        render(
            <MemoryRouter>
                <Sidebar user={user} onLogout={() => {}} />
            </MemoryRouter>
        );

        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('calls onLogout when logout button is clicked', () => {
        const user = { username: 'testuser', role: 'USER' };
        const onLogout = jest.fn();

        render(
            <MemoryRouter>
                <Sidebar user={user} onLogout={onLogout} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Logout'));
        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it('does not display user section when user is not provided', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        );

        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
});
