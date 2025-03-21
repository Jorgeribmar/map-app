import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import Map from './components/Map';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Interactive Map App
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1 }}>
        <Map />
      </Box>
    </Box>
  );
}

export default App;
