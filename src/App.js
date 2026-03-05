import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Fade, Button, Paper } from '@mui/material';
import { theme } from './theme/theme';

// Komponentlarni import qilish
import RegionModal from './components/RegionModal/RegionModal';
import AddressForm from './components/AddressForm/AddressForm';
import CargoWizard from './components/CargoWizard/CargoWizard';

function App() {
    // 1. Hudud holati
    const [selectedRegion, setSelectedRegion] = useState(null);

    // 2. Qaysi formani ko'rsatish holati ('address' yoki 'wizard')
    const [currentView, setCurrentView] = useState('address');

    // Sahifa yuklanganda sessionStorage'ni tekshirish
    useEffect(() => {
        // localStorage o'rniga sessionStorage ishlatamiz (vkladka yopilsa o'chadi)
        const savedRegion = sessionStorage.getItem('user_region_session');
        if (savedRegion) {
            setSelectedRegion(savedRegion);
        }
    }, []);

    // Hudud tanlanganda ishlaydigan funksiya
    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        // sessionStorage'ga saqlash
        sessionStorage.setItem('user_region_session', region);
    };

    // Manzil tasdiqlanganda Wizardga o'tish funksiyasi
    const handleAddressConfirm = () => {
        setCurrentView('wizard');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* Asosiy fon gradienti */}
            <Box sx={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, #f8f9fa 0%, #e9ecef 100%)',
                py: 4
            }}>

                {/* 1-QADAM: HUDUD TANLASH MODALI */}
                {!selectedRegion && (
                    <RegionModal onSelect={handleRegionSelect} />
                )}

                <Container maxWidth="md">
                    {/* LOGO VA SARLAVHA */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 900,
                                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            NURI CARGO
                        </Typography>

                        {selectedRegion && (
                            <Fade in={true}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        px: 3, py: 1,
                                        borderRadius: '50px',
                                        bgcolor: 'white',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Box sx={{ width: 10, height: 10, bgcolor: 'success.main', borderRadius: '50%', mr: 1.5 }} />
                                    <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                                        Hudud: {selectedRegion.toUpperCase()}
                                    </Typography>
                                </Paper>
                            </Fade>
                        )}
                    </Box>

                    {/* 2-QADAM: MANZIL KIRITISH */}
                    {selectedRegion && currentView === 'address' && (
                        <Fade in={true} timeout={800}>
                            <Box>
                                <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 800, color: '#374151' }}>
                                    📍 Olib ketish manzilini aniqlang
                                </Typography>
                                <AddressForm onConfirm={handleAddressConfirm} />
                            </Box>
                        </Fade>
                    )}

                    {/* 3-QADAM: KARGO WIZARD */}
                    {selectedRegion && currentView === 'wizard' && (
                        <Fade in={true} timeout={800}>
                            <Box sx={{ mt: -2 }}>
                                <CargoWizard region={selectedRegion} />

                                <Box sx={{ textAlign: 'center', mt: 3 }}>
                                    <Button
                                        onClick={() => setCurrentView('address')}
                                        variant="text"
                                        sx={{
                                            textTransform: 'none',
                                            color: 'text.secondary',
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
                                        }}
                                    >
                                        ← Manzilni qaytadan tahrirlash
                                    </Button>
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default App;