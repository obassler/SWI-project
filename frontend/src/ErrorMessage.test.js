import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './components/ErrorMessage';

describe('ErrorMessage component', () => {
    it('renders default error message if no message is provided', () => {
        render(<ErrorMessage />);
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('renders custom error message if message is provided', () => {
        render(<ErrorMessage message="Something went wrong!" />);
        expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });

    it('renders Retry button if onRetry is provided', () => {
        render(<ErrorMessage message="Oops" onRetry={() => {}} />);
        expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('calls onRetry when Retry button is clicked', () => {
        const retryMock = jest.fn();
        render(<ErrorMessage message="Oops" onRetry={retryMock} />);
        fireEvent.click(screen.getByText('Retry'));
        expect(retryMock).toHaveBeenCalledTimes(1);
    });
});