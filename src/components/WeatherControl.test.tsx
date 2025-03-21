import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WeatherControl from './WeatherControl'
import { useMap } from 'react-leaflet'

// Mock react-leaflet hooks
vi.mock('react-leaflet', () => ({
    useMap: vi.fn().mockReturnValue({
        removeLayer: vi.fn(),
        addLayer: vi.fn()
    })
}))

describe('WeatherControl', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders weather control button', () => {
        render(<WeatherControl />)
        expect(screen.getByLabelText('Weather layers')).toBeInTheDocument()
    })

    it('shows menu when button is clicked', () => {
        render(<WeatherControl />)
        const button = screen.getByLabelText('Weather layers')

        fireEvent.click(button)

        expect(screen.getByText('Precipitation Radar')).toBeInTheDocument()
        expect(screen.getByText('Satellite View')).toBeInTheDocument()
    })

    it('fetches radar timestamp on mount', async () => {
        global.fetch = vi.fn().mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    radar: {
                        past: [1234567890]
                    }
                })
            })
        )

        render(<WeatherControl />)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.rainviewer.com/public/weather-maps.json'
            )
        })
    })

    it('updates layer when option is selected', async () => {
        const map = useMap()

        global.fetch = vi.fn().mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    radar: {
                        past: [1234567890]
                    }
                })
            })
        )

        render(<WeatherControl />)
        const button = screen.getByLabelText('Weather layers')

        fireEvent.click(button)
        fireEvent.click(screen.getByText('Precipitation Radar'))

        await waitFor(() => {
            expect(map.addLayer).toHaveBeenCalled()
        })
    })
}) 