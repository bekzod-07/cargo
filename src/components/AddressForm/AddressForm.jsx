import React, { useState } from 'react';
import {
    TextField, Button, Stack, Typography,
    Paper, Box, Divider
} from '@mui/material'; // InputAdornment olib tashlandi
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const AddressForm = () => {
    // address o'zgaruvchisini endi inputlarga ulaymiz (value)
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
                alert("Location qabul qilindi!");
            });
        }
    };

    const handleSubmit = () => {
        // Endi 'address' bu yerda ishlatilyapti, ogohlantirish yo'qoladi
        console.log("Jo'natilayotgan manzil:", address);
        alert(`Manzil saqlandi: ${address.neighborhood}, ${address.street}, ${address.number}`);
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
                    value={address.neighborhood} // Statega bog'landi
                    onChange={handleManualInput}
                />

                <Stack direction="row" spacing={2}>
                    <TextField
                        fullWidth
                        label="Ko'cha/Sokak"
                        name="street"
                        value={address.street} // Statega bog'landi
                        onChange={handleManualInput}
                    />
                    <TextField
                        sx={{ width: '120px' }}
                        label="Uy No"
                        name="number"
                        value={address.number} // Statega bog'landi
                        onChange={handleManualInput}
                    />
                </Stack>

                <Divider>YOKI</Divider>

                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<MyLocationIcon />}
                    onClick={shareLocation}
                    sx={{ py: 1.5, borderRadius: '10px', textTransform: 'none' }}
                >
                    GPS orqali yuborish
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
                    onClick={handleSubmit} // State ishlatiladigan joy
                    sx={{ mt: 2, py: 2, borderRadius: '12px' }}
                >
                    Manzilni tasdiqlash
                </Button>
            </Stack>
        </Paper>
    );
};

export default AddressForm;