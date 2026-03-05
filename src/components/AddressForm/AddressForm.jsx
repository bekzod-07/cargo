import React, { useState } from 'react';
import {
    TextField, Button, Stack, Typography, Paper, Box,
    CircularProgress, Alert, Zoom, Divider
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker belgisini to'g'rilash
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AddressForm = ({ onConfirm }) => {
    const [address, setAddress] = useState({ neighborhood: '', street: '', number: '' });
    const [coords, setCoords] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Turkiya/Konya markazi koordinatalari
    const turkiyeCenter = [37.8713, 32.4846];

    function MapEvents() {
        useMapEvents({
            click(e) {
                setCoords([e.latlng.lat, e.latlng.lng]);
                setError(''); // Marker qo'yilganda xatoni o'chirish
            },
        });
        return coords ? <Marker position={coords} /> : null;
    }

    const handleInput = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const getRealLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            setError("Brauzeringiz GPS-ni qo'llab-quvvatlamaydi.");
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords([pos.coords.latitude, pos.coords.longitude]);
                setLoading(false);
            },
            () => {
                setError("GPS signalini olib bo'lmadi. Iltimos, xaritadan qo'lda belgilang.");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleFinalConfirm = () => {
        if (!address.neighborhood || !address.street || !address.number) {
            setError("Manzil kataklarini to'ldiring!");
            return;
        }
        if (!coords) {
            setError("Xaritadan aniq joyingizni belgilashingiz shart!");
            return;
        }
        onConfirm({ ...address, coords });
    };

    return (
        <Zoom in={true}>
            <Paper elevation={0} sx={{
                p: {xs: 2, md: 4},
                borderRadius: '30px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight="800" textAlign="center" color="primary">
                        📍 Turkiya bo'yicha olib ketish manzili
                    </Typography>

                    {error && <Alert severity="error" sx={{ borderRadius: '15px' }}>{error}</Alert>}

                    <Stack spacing={2}>
                        <TextField fullWidth label="Mahalla / Semt" name="neighborhood" variant="outlined" onChange={handleInput}
                                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' }}} />
                        <Stack direction="row" spacing={2}>
                            <TextField fullWidth label="Ko'cha / Sokak" name="street" variant="outlined" onChange={handleInput}
                                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' }}} />
                            <TextField label="No" name="number" variant="outlined" onChange={handleInput}
                                       sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: '15px' }}} />
                        </Stack>
                    </Stack>

                    <Divider>XARITADA BELGILASH (MAJBURIY)</Divider>

                    <Box sx={{ height: 300, borderRadius: '20px', overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                        <MapContainer center={turkiyeCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <MapEvents />
                        </MapContainer>
                    </Box>

                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                        <Button
                            fullWidth variant="outlined"
                            onClick={getRealLocation}
                            disabled={loading}
                            sx={{ borderRadius: '15px', py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                        >
                            {loading ? <CircularProgress size={24} /> : "🎯 GPS orqali aniqlash"}
                        </Button>

                        <Button
                            fullWidth variant="contained"
                            onClick={handleFinalConfirm}
                            sx={{
                                py: 2, borderRadius: '18px',
                                background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                                fontWeight: '900',
                                boxShadow: '0 8px 16px rgba(26, 35, 126, 0.3)'
                            }}
                        >
                            Tasdiqlash
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Zoom>
    );
};

export default AddressForm;