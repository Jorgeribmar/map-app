import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchBar from './SearchBar';
import MapStyleControl from './MapStyleControl';
import SearchHistory from './SearchHistory';
import { Box, IconButton } from '@mui/material';
import { History } from '@mui/icons-material';
import WeatherControl from './WeatherControl';
// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
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
    const [position, setPosition] = useState(null);
    const map = useMap();
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = [position.coords.latitude, position.coords.longitude];
                setPosition(pos);
                map.setView(pos, 13);
            }, (error) => {
                console.error('Error getting location:', error);
                // Fallback to London if geolocation fails
                const defaultPos = [51.505, -0.09];
                setPosition(defaultPos);
                map.setView(defaultPos, 13);
            });
        }
    }, [map]);
    return position ? (_jsx(Marker, { position: position, children: _jsx(Popup, { children: "Your Location" }) })) : null;
};
// Custom hook to handle map centering
const MapController = ({ selectedLocation }) => {
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
    const defaultPosition = [51.505, -0.09];
    const [recentSearches, setRecentSearches] = useState([]);
    const [mapStyle, setMapStyle] = useState('standard');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const handleSearchSelect = (result) => {
        if (result) {
            setSelectedLocation(result);
            setRecentSearches(prev => {
                const newResult = { ...result, timestamp: Date.now() };
                const filtered = prev.filter(item => item.place_id !== result.place_id);
                return [newResult, ...filtered].slice(0, 10);
            });
        }
    };
    const handleSearchClear = (result) => {
        setRecentSearches(prev => prev.filter(item => item.place_id !== result.place_id));
        if (selectedLocation?.place_id === result.place_id) {
            setSelectedLocation(null);
        }
    };
    const handleHistorySelect = (result) => {
        setSelectedLocation(result);
    };
    const toggleHistory = () => {
        setIsHistoryOpen(prev => !prev);
    };
    return (_jsxs(Box, { sx: { display: 'flex', height: '100vh', width: '100%' }, children: [_jsxs(Box, { sx: { flexGrow: 1, position: 'relative' }, children: [_jsxs(MapContainer, { center: defaultPosition, zoom: 13, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: mapStyles[mapStyle].attribution, url: mapStyles[mapStyle].url }), _jsx(LocationMarker, {}), _jsx(SearchBar, { onSelect: handleSearchSelect }), _jsx(MapStyleControl, { style: mapStyle, onStyleChange: setMapStyle }), _jsx(WeatherControl, {}), _jsx(MapController, { selectedLocation: selectedLocation }), recentSearches.map((search, index) => (_jsx(Marker, { position: [parseFloat(search.lat), parseFloat(search.lon)], icon: coloredIcons[index % coloredIcons.length], children: _jsx(Popup, { children: _jsxs("div", { children: [_jsx("strong", { children: search.display_name }), search.type && (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: ["Type: ", search.type] })] })), search.address?.city && (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsxs("small", { children: ["City: ", search.address.city] })] })), _jsx("br", {}), _jsxs("small", { children: ["Searched ", search.timestamp ? new Date(search.timestamp).toLocaleString() : ''] })] }) }) }, `${search.place_id}-${search.timestamp}`)))] }), _jsx(IconButton, { onClick: toggleHistory, sx: {
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: 'white',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            },
                            zIndex: 1000,
                        }, children: _jsx(History, {}) })] }), _jsx(SearchHistory, { searches: recentSearches, onSelect: handleHistorySelect, onClear: handleSearchClear, isOpen: isHistoryOpen, onClose: () => setIsHistoryOpen(false) })] }));
};
export default Map;
