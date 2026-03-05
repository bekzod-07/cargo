import React, { useState } from 'react';
import {
    Box, Stepper, Step, StepLabel, Button, Typography,
    TextField, Stack, Paper, Divider, Alert, Slider,
    InputAdornment, Zoom, Fade, CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ikonkalar
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScaleIcon from '@mui/icons-material/Scale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// Leaflet Marker fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const steps = ['Yuk', 'Qabul qiluvchi', 'Xavfsizlik', 'To‘lov'];

export default function CargoWizard({ region }) {
    const [activeStep, setActiveStep] = useState(0);
    const [loadingMap, setLoadingMap] = useState(false);
    const [formData, setFormData] = useState({
        weight: 10,
        coords: null,
        receiverFIO: '',
        receiverPhone: '+998 ',
        passportImg: null,
        isSafe: null,
        itemsImg: null,
        contact: '',
        paymentMethod: ''
    });

    const nextStep = () => setActiveStep((prev) => prev + 1);
    const prevStep = () => setActiveStep((prev) => prev - 1);

    const priceUSD = formData.weight * 8;
    const serviceFeeTL = 400;

    // Telefon raqamni formatlash (Pro Filter)
    const formatPhoneNumber = (value) => {
        if (!value) return '+998 ';
        const phoneNumber = value.replace(/[^\d]/g, '');
        if (!phoneNumber.startsWith('998')) return '+998 ';

        const part1 = phoneNumber.slice(0, 3); // 998
        const part2 = phoneNumber.slice(3, 5); // 90
        const part3 = phoneNumber.slice(5, 8); // 123
        const part4 = phoneNumber.slice(8, 10); // 45
        const part5 = phoneNumber.slice(10, 12); // 67

        let result = `+${part1} `;
        if (part2) result += `(${part2}) `;
        if (part3) result += `${part3}-`;
        if (part4) result += `${part4}-`;
        if (part5) result += `${part5}`;

        return result;
    };

    // Xarita komponenti
    function MapPicker() {
        useMapEvents({
            click(e) { setFormData({ ...formData, coords: [e.latlng.lat, e.latlng.lng] }); },
        });
        return formData.coords ? <Marker position={formData.coords} /> : null;
    }

    const getGPS = () => {
        setLoadingMap(true);
        navigator.geolocation.getCurrentPosition(
            (p) => {
                setFormData({ ...formData, coords: [p.coords.latitude, p.coords.longitude] });
                setLoadingMap(false);
            },
            () => { setLoadingMap(false); alert("GPS aniqlanmadi, xaritadan tanlang."); }
        );
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0: // 1-Qadam: Og'irlik va Xarita
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <ScaleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h5" fontWeight="800">Yuk og'irligi</Typography>
                            </Box>

                            <Box sx={{ px: 2 }}>
                                <Typography gutterBottom fontWeight="600">Og'irlik: {formData.weight} kg</Typography>
                                <Slider
                                    value={formData.weight} min={10} max={200}
                                    onChange={(e, val) => setFormData({ ...formData, weight: val })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth label="Aniq vazn" type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: Math.max(0, parseInt(e.target.value) || 0) })}
                                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                                    error={formData.weight < 10}
                                    helperText={formData.weight < 10 && "Minimal 10 kg bo'lishi shart"}
                                />
                            </Box>

                            <Divider>LOKATSIYA (MAJBURIY)</Divider>

                            <Box sx={{ height: 250, borderRadius: '20px', overflow: 'hidden', border: '1px solid #eee' }}>
                                <MapContainer center={[37.8713, 32.4846]} zoom={13} style={{ height: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapPicker />
                                </MapContainer>
                            </Box>

                            <Button
                                fullWidth variant="outlined" startIcon={loadingMap ? <CircularProgress size={20} /> : <MyLocationIcon />}
                                onClick={getGPS} sx={{ borderRadius: '15px', py: 1.5 }}
                            >
                                {formData.coords ? "📍 Nuqta belgilandi" : "Hozirgi joyimni aniqlash"}
                            </Button>

                            <Button
                                fullWidth variant="contained" disabled={formData.weight < 10 || !formData.coords}
                                onClick={nextStep} sx={{ py: 2, borderRadius: '18px', fontWeight: '800' }}
                            >
                                Davom etish
                            </Button>
                        </Stack>
                    </Fade>
                );

            case 1: // 2-Qadam: Qabul qiluvchi (Siz so'ragan Pro telefon filtr)
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight="800" textAlign="center">Qabul qiluvchi ma'lumotlari</Typography>

                            <TextField
                                fullWidth label="F.I.O (To'liq)"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                                onChange={(e) => setFormData({ ...formData, receiverFIO: e.target.value })}
                            />

                            <TextField
                                fullWidth label="O'zbekiston telefon raqami"
                                value={formData.receiverPhone}
                                placeholder="+998 (90) 123-45-67"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">🇺🇿</InputAdornment>,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                                onChange={(e) => setFormData({ ...formData, receiverPhone: formatPhoneNumber(e.target.value) })}
                            />

                            <Paper variant="outlined" sx={{ p: 3, borderStyle: 'dashed', borderRadius: '15px', textAlign: 'center', bgcolor: '#fafafa' }}>
                                <Button component="label" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                                    {formData.passportImg ? "✅ Pasport yuklandi" : "Pasport rasmini yuklash"}
                                    <input type="file" hidden accept="image/*" onChange={(e) => setFormData({ ...formData, passportImg: e.target.files[0] })} />
                                </Button>
                                {formData.passportImg && <Typography variant="caption" display="block">{formData.passportImg.name}</Typography>}
                            </Paper>

                            <Button
                                fullWidth variant="contained" onClick={nextStep}
                                disabled={!formData.receiverFIO || formData.receiverPhone.length < 19 || !formData.passportImg}
                                sx={{ py: 2, borderRadius: '18px', fontWeight: '800' }}
                            >
                                Davom etish
                            </Button>
                        </Stack>
                    </Fade>
                );

            case 2: // 3-Qadam: Xavfsizlik
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight="800" textAlign="center">Xavfsizlik tekshiruvi</Typography>
                            <Alert severity="warning" sx={{ borderRadius: '15px' }}>
                                Suyuqlik, kukun va batareyalar taqiqlanadi!
                            </Alert>
                            <Button
                                variant={formData.isSafe ? "contained" : "outlined"}
                                color="success" fullWidth onClick={() => setFormData({ ...formData, isSafe: true })}
                                sx={{ borderRadius: '15px', py: 1.5 }}
                            > Tasdiqlayman </Button>

                            <Paper variant="outlined" sx={{ p: 2, borderStyle: 'dashed', borderRadius: '15px', textAlign: 'center' }}>
                                <Button component="label" startIcon={<CloudUploadIcon />}>
                                    {formData.itemsImg ? "✅ Ro'yxat yuklandi" : "Yuklar ro'yxati (Rasm)"}
                                    <input type="file" hidden accept="image/*" onChange={(e) => setFormData({ ...formData, itemsImg: e.target.files[0] })} />
                                </Button>
                            </Paper>

                            <TextField
                                fullWidth label="Telegram yoki Tel" placeholder="@username"
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                            />

                            <Button
                                fullWidth variant="contained" onClick={nextStep}
                                disabled={!formData.isSafe || !formData.itemsImg || !formData.contact}
                                sx={{ py: 2, borderRadius: '18px', fontWeight: '800' }}
                            > Hisob-faktura </Button>
                        </Stack>
                    </Fade>
                );

            case 3: // 4-Qadam: Invoys
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Paper sx={{ p: 3, borderRadius: '25px', background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e2ff 100%)' }}>
                                <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <ReceiptLongIcon color="primary" />
                                    <Typography variant="h6" fontWeight="900">NURI CARGO INVOICE</Typography>
                                </Stack>
                                <Divider sx={{ my: 1.5 }} />
                                <Box display="flex" justifyContent="space-between"><Typography>Vazn:</Typography><Typography fontWeight="700">{formData.weight} kg</Typography></Box>
                                <Box display="flex" justifyContent="space-between"><Typography fontWeight="800">JAMI:</Typography><Typography variant="h5" fontWeight="900" color="primary">{priceUSD}$ + {serviceFeeTL} TL</Typography></Box>
                            </Paper>

                            <Stack direction="row" spacing={2}>
                                <Button fullWidth variant="contained" color="success" onClick={() => { setFormData({ ...formData, paymentMethod: 'cash' }); nextStep(); }} sx={{ py: 2, borderRadius: '15px' }}>💵 Naqd</Button>
                                <Button fullWidth variant="contained" color="primary" onClick={() => { setFormData({ ...formData, paymentMethod: 'card' }); nextStep(); }} sx={{ py: 2, borderRadius: '15px' }}>💳 Karta</Button>
                            </Stack>
                        </Stack>
                    </Fade>
                );

            case 4: // Final
                return (
                    <Zoom in>
                        <Box textAlign="center">
                            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="900">Tayyor!</Typography>
                            <Typography sx={{ mt: 2 }}>Kuryerimiz tez orada siz bilan bog'lanadi.</Typography>
                            <Button fullWidth variant="outlined" sx={{ mt: 4, borderRadius: '15px' }} onClick={() => window.location.reload()}>Bosh sahifa</Button>
                        </Box>
                    </Zoom>
                );

            default: return null;
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map(label => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
            </Stepper>

            <Paper elevation={0} sx={{
                p: { xs: 3, md: 5 }, borderRadius: '35px',
                bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                {renderStep()}

                {activeStep > 0 && activeStep < 4 && (
                    <Button onClick={prevStep} sx={{ mt: 3, textTransform: 'none', fontWeight: 'bold' }}>
                        ← Orqaga
                    </Button>
                )}
            </Paper>
        </Box>
    );
}