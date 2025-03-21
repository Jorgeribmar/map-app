import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { TextField, Autocomplete, Box, Chip, Typography, Paper, InputAdornment, CircularProgress } from '@mui/material';
import { Search, Place, Restaurant, Park, Business, School, Hotel } from '@mui/icons-material';
import { useMap } from 'react-leaflet';
const categories = [
    { label: 'Restaurants', value: 'restaurant', icon: _jsx(Restaurant, {}) },
    { label: 'Parks', value: 'park', icon: _jsx(Park, {}) },
    { label: 'Businesses', value: 'commercial', icon: _jsx(Business, {}) },
    { label: 'Education', value: 'education', icon: _jsx(School, {}) },
    { label: 'Hotels', value: 'accommodation', icon: _jsx(Hotel, {}) }
];
// Calculate distance between two points using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
// Create a bounding box around a point
const createViewBox = (lat, lon, radiusKm = 5) => {
    // Rough approximation: 1 degree = 111km
    const degreesDelta = radiusKm / 111;
    return {
        north: lat + degreesDelta,
        south: lat - degreesDelta,
        east: lon + degreesDelta,
        west: lon - degreesDelta
    };
};
// Prepare search query for more flexible matching
const prepareSearchQuery = (input) => {
    // Remove extra spaces and normalize
    const normalizedInput = input.trim().toLowerCase();
    // For exact phrases (like full addresses), try to keep them together
    if (normalizedInput.includes('boulevard') ||
        normalizedInput.includes('avenue') ||
        normalizedInput.includes('rue') ||
        normalizedInput.includes('place')) {
        return normalizedInput;
    }
    // For other searches, split into words and add wildcards
    const words = normalizedInput.split(/\s+/).filter(Boolean);
    return words.join(' ');
};
const SearchBar = ({ onSelect }) => {
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const map = useMap();
    // Get user's location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            }, (error) => {
                console.error('Error getting location:', error);
            });
        }
    }, []);
    useEffect(() => {
        const fetchResults = async () => {
            if (!input.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const searchQuery = prepareSearchQuery(input);
                const searchParams = {
                    q: searchQuery,
                    format: 'json',
                    addressdetails: '1',
                    limit: '50',
                    dedupe: '1',
                    'accept-language': 'fr',
                    countrycodes: 'fr'
                };
                if (userLocation) {
                    searchParams.viewbox = `${userLocation.lon - 0.1},${userLocation.lat + 0.1},${userLocation.lon + 0.1},${userLocation.lat - 0.1}`;
                    searchParams.bounded = '0';
                }
                const params = new URLSearchParams(searchParams);
                const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
                const data = await response.json();
                // Score results based on relevance
                const scoredResults = data.map((item) => {
                    const result = {
                        display_name: item.display_name,
                        lat: item.lat,
                        lon: item.lon,
                        type: item.type,
                        category: item.category,
                        address: item.address,
                        importance: item.importance,
                        place_id: item.place_id
                    };
                    // Calculate match score
                    let matchScore = 0;
                    const displayName = item.display_name.toLowerCase();
                    const searchTerms = input.toLowerCase().split(/\s+/);
                    // Exact phrase match gets highest score
                    if (displayName.includes(input.toLowerCase())) {
                        matchScore += 10;
                    }
                    // Individual word matches
                    searchTerms.forEach(term => {
                        if (displayName.includes(term)) {
                            matchScore += 1;
                        }
                    });
                    // Boost score for nearby results
                    if (userLocation) {
                        const distance = getDistance(userLocation.lat, userLocation.lon, parseFloat(item.lat), parseFloat(item.lon));
                        if (distance < 1)
                            matchScore += 5;
                        else if (distance < 5)
                            matchScore += 3;
                        else if (distance < 10)
                            matchScore += 1;
                    }
                    return { ...result, matchScore };
                });
                // Sort by match score and then by distance
                const sortedResults = scoredResults.sort((a, b) => {
                    if (b.matchScore !== a.matchScore) {
                        return b.matchScore - a.matchScore;
                    }
                    if (userLocation) {
                        const distanceA = getDistance(userLocation.lat, userLocation.lon, parseFloat(a.lat), parseFloat(a.lon));
                        const distanceB = getDistance(userLocation.lat, userLocation.lon, parseFloat(b.lat), parseFloat(b.lon));
                        return distanceA - distanceB;
                    }
                    return (b.importance || 0) - (a.importance || 0);
                });
                setResults(sortedResults.slice(0, 10));
            }
            catch (error) {
                console.error('Error fetching search results:', error);
                setResults([]);
            }
            finally {
                setLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [input, selectedCategories, userLocation]);
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => prev.includes(category)
            ? prev.filter(c => c !== category)
            : [...prev, category]);
    };
    const formatDistance = (lat, lon) => {
        if (!userLocation)
            return '';
        const distance = getDistance(userLocation.lat, userLocation.lon, parseFloat(lat), parseFloat(lon));
        return distance < 1
            ? `${Math.round(distance * 1000)}m away`
            : `${distance.toFixed(1)}km away`;
    };
    const handleSelect = (value) => {
        if (value) {
            const lat = parseFloat(value.lat);
            const lon = parseFloat(value.lon);
            map.setView([lat, lon], 15); // Zoom level 15 for better detail
        }
        onSelect(value);
        setInput('');
    };
    return (_jsxs(Box, { sx: {
            position: 'absolute',
            top: 10,
            left: 50,
            zIndex: 1000,
            width: '400px',
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 3
        }, children: [_jsx(Autocomplete, { freeSolo: true, options: results, getOptionLabel: (option) => typeof option === 'string' ? option : option.display_name, filterOptions: (x) => x, onChange: (_, value) => handleSelect(value), onInputChange: (_, value) => setInput(value), renderInput: (params) => (_jsx(TextField, { ...params, placeholder: "Search locations...", variant: "outlined", InputProps: {
                        ...params.InputProps,
                        startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Search, {}) })),
                        endAdornment: (_jsxs(_Fragment, { children: [loading && _jsx(CircularProgress, { size: 20 }), params.InputProps.endAdornment] }))
                    } })), renderOption: (props, option) => (_jsxs(Box, { component: "li", ...props, children: [_jsx(Place, { sx: { mr: 1 } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body1", children: option.display_name }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: [option.type, option.address?.city && ` · ${option.address.city}`, option.address?.country && ` · ${option.address.country}`, userLocation && ` · ${formatDistance(option.lat, option.lon)}`] })] })] })) }), _jsx(Paper, { sx: { mt: 1, p: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }, children: categories.map(category => (_jsx(Chip, { icon: category.icon, label: category.label, onClick: () => handleCategoryToggle(category.value), color: selectedCategories.includes(category.value) ? 'primary' : 'default', variant: selectedCategories.includes(category.value) ? 'filled' : 'outlined' }, category.value))) })] }));
};
export default SearchBar;
