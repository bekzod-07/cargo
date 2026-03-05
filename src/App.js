import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import { theme } from './theme/theme';

// Komponent
import CargoWizard from './components/CargoWizard/CargoWizard';

function App() {

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'radial-gradient(circle at top right, #f8f9fa 0%, #e9ecef 100%)',
                    py: 4
                }}
            >

                <Container maxWidth="md">

                    {/* LOGO */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>

                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 900,
                                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            NURI CARGO
                        </Typography>

                    </Box>

                    {/* CARGO WIZARD */}
                    <CargoWizard />

                </Container>

            </Box>
        </ThemeProvider>
    );
}

export default App;