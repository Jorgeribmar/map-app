import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Map as MapIcon, Terrain, Satellite, DarkMode } from '@mui/icons-material';

export type MapStyle = 'standard' | 'satellite' | 'terrain' | 'dark';

interface MapStyleControlProps {
    style: MapStyle;
    onStyleChange: (style: MapStyle) => void;
}

const MapStyleControl = ({ style, onStyleChange }: MapStyleControlProps) => {

    const handleChange = (_: React.MouseEvent<HTMLElement>, newStyle: MapStyle) => {
        if (newStyle !== null) {
            onStyleChange(newStyle);
        }
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: '100px',
                right: '20px',
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                p: 1,
            }}
        >
            <ToggleButtonGroup
                value={style}
                exclusive
                onChange={handleChange}
                size="small"
            >
                <ToggleButton value="standard" aria-label="standard map">
                    <MapIcon />
                </ToggleButton>
                <ToggleButton value="satellite" aria-label="satellite">
                    <Satellite />
                </ToggleButton>
                <ToggleButton value="terrain" aria-label="terrain">
                    <Terrain />
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark mode">
                    <DarkMode />
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default MapStyleControl; 