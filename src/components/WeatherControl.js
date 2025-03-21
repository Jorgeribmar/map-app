import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, Slider, Stack, Typography, CircularProgress, ButtonGroup, LinearProgress } from '@mui/material';
import { WbSunny, Cloud, Opacity, PlayArrow, Pause, SkipNext, SkipPrevious, Speed, Loop, Palette } from '@mui/icons-material';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
const FRAME_TRANSITION_TIME = 25;
const FRAME_CHANGE_INTERVAL = 300;
const OPACITY_STEP = 0.25;
const TILE_SIZE = 256;
const MAX_ZOOM = 10;
const PRELOAD_FRAMES = 2;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LOAD_TIMEOUT = 300;
const COLOR_SCHEMES = {
    '1': 'Original',
    '2': 'Universal Blue',
    '3': 'TITAN',
    '4': 'The Weather Channel'
};
const WeatherControl = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeLayer, setActiveLayer] = useState('none');
    const map = useMap();
    const [currentLayer, setCurrentLayer] = useState(null);
    const [nextLayer, setNextLayer] = useState(null);
    const [frames, setFrames] = useState([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [opacity, setOpacity] = useState(0.5);
    const [apiHost, setApiHost] = useState('https://tilecache.rainviewer.com');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [animationMode, setAnimationMode] = useState('forward');
    const [direction, setDirection] = useState(1);
    const [colorScheme, setColorScheme] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const layerCache = useRef(new Map());
    const animationFrame = useRef(null);
    const transitionTimeout = useRef(null);
    const updateInterval = useRef(null);
    const abortController = useRef(null);
    const cleanupLayers = useCallback(() => {
        layerCache.current.forEach((layer) => {
            if (layer !== currentLayer && layer !== nextLayer) {
                map.removeLayer(layer);
            }
        });
        layerCache.current.clear();
        if (currentLayer)
            layerCache.current.set('current', currentLayer);
        if (nextLayer)
            layerCache.current.set('next', nextLayer);
    }, [currentLayer, nextLayer, map]);
    const createLayer = useCallback((path, initialOpacity = 0) => {
        const cachedLayer = layerCache.current.get(path);
        if (cachedLayer) {
            cachedLayer.setOpacity(initialOpacity);
            return cachedLayer;
        }
        const layer = L.tileLayer(`${apiHost}${path}`, {
            attribution: '&copy; <a href="https://www.rainviewer.com/">RainViewer</a>',
            opacity: initialOpacity,
            zIndex: 500,
            tileSize: TILE_SIZE,
            maxZoom: MAX_ZOOM,
            maxNativeZoom: 10,
            updateWhenIdle: true,
            updateWhenZooming: false,
            keepBuffer: 2,
            className: 'weather-layer',
            crossOrigin: true
        });
        layerCache.current.set(path, layer);
        return layer;
    }, [apiHost]);
    useEffect(() => {
        return () => {
            if (animationFrame.current)
                cancelAnimationFrame(animationFrame.current);
            if (transitionTimeout.current)
                clearTimeout(transitionTimeout.current);
            if (updateInterval.current)
                clearInterval(updateInterval.current);
            if (abortController.current)
                abortController.current.abort();
            cleanupLayers();
        };
    }, [cleanupLayers]);
    const preloadFrames = useCallback((currentIndex) => {
        if (!frames.length)
            return;
        const framesToPreload = [];
        for (let i = 1; i <= PRELOAD_FRAMES; i++) {
            const nextIndex = (currentIndex + i) % frames.length;
            framesToPreload.push(frames[nextIndex]);
        }
        framesToPreload.forEach(frame => {
            if (!layerCache.current.has(frame.path)) {
                const layer = createLayer(frame.path, 0);
                layerCache.current.set(frame.path, layer);
            }
        });
    }, [frames, createLayer]);
    const updateLayers = useCallback(async (path) => {
        if (isTransitioning)
            return;
        setIsTransitioning(true);
        setIsLoading(true);
        setError(null);
        try {
            if (nextLayer) {
                map.removeLayer(nextLayer);
                setNextLayer(null);
            }
            const newNextLayer = createLayer(path.replace('/2/', `/${colorScheme}/`), 0);
            newNextLayer.addTo(map);
            await new Promise((resolve, reject) => {
                const loadHandler = () => {
                    newNextLayer.off('load', loadHandler);
                    newNextLayer.off('tileerror', errorHandler);
                    resolve();
                };
                const errorHandler = (event) => {
                    newNextLayer.off('load', loadHandler);
                    newNextLayer.off('tileerror', errorHandler);
                    reject(new Error('Failed to load weather tiles'));
                };
                newNextLayer.on('load', loadHandler);
                newNextLayer.on('tileerror', errorHandler);
                transitionTimeout.current = setTimeout(resolve, LOAD_TIMEOUT);
            });
            if (currentLayer) {
                let currentOpacity = currentLayer.options.opacity || 0;
                let nextOpacity = 0;
                const animate = () => {
                    currentOpacity = Math.max(0, currentOpacity - OPACITY_STEP);
                    nextOpacity = Math.min(opacity, nextOpacity + OPACITY_STEP);
                    currentLayer.setOpacity(currentOpacity);
                    newNextLayer.setOpacity(nextOpacity);
                    if (currentOpacity > 0) {
                        animationFrame.current = requestAnimationFrame(animate);
                    }
                    else {
                        map.removeLayer(currentLayer);
                        setCurrentLayer(newNextLayer);
                        setNextLayer(null);
                        setIsTransitioning(false);
                        cleanupLayers();
                    }
                };
                animationFrame.current = requestAnimationFrame(animate);
            }
            else {
                newNextLayer.setOpacity(opacity);
                setCurrentLayer(newNextLayer);
                setIsTransitioning(false);
                cleanupLayers();
            }
        }
        catch (error) {
            console.error('Error updating layers:', error);
            setError(error instanceof Error ? error.message : 'Failed to update weather layer');
            setIsTransitioning(false);
        }
        finally {
            setIsLoading(false);
        }
    }, [isTransitioning, map, opacity, colorScheme, currentLayer, createLayer, cleanupLayers]);
    useEffect(() => {
        if (activeLayer === 'radar' && frames.length > 0) {
            updateLayers(frames[currentFrameIndex].path);
            preloadFrames(currentFrameIndex);
        }
    }, [currentFrameIndex, activeLayer, frames, updateLayers, preloadFrames]);
    useEffect(() => {
        if (updateInterval.current)
            clearInterval(updateInterval.current);
        if (isPlaying && frames.length > 0 && !isTransitioning) {
            updateInterval.current = setInterval(() => {
                requestAnimationFrame(() => {
                    setCurrentFrameIndex(prev => {
                        if (animationMode === 'forward') {
                            return (prev + 1) % frames.length;
                        }
                        else {
                            const next = prev + direction;
                            if (next >= frames.length - 1) {
                                setDirection(-1);
                                return frames.length - 2;
                            }
                            else if (next <= 0) {
                                setDirection(1);
                                return 1;
                            }
                            return next;
                        }
                    });
                });
            }, FRAME_CHANGE_INTERVAL / animationSpeed);
        }
        return () => {
            if (updateInterval.current)
                clearInterval(updateInterval.current);
        };
    }, [isPlaying, frames.length, isTransitioning, animationSpeed, animationMode, direction]);
    const fetchWeatherData = useCallback(async () => {
        try {
            if (abortController.current) {
                abortController.current.abort();
            }
            abortController.current = new AbortController();
            const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                signal: abortController.current.signal
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApiHost(data.host);
            const radarFrames = data.radar.past.map(frame => ({
                path: frame.path + `/${TILE_SIZE}/{z}/{x}/{y}/2/1_1.png`,
                timestamp: frame.time
            }));
            setFrames(radarFrames);
            setCurrentFrameIndex(radarFrames.length - 1);
            setError(null);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            console.error('Error fetching weather data:', error);
            setError('Failed to fetch weather data');
        }
    }, []);
    useEffect(() => {
        fetchWeatherData();
        const interval = setInterval(fetchWeatherData, UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchWeatherData]);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLayerChange = async (layer) => {
        // Clear any existing transitions
        setIsTransitioning(false);
        if (layer === 'none') {
            if (nextLayer) {
                map.removeLayer(nextLayer);
                setNextLayer(null);
            }
            if (currentLayer) {
                map.removeLayer(currentLayer);
                setCurrentLayer(null);
            }
            setIsPlaying(false);
        }
        else if (layer === 'radar' && frames.length > 0) {
            // Remove any existing layers before starting new ones
            if (nextLayer) {
                map.removeLayer(nextLayer);
                setNextLayer(null);
            }
            if (currentLayer) {
                map.removeLayer(currentLayer);
                setCurrentLayer(null);
            }
            updateLayers(frames[currentFrameIndex].path);
        }
        else if (layer === 'satellite') {
            try {
                // Remove any existing layers before starting new ones
                if (nextLayer) {
                    map.removeLayer(nextLayer);
                    setNextLayer(null);
                }
                if (currentLayer) {
                    map.removeLayer(currentLayer);
                    setCurrentLayer(null);
                }
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                const data = await response.json();
                const latestSatellite = data.satellite.infrared[data.satellite.infrared.length - 1];
                updateLayers(latestSatellite.path + '/512/{z}/{x}/{y}/0/0_0.png');
            }
            catch (error) {
                console.error('Error fetching satellite data:', error);
            }
        }
        setActiveLayer(layer);
        handleClose();
    };
    const handleOpacityChange = (_event, value) => {
        const newOpacity = value;
        setOpacity(newOpacity);
        if (currentLayer) {
            currentLayer.setOpacity(newOpacity);
        }
    };
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString();
    };
    const handleStepForward = () => {
        setCurrentFrameIndex(prev => (prev + 1) % frames.length);
    };
    const handleStepBackward = () => {
        setCurrentFrameIndex(prev => (prev - 1 + frames.length) % frames.length);
    };
    const handleSpeedChange = () => {
        setAnimationSpeed(prev => (prev % 3) + 1);
    };
    const handleAnimationModeToggle = () => {
        setAnimationMode(prev => prev === 'forward' ? 'bounce' : 'forward');
        setDirection(1);
    };
    const handleColorSchemeChange = () => {
        const schemes = ['1', '2', '3', '4'];
        const currentIndex = schemes.indexOf(colorScheme);
        setColorScheme(schemes[(currentIndex + 1) % schemes.length]);
    };
    return (_jsxs(Box, { sx: { position: 'absolute', right: 10, top: 100, zIndex: 1000 }, children: [_jsxs(Stack, { spacing: 2, sx: { bgcolor: 'white', p: 1, borderRadius: 1, mb: 1 }, children: [error && (_jsx(Typography, { color: "error", variant: "caption", sx: { textAlign: 'center' }, children: error })), _jsx(Tooltip, { title: "Weather Layers", children: _jsx(IconButton, { onClick: handleClick, sx: {
                                backgroundColor: 'white',
                                '&:hover': { backgroundColor: '#f5f5f5' },
                                border: activeLayer !== 'none' ? 2 : 0,
                                borderColor: 'primary.main'
                            }, children: activeLayer === 'radar' ? _jsx(Opacity, {}) :
                                activeLayer === 'satellite' ? _jsx(WbSunny, {}) : _jsx(Cloud, {}) }) }), activeLayer === 'radar' && (_jsxs(_Fragment, { children: [_jsxs(ButtonGroup, { size: "small", sx: { display: 'flex', justifyContent: 'center' }, children: [_jsx(IconButton, { onClick: handleStepBackward, children: _jsx(SkipPrevious, {}) }), _jsx(IconButton, { onClick: () => setIsPlaying(!isPlaying), children: isPlaying ? _jsx(Pause, {}) : _jsx(PlayArrow, {}) }), _jsx(IconButton, { onClick: handleStepForward, children: _jsx(SkipNext, {}) })] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Tooltip, { title: `Speed: ${animationSpeed}x`, children: _jsx(IconButton, { onClick: handleSpeedChange, children: _jsx(Speed, {}) }) }), _jsx(Tooltip, { title: `Mode: ${animationMode}`, children: _jsx(IconButton, { onClick: handleAnimationModeToggle, children: _jsx(Loop, {}) }) }), _jsx(Tooltip, { title: `Color: ${COLOR_SCHEMES[colorScheme]}`, children: _jsx(IconButton, { onClick: handleColorSchemeChange, children: _jsx(Palette, {}) }) })] }), _jsx(Box, { sx: { width: 150, px: 2 }, children: _jsx(Slider, { size: "small", value: opacity, min: 0, max: 1, step: 0.1, onChange: handleOpacityChange, "aria-label": "Opacity" }) }), frames.length > 0 && (_jsxs(_Fragment, { children: [_jsx(LinearProgress, { variant: "determinate", value: (currentFrameIndex / (frames.length - 1)) * 100, sx: { height: 2, borderRadius: 1 } }), _jsx(Typography, { variant: "caption", sx: { textAlign: 'center' }, children: formatTimestamp(frames[currentFrameIndex].timestamp) })] })), isLoading && (_jsx(CircularProgress, { size: 24, sx: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px'
                                } }))] }))] }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleClose, children: [_jsxs(MenuItem, { onClick: () => handleLayerChange('radar'), children: [_jsx(Opacity, { sx: { mr: 1 } }), " Precipitation Radar"] }), _jsxs(MenuItem, { onClick: () => handleLayerChange('satellite'), children: [_jsx(WbSunny, { sx: { mr: 1 } }), " Satellite View"] }), _jsx(MenuItem, { onClick: () => handleLayerChange('none'), children: "None" })] })] }));
};
export default WeatherControl;
