import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Map as MapIcon, Terrain, Satellite, DarkMode } from '@mui/icons-material';
const MapStyleControl = ({ style, onStyleChange }) => {
    const handleChange = (_, newStyle) => {
        if (newStyle !== null) {
            onStyleChange(newStyle);
        }
    };
    return (_jsx(Box, { sx: {
            position: 'absolute',
            bottom: '100px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            p: 1,
        }, children: _jsxs(ToggleButtonGroup, { value: style, exclusive: true, onChange: handleChange, size: "small", children: [_jsx(ToggleButton, { value: "standard", "aria-label": "standard map", children: _jsx(MapIcon, {}) }), _jsx(ToggleButton, { value: "satellite", "aria-label": "satellite", children: _jsx(Satellite, {}) }), _jsx(ToggleButton, { value: "terrain", "aria-label": "terrain", children: _jsx(Terrain, {}) }), _jsx(ToggleButton, { value: "dark", "aria-label": "dark mode", children: _jsx(DarkMode, {}) })] }) }));
};
export default MapStyleControl;
