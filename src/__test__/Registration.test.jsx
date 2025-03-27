/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registration from '../Component/Registration'; 
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

jest.mock('axios');

jest.mock('../../assets/person1.jpeg', () => '/mocked/person1.jpeg');
jest.mock('../../assets/person2.jpeg', () => '/mocked/person2.jpeg');
jest.mock('../../assets/person3.jpeg', () => '/mocked/person3.jpeg');
jest.mock('../../assets/person4.jpeg', () => '/mocked/person4.jpeg');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
  };
});

const MockRegistration = ({ location }) => (
  <BrowserRouter>
    <Registration location={location} navigate={mockNavigate} />
  </BrowserRouter>
);

describe('Registration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    const { useLocation } = require('react-router-dom');
    useLocation.mockReturnValue({ state: null });
    render(<MockRegistration />);
    
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByText(/Department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Salary/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  test('populates form fields in edit mode', () => {
    const mockLocation = {
      state: {
        isEdit: true,
        employee: {
          id: '1',
          name: 'John Doe',
          profileImage: '/Assets/person1.jpeg',
          gender: 'male',
          departments: ['HR'],
          salary: '₹10,000',
          startDate: '01-01-2025',
          notes: 'Test note',
        },
      },
    };
    const { useLocation } = require('react-router-dom');
    useLocation.mockReturnValue(mockLocation);
    render(<MockRegistration location={mockLocation} />);

    expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
    expect(screen.getByRole('radio', { name: 'Male' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'HR' })).toBeChecked();
    expect(screen.getByLabelText(/Select Salary/i)).toHaveValue('₹10,000');
    expect(document.getElementById('day')).toHaveValue('01');
    expect(document.getElementById('month')).toHaveValue('01');
    expect(document.getElementById('year')).toHaveValue('2025');
    expect(screen.getByLabelText(/Notes/i)).toHaveValue('Test note');
  });

  test('submits form successfully when all fields are valid', async () => {
    const { useLocation } = require('react-router-dom');
    useLocation.mockReturnValue({ state: null });
    render(<MockRegistration />);
    
    axios.post.mockResolvedValue({ status: 201 });

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Profile 1' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Male' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'HR' }));
    fireEvent.change(screen.getByLabelText(/Select Salary/i), { target: { value: '₹10,000' } });
    fireEvent.change(document.getElementById('day'), { target: { value: '01' } });
    fireEvent.change(document.getElementById('month'), { target: { value: '01' } });
    fireEvent.change(document.getElementById('year'), { target: { value: '2025' } });
    fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'New joiner' } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to Add the employee?')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/EmpList', {
        name: 'John Doe',
        profileImage: '/Assets/person1.jpeg',
        gender: 'male',
        departments: ['HR'],
        salary: '₹10,000',
        startDate: '01-01-2025',
        notes: 'New joiner',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles API failure on submit gracefully', async () => {
    const { useLocation } = require('react-router-dom');
    useLocation.mockReturnValue({ state: null });
    render(<MockRegistration />);
    
    axios.post.mockRejectedValue(new Error('API Error'));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Profile 1' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Male' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'HR' }));
    fireEvent.change(screen.getByLabelText(/Select Salary/i), { target: { value: '₹10,000' } });
    fireEvent.change(document.getElementById('day'), { target: { value: '01' } });
    fireEvent.change(document.getElementById('month'), { target: { value: '01' } });
    fireEvent.change(document.getElementById('year'), { target: { value: '2025' } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to Add the employee?')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add'));
  });

  test('resets form fields when Reset button is clicked', () => {
    const { useLocation } = require('react-router-dom');
    useLocation.mockReturnValue({ state: null });
    render(<MockRegistration />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Reset Test' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Male' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'HR' }));
    fireEvent.change(document.getElementById('day'), { target: { value: '01' } });
    fireEvent.change(document.getElementById('month'), { target: { value: '01' } });
    fireEvent.change(document.getElementById('year'), { target: { value: '2025' } });

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Reset Test');
    expect(screen.getByRole('radio', { name: 'Male' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'HR' })).toBeChecked();
    expect(document.getElementById('day')).toHaveValue('01');
    expect(document.getElementById('month')).toHaveValue('01');
    expect(document.getElementById('year')).toHaveValue('2025');

    fireEvent.click(screen.getByText(/Reset/i));

    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(screen.getByRole('radio', { name: 'Male' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'HR' })).not.toBeChecked();
    expect(document.getElementById('day')).toHaveValue('');
    expect(document.getElementById('month')).toHaveValue('');
    expect(document.getElementById('year')).toHaveValue('');
  });

  test('navigates to dashboard when Cancel button is clicked', () => {
    const { useLocation } = require('react-router-dom');
    useLocation.mockReturnValue({ state: null });
    render(<MockRegistration />);
    
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});