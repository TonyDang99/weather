import React, { useState, useMemo } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Weather from './components/Weather';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
    },
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Weather mode={mode} toggleMode={toggleMode} />
    </ThemeProvider>
  );
}

export default App;
