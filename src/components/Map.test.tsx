import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Map from './Map'
import { MapContainer } from 'react-leaflet'

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
    MapContainer: vi.fn(({ children }) => <div data-testid="map-container">{children}</div>),
    TileLayer: vi.fn(() => null),
    useMap: vi.fn().mockReturnValue({
        setView: vi.fn()
    })
}))

describe('Map', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders map container', () => {
        render(<Map />)
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('renders search bar', () => {
        render(<Map />)
        expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument()
    })

    it('renders weather control', () => {
        render(<Map />)
        expect(screen.getByLabelText('Weather layers')).toBeInTheDocument()
    })

    it('renders search history', () => {
        render(<Map />)
        expect(screen.getByLabelText('Search history')).toBeInTheDocument()
    })

    it('passes correct props to MapContainer', () => {
        render(<Map />)
        expect(MapContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                center: [51.505, -0.09],
                zoom: 13,
                style: { height: '100vh', width: '100%' }
            }),
            expect.any(Object)
        )
    })
}) 