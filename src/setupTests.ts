import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Leaflet since it requires a browser environment
vi.mock('leaflet', () => ({
    default: {
        map: vi.fn(),
        tileLayer: vi.fn().mockReturnValue({
            addTo: vi.fn(),
            setOpacity: vi.fn(),
            remove: vi.fn()
        }),
        marker: vi.fn().mockReturnValue({
            addTo: vi.fn(),
            setLatLng: vi.fn(),
            remove: vi.fn()
        }),
        Icon: {
            Default: {
                prototype: {},
                mergeOptions: vi.fn()
            }
        }
    }
})) 