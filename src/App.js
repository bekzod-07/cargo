import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Fade } from '@mui/material';
import { theme } from './theme/theme';
import RegionModal from './components/RegionModal/RegionModal';
import AddressForm from './components/AddressForm/AddressForm';

function App() {
    // Tanlangan hududni saqlash uchun state
    const [selectedRegion, setSelectedRegion] = useState(null);

    // Sahifa yuklanganda localStorage'ni tekshiramiz
    useEffect(() => {
        const savedRegion = localStorage.getItem('user_region');
        if (savedRegion) {
            setSelectedRegion(savedRegion);
        }
    }, []);

    // Hudud tanlanganda modal orqali chaqiriladigan funksiya
    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* Modalga tanlov funksiyasini uzatamiz.
         Agar hudud tanlanmagan bo'lsa, modal o'zini ko'rsatadi.
      */}
            {!selectedRegion && (
                <RegionModal onSelect={handleRegionSelect} />
            )}

            <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
                {/* Sarlavha qismi */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" color="primary" fontWeight="800" gutterBottom>
                        Cargo Express
                    </Typography>

                    {selectedRegion ? (
                        <Typography variant="h6" color="secondary">
                            Tanlangan hudud: <b>{selectedRegion.toUpperCase()}</b>
                        </Typography>
                    ) : (
                        <Typography variant="body1" color="text.secondary">
                            Davom etish uchun iltimos hududingizni tanlang.
                        </Typography>
                    )}
                </Box>

                {/* Agar hudud tanlangan bo'lsa, manzil kiritish formasini ko'rsatamiz.
           Fade — chiroyli animatsiya bilan chiqarish uchun.
        */}
                {selectedRegion && (
                    <Fade in={true} timeout={800}>
                        <Box>
                            <AddressForm region={selectedRegion} />
                        </Box>
                    </Fade>
                )}
            </Container>
        </ThemeProvider>
    );
}

export default App;