import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import Map from './components/Map';
function App() {
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', height: '100vh' }, children: [_jsx(CssBaseline, {}), _jsx(AppBar, { position: "static", children: _jsx(Toolbar, { children: _jsx(Typography, { variant: "h6", component: "div", children: "Interactive Map App" }) }) }), _jsx(Box, { sx: { flexGrow: 1 }, children: _jsx(Map, {}) })] }));
}
export default App;
