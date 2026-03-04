import React, { useState } from 'react';
import {
    TextField, Button, Stack, Typography,
    Paper, Box, Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// DIQQAT: onConfirm propsini qabul qilib olamiz
const AddressForm = ({ onConfirm }) => {
    const [address, setAddress] = useState({
        neighborhood: '',
        street: '',
        number: ''
    });

    const handleManualInput = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const shareLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Koordinatalar: ${latitude}, ${longitude}`);
                // Kelajakda bu koordinatalarni ham saqlashingiz mumkin
                alert("Location qabul qilindi!");
            });
        }
    };

    const handleSubmit = () => {
        // 1. Oddiy tekshiruv (Validation)
        if (!address.neighborhood || !address.street || !address.number) {
            alert("Iltimos, manzilni to'liq to'ldiring!");
            return;
        }

        // 2. Ma'lumotni konsolga chiqaramiz
        console.log("Tasdiqlangan manzil:", address);

        // 3. ENGM MUHIM QISM: App.jsx dagi keyingi bosqichga o'tish funksiyasini chaqiramiz
        if (onConfirm) {
            onConfirm();
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                    <HomeIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">To‘liq manzil kiritish</Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                    Misol: Fevzi Çakmak Mahallesi / 10420 Sokak / No:1
                </Typography>

                <TextField
                    fullWidth
                    label="Mahalla nomi"
                    name="neighborhood"
                    value={address.neighborhood}
                    onChange={handleManualInput}
                    placeholder="Masalan: Fevzi Çakmak Mah."
                />

                <Stack direction="row" spacing={2}>
                    <TextField
                        fullWidth
                        label="Ko'cha/Sokak"
                        name="street"
                        value={address.street}
                        onChange={handleManualInput}
                        placeholder="10420 Sokak"
                    />
                    <TextField
                        sx={{ width: '120px' }}
                        label="Uy No"
                        name="number"
                        value={address.number}
                        onChange={handleManualInput}
                        placeholder="No:1"
                    />
                </Stack>

                <Divider>YOKI</Divider>

                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<MyLocationIcon />}
                    onClick={shareLocation}
                    sx={{ py: 1.5, borderRadius: '10px', textTransform: 'none', fontWeight: 'bold' }}
                >
                    📍 Hozirgi joylashuvni yuborish
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<MapIcon />}
                    sx={{ py: 1.5, borderRadius: '10px', textTransform: 'none' }}
                >
                    Xaritadan tanlash
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    sx={{ mt: 2, py: 2, borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                    Manzilni tasdiqlash
                </Button>
            </Stack>
        </Paper>
    );
};

export default AddressForm;