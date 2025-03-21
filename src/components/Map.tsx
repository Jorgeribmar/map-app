import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchBar from './SearchBar';
import MapStyleControl, { MapStyle } from './MapStyleControl';
import SearchHistory from './SearchHistory';
import { SearchResult } from '../types';
import { Box, IconButton, Alert, Snackbar } from '@mui/material';
import { History } from '@mui/icons-material';
import WeatherControl from './WeatherControl';
import ErrorBoundary from './ErrorBoundary';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define map styles
const mapStyles = {
    standard: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    },
    terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
    },
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
};

// Define colored markers
const markerColors = ['blue', 'red', 'green', 'orange', 'purple'];
const coloredIcons = markerColors.map(color => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}));

// Custom hook to handle map updates
const LocationMarker = () => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const map = useMap();

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setPosition(pos);
                    map.setView(pos, 13);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Fallback to London if geolocation fails
                    const defaultPos: [number, number] = [51.505, -0.09];
                    setPosition(defaultPos);
                    map.setView(defaultPos, 13);
                }
            );
        }
    }, [map]);

    return position ? (
        <Marker position={position}>
            <Popup>
                Your Location
            </Popup>
        </Marker>
    ) : null;
};

// Custom hook to handle map centering
const MapController = ({ selectedLocation }: { selectedLocation: SearchResult | null }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedLocation) {
            const lat = parseFloat(selectedLocation.lat);
            const lon = parseFloat(selectedLocation.lon);
            map.setView([lat, lon], 15);
        }
    }, [map, selectedLocation]);

    return null;
};

const Map = () => {
    const defaultPosition: [number, number] = [51.505, -0.09];
    const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
    const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
    const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleSearchSelect = (result: SearchResult | null) => {
        if (result) {
            setSelectedLocation(result);
            setRecentSearches(prev => {
                const newResult = { ...result, timestamp: Date.now() };
                const filtered = prev.filter(item => item.place_id !== result.place_id);
                return [newResult, ...filtered].slice(0, 10);
            });
        }
    };

    const handleSearchClear = (result: SearchResult) => {
        setRecentSearches(prev => prev.filter(item => item.place_id !== result.place_id));
        if (selectedLocation?.place_id === result.place_id) {
            setSelectedLocation(null);
        }
    };

    const handleHistorySelect = (result: SearchResult) => {
        setSelectedLocation(result);
    };

    const toggleHistory = () => {
        setIsHistoryOpen(prev => !prev);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <ErrorBoundary>
                    <MapContainer
                        center={defaultPosition}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution={mapStyles[mapStyle].attribution}
                            url={mapStyles[mapStyle].url}
                        />
                        <ErrorBoundary>
                            <LocationMarker />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <SearchBar onSelect={handleSearchSelect} />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <MapStyleControl style={mapStyle} onStyleChange={setMapStyle} />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <WeatherControl />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <MapController selectedLocation={selectedLocation} />
                        </ErrorBoundary>
                        {recentSearches.map((search, index) => (
                            <ErrorBoundary key={`error-boundary-${search.place_id}-${search.timestamp}`}>
                                <Marker
                                    key={`${search.place_id}-${search.timestamp}`}
                                    position={[parseFloat(search.lat), parseFloat(search.lon)]}
                                    icon={coloredIcons[index % coloredIcons.length]}
                                >
                                    <Popup>
                                        <div>
                                            <strong>{search.display_name}</strong>
                                            {search.type && (
                                                <>
                                                    <br />
                                                    <small>Type: {search.type}</small>
                                                </>
                                            )}
                                            {search.address?.city && (
                                                <>
                                                    <br />
                                                    <small>City: {search.address.city}</small>
                                                </>
                                            )}
                                            <br />
                                            <small>Searched {search.timestamp ? new Date(search.timestamp).toLocaleString() : ''}</small>
                                        </div>
                                    </Popup>
                                </Marker>
                            </ErrorBoundary>
                        ))}
                    </MapContainer>
                </ErrorBoundary>
                <IconButton
                    onClick={toggleHistory}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'white',
                        '&:hover': {
                            backgroundColor: '#f5f5f5'
                        },
                        zIndex: 1000,
                    }}
                >
                    <History />
                </IconButton>
            </Box>
            <ErrorBoundary>
                <SearchHistory
                    searches={recentSearches}
                    onSelect={handleHistorySelect}
                    onClear={handleSearchClear}
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                />
            </ErrorBoundary>
        </Box>
    );
};

export default Map; 