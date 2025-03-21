import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Drawer } from '@mui/material';
import { History, Place, Clear, Restaurant, Park, Business, School, Hotel, Close } from '@mui/icons-material';
import { JSX } from '@emotion/react/jsx-runtime';
import { SearchResult } from '../types';

interface SearchHistoryProps {
    searches: SearchResult[];
    onSelect: (result: SearchResult) => void;
    onClear: (result: SearchResult) => void;
    isOpen: boolean;
    onClose: () => void;
}

const categoryIcons: Record<string, JSX.Element> = {
    restaurant: <Restaurant />,
    park: <Park />,
    commercial: <Business />,
    education: <School />,
    accommodation: <Hotel />,
    default: <Place />
};

const getCategoryFromTags = (result: SearchResult): string => {
    const tags = result.type?.toLowerCase() || '';
    if (tags.includes('restaurant') || tags.includes('cafe')) return 'restaurant';
    if (tags.includes('park') || tags.includes('garden')) return 'park';
    if (tags.includes('school') || tags.includes('university')) return 'education';
    if (tags.includes('hotel') || tags.includes('hostel')) return 'accommodation';
    if (tags.includes('shop') || tags.includes('store') || tags.includes('mall')) return 'commercial';
    return 'default';
};

const SearchHistory = ({ searches, onSelect, onClear, isOpen, onClose }: SearchHistoryProps) => {
    return (
        <Drawer
            variant="temporary"
            anchor="right"
            open={isOpen}
            onClose={onClose}
            sx={{
                width: 300,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 300,
                    boxSizing: 'border-box'
                }
            }}
        >
            <Box sx={{ overflow: 'auto', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <History sx={{ mr: 1 }} />
                        <Typography variant="h6">Search History</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
                <List>
                    {searches.map((search, index) => {
                        const category = getCategoryFromTags(search);
                        return (
                            <ListItem
                                key={`${search.display_name}-${search.timestamp}-${index}`}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => onClear(search)}>
                                        <Clear />
                                    </IconButton>
                                }
                                disablePadding
                            >
                                <ListItemButton onClick={() => onSelect(search)}>
                                    <ListItemIcon>
                                        {categoryIcons[category]}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={search.display_name}
                                        secondary={
                                            <>
                                                <Typography variant="caption" display="block">
                                                    {search.type || 'Location'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {search.timestamp
                                                        ? new Date(search.timestamp).toLocaleString()
                                                        : ''}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};

export default SearchHistory; 