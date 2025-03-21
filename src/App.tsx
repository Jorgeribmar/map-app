import { ThemeProvider, CssBaseline } from '@mui/material';
import Map from './components/Map';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Map />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
