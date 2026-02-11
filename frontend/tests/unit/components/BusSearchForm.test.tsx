import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusSearchForm } from '../../../src/components/BusSearchForm';

describe('BusSearchForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnChange = vi.fn();

  it('should render input field with placeholder', () => {
    render(
      <BusSearchForm
        busStopName=""
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter bus stop name/i);
    expect(input).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(
      <BusSearchForm
        busStopName=""
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it('should display input value', () => {
    render(
      <BusSearchForm
        busStopName="T-Centralen"
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue('T-Centralen');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();

    render(
      <BusSearchForm
        busStopName=""
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter bus stop name/i);
    await user.type(input, 'T');

    expect(mockOnChange).toHaveBeenCalledWith('T');
  });

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup();

    render(
      <BusSearchForm
        busStopName="T-Centralen"
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button', { name: /search/i });
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should call onSubmit when pressing Enter', async () => {
    const user = userEvent.setup();

    render(
      <BusSearchForm
        busStopName="T-Centralen"
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText(/Enter bus stop name/i);
    await user.type(input, '{Enter}');

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should show "Searching..." when loading', () => {
    render(
      <BusSearchForm
        busStopName="T-Centralen"
        loading={true}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should disable button when loading', () => {
    render(
      <BusSearchForm
        busStopName="T-Centralen"
        loading={true}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not disable button when not loading', () => {
    render(
      <BusSearchForm
        busStopName="T-Centralen"
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(
      <BusSearchForm
        busStopName=""
        loading={false}
        onSubmit={mockOnSubmit}
        onChange={mockOnChange}
      />
    );

    expect(container.querySelector('.bus-form')).toBeInTheDocument();
    expect(container.querySelector('.input-field')).toBeInTheDocument();
    expect(container.querySelector('.btn')).toBeInTheDocument();
    expect(container.querySelector('.btn-primary')).toBeInTheDocument();
  });
});
