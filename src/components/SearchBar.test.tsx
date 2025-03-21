import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchBar from './SearchBar'
import { useMap } from 'react-leaflet'

// Mock react-leaflet hooks
vi.mock('react-leaflet', () => ({
    useMap: vi.fn().mockReturnValue({
        setView: vi.fn()
    })
}))

describe('SearchBar', () => {
    const mockOnSelect = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders search input', () => {
        render(<SearchBar onSelect={mockOnSelect} />)
        expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument()
    })

    it('shows loading indicator when fetching results', async () => {
        global.fetch = vi.fn().mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        )

        render(<SearchBar onSelect={mockOnSelect} />)
        const input = screen.getByPlaceholderText('Search locations...')

        fireEvent.change(input, { target: { value: 'Paris' } })

        await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })
    })

    it('calls onSelect when a result is chosen', async () => {
        const mockResult = {
            display_name: 'Paris, France',
            lat: '48.8566',
            lon: '2.3522',
            place_id: '123',
            type: 'city'
        }

        global.fetch = vi.fn().mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([mockResult])
            })
        )

        render(<SearchBar onSelect={mockOnSelect} />)
        const input = screen.getByPlaceholderText('Search locations...')

        fireEvent.change(input, { target: { value: 'Paris' } })

        await waitFor(() => {
            fireEvent.click(screen.getByText('Paris, France'))
        })

        expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining(mockResult))
    })
}) 