import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Drawer } from '@mui/material';
import { History, Place, Clear, Restaurant, Park, Business, School, Hotel, Close } from '@mui/icons-material';
const categoryIcons = {
    restaurant: _jsx(Restaurant, {}),
    park: _jsx(Park, {}),
    commercial: _jsx(Business, {}),
    education: _jsx(School, {}),
    accommodation: _jsx(Hotel, {}),
    default: _jsx(Place, {})
};
const getCategoryFromTags = (result) => {
    const tags = result.type?.toLowerCase() || '';
    if (tags.includes('restaurant') || tags.includes('cafe'))
        return 'restaurant';
    if (tags.includes('park') || tags.includes('garden'))
        return 'park';
    if (tags.includes('school') || tags.includes('university'))
        return 'education';
    if (tags.includes('hotel') || tags.includes('hostel'))
        return 'accommodation';
    if (tags.includes('shop') || tags.includes('store') || tags.includes('mall'))
        return 'commercial';
    return 'default';
};
const SearchHistory = ({ searches, onSelect, onClear, isOpen, onClose }) => {
    return (_jsx(Drawer, { variant: "temporary", anchor: "right", open: isOpen, onClose: onClose, sx: {
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: 300,
                boxSizing: 'border-box'
            }
        }, children: _jsxs(Box, { sx: { overflow: 'auto', p: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center' }, children: [_jsx(History, { sx: { mr: 1 } }), _jsx(Typography, { variant: "h6", children: "Search History" })] }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(Close, {}) })] }), _jsx(List, { children: searches.map((search, index) => {
                        const category = getCategoryFromTags(search);
                        return (_jsx(ListItem, { secondaryAction: _jsx(IconButton, { edge: "end", onClick: () => onClear(search), children: _jsx(Clear, {}) }), disablePadding: true, children: _jsxs(ListItemButton, { onClick: () => onSelect(search), children: [_jsx(ListItemIcon, { children: categoryIcons[category] }), _jsx(ListItemText, { primary: search.display_name, secondary: _jsxs(_Fragment, { children: [_jsx(Typography, { variant: "caption", display: "block", children: search.type || 'Location' }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: search.timestamp
                                                        ? new Date(search.timestamp).toLocaleString()
                                                        : '' })] }) })] }) }, `${search.display_name}-${search.timestamp}-${index}`));
                    }) })] }) }));
};
export default SearchHistory;
