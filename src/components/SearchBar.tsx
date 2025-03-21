import { useState, useEffect } from 'react';
import {
    TextField,
    Autocomplete,
    Box,
    Chip,
    Typography,
    Paper,
    InputAdornment,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { Search, Place, Restaurant, Park, Business, School, Hotel } from '@mui/icons-material';
import { useMap } from 'react-leaflet';
import { SearchResult } from '../types';
import ErrorBoundary from './ErrorBoundary';
import { performanceMonitor } from '../utils/performance';

interface SearchBarProps {
    onSelect: (result: SearchResult | null) => void;
}

const categories = [
    { label: 'Restaurants', value: 'restaurant', icon: <Restaurant /> },
    { label: 'Parks', value: 'park', icon: <Park /> },
    { label: 'Businesses', value: 'commercial', icon: <Business /> },
    { label: 'Education', value: 'education', icon: <School /> },
    { label: 'Hotels', value: 'accommodation', icon: <Hotel /> }
];

// Calculate distance between two points using Haversine formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Create a bounding box around a point
const createViewBox = (lat: number, lon: number, radiusKm: number = 5) => {
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
const prepareSearchQuery = (input: string): string => {
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

const SearchBar = ({ onSelect }: SearchBarProps) => {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState<string>('');
    const map = useMap();

    // Get user's location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    setLocationError('');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    let errorMessage = 'Unable to get your location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access was denied. Some features may be limited.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable. Please try again.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.';
                            break;
                    }
                    setLocationError(errorMessage);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser. Some features may be limited.');
        }
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!input.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            performanceMonitor.startMark('searchOperation');
            try {
                const searchQuery = prepareSearchQuery(input);

                performanceMonitor.startMark('apiRequest');
                const searchParams: Record<string, string> = {
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

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?${params}`
                );
                const data = await response.json();
                performanceMonitor.endMark('apiRequest', {
                    query: searchQuery,
                    resultCount: data.length
                });

                performanceMonitor.startMark('resultProcessing');
                // Score results based on relevance
                const scoredResults = data.map((item: any) => {
                    const result: SearchResult = {
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
                        const distance = getDistance(
                            userLocation.lat,
                            userLocation.lon,
                            parseFloat(item.lat),
                            parseFloat(item.lon)
                        );
                        if (distance < 1) matchScore += 5;
                        else if (distance < 5) matchScore += 3;
                        else if (distance < 10) matchScore += 1;
                    }

                    return { ...result, matchScore };
                });

                // Sort by match score and then by distance
                const sortedResults = scoredResults.sort((a: any, b: any) => {
                    if (b.matchScore !== a.matchScore) {
                        return b.matchScore - a.matchScore;
                    }

                    if (userLocation) {
                        const distanceA = getDistance(
                            userLocation.lat,
                            userLocation.lon,
                            parseFloat(a.lat),
                            parseFloat(a.lon)
                        );
                        const distanceB = getDistance(
                            userLocation.lat,
                            userLocation.lon,
                            parseFloat(b.lat),
                            parseFloat(b.lon)
                        );
                        return distanceA - distanceB;
                    }

                    return (b.importance || 0) - (a.importance || 0);
                });

                performanceMonitor.endMark('resultProcessing', {
                    processedResults: scoredResults.length,
                    finalResults: sortedResults.slice(0, 10).length
                });

                setResults(sortedResults.slice(0, 10));
            } catch (error) {
                console.error('Error fetching search results:', error);
                setResults([]);
            } finally {
                setLoading(false);
                performanceMonitor.endMark('searchOperation', {
                    query: input,
                    success: results.length > 0
                });
                performanceMonitor.logMetrics();
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [input, selectedCategories, userLocation]);

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const formatDistance = (lat: string, lon: string): string => {
        if (!userLocation) return '';
        const distance = getDistance(
            userLocation.lat,
            userLocation.lon,
            parseFloat(lat),
            parseFloat(lon)
        );
        return distance < 1
            ? `${Math.round(distance * 1000)}m away`
            : `${distance.toFixed(1)}km away`;
    };

    const handleSelect = (value: SearchResult | null) => {
        if (value) {
            const lat = parseFloat(value.lat);
            const lon = parseFloat(value.lon);
            map.setView([lat, lon], 15); // Zoom level 15 for better detail
        }
        onSelect(value);
        setInput('');
    };

    return (
        <>
            <Box
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: 50,
                    zIndex: 1000,
                    width: '400px',
                    backgroundColor: 'white',
                    borderRadius: 1,
                    boxShadow: 3
                }}
            >
                <ErrorBoundary>
                    <Autocomplete
                        freeSolo
                        options={results}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.display_name
                        }
                        filterOptions={(x) => x}
                        onChange={(_, value) => handleSelect(value as SearchResult | null)}
                        onInputChange={(_, value) => setInput(value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search locations..."
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <>
                                            {loading && <CircularProgress size={20} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Place sx={{ mr: 1 }} />
                                <Box>
                                    <Typography variant="body1">
                                        {option.display_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {option.type}
                                        {option.address?.city && ` · ${option.address.city}`}
                                        {option.address?.country && ` · ${option.address.country}`}
                                        {userLocation && ` · ${formatDistance(option.lat, option.lon)}`}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    />
                </ErrorBoundary>
                <ErrorBoundary>
                    <Paper sx={{ mt: 1, p: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {categories.map(category => (
                            <Chip
                                key={category.value}
                                icon={category.icon}
                                label={category.label}
                                onClick={() => handleCategoryToggle(category.value)}
                                color={selectedCategories.includes(category.value) ? 'primary' : 'default'}
                                variant={selectedCategories.includes(category.value) ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Paper>
                </ErrorBoundary>
            </Box>
            <ErrorBoundary>
                <Snackbar
                    open={!!locationError}
                    autoHideDuration={6000}
                    onClose={() => setLocationError('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert onClose={() => setLocationError('')} severity="warning">
                        {locationError}
                    </Alert>
                </Snackbar>
            </ErrorBoundary>
        </>
    );
};

export default SearchBar; 