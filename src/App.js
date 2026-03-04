import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Fade, Button } from '@mui/material';
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

    // Sahifa yuklanganda hududni tekshirish
    useEffect(() => {
        const savedRegion = localStorage.getItem('user_region');
        if (savedRegion) {
            setSelectedRegion(savedRegion);
        }
    }, []);

    // Hudud tanlanganda ishlaydigan funksiya
    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
    };

    // Manzil tasdiqlanganda Wizardga o'tish funksiyasi
    const handleAddressConfirm = () => {
        setCurrentView('wizard');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* 1-QADAM: HUDUD TANLASH MODALI */}
            {!selectedRegion && (
                <RegionModal onSelect={handleRegionSelect} />
            )}

            <Container maxWidth="md" sx={{ mt: 4, mb: 5 }}>
                {/* LOGO VA SARLAVHA */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" color="primary" fontWeight="800" gutterBottom>
                        NURI CARGO
                    </Typography>

                    {selectedRegion && (
                        <Typography variant="subtitle1" sx={{ bgcolor: 'primary.light', color: 'white', display: 'inline-block', px: 2, py: 0.5, borderRadius: 2 }}>
                            Hudud: <b>{selectedRegion.toUpperCase()}</b>
                        </Typography>
                    )}
                </Box>

                {/* 2-QADAM: MANZIL KIRITISH (faqat hudud tanlangan bo'lsa) */}
                {selectedRegion && currentView === 'address' && (
                    <Fade in={true} timeout={800}>
                        <Box>
                            <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                                Olib ketish manzilini aniqlang
                            </Typography>
                            <AddressForm onConfirm={handleAddressConfirm} />
                        </Box>
                    </Fade>
                )}

                {/* 3-QADAM: KARGO WIZARD (Manzil tasdiqlangandan keyin) */}
                {selectedRegion && currentView === 'wizard' && (
                    <Fade in={true} timeout={800}>
                        <Box>
                            <CargoWizard region={selectedRegion} />

                            {/* Orqaga qaytish imkoniyati (ixtiyoriy) */}
                            <Button
                                onClick={() => setCurrentView('address')}
                                sx={{ mt: 2, textTransform: 'none' }}
                                color="inherit"
                            >
                                ← Manzilni o'zgartirish
                            </Button>
                        </Box>
                    </Fade>
                )}
            </Container>
        </ThemeProvider>
    );
}

export default App;