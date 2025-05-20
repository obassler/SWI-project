import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
