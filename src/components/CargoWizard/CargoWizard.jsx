import React, { useState, useEffect } from 'react';
import {
    Box, Stepper, Step, StepLabel, Button, Typography,
    TextField, Stack, Paper, Divider, Alert, Slider,
    InputAdornment, Zoom, Fade, CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ikonkalar
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScaleIcon from '@mui/icons-material/Scale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SendIcon from '@mui/icons-material/Send';

// Leaflet Marker fix (Xaritada marker ko'rinishi uchun)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const steps = ['Hudud', 'Yuk', 'Qabul qiluvchi', 'Xavfsizlik', 'To‘lov'];

// 1. Xarita boshqaruvi uchun yordamchi komponent (Xarita ichida bo'lishi shart)
function MapController({ coords, setCoords }) {
    const map = useMap();

    // Agar koordinata o'zgarsa, xarita o'sha yerga silliq siljiydi
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 16, { animate: true, duration: 1.5 });
        }
    }, [coords, map]);

    useMapEvents({
        click(e) {
            setCoords([e.latlng.lat, e.latlng.lng]);
        },
    });

    return coords ? <Marker position={coords} /> : null;
}

export default function CargoWizard() {
    const [activeStep, setActiveStep] = useState(0);
    const [loadingMap, setLoadingMap] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        district: '',
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

    // Telefon raqamni formatlash
    const formatPhoneNumber = (value) => {
        if (!value) return '+998 ';
        const phoneNumber = value.replace(/[^\d]/g, '');
        if (!phoneNumber.startsWith('998')) return '+998 ';

        const part1 = phoneNumber.slice(0, 3);
        const part2 = phoneNumber.slice(3, 5);
        const part3 = phoneNumber.slice(5, 8);
        const part4 = phoneNumber.slice(8, 10);
        const part5 = phoneNumber.slice(10, 12);

        let result = `+${part1} `;
        if (part2) result += `(${part2}) `;
        if (part3) result += `${part3}-`;
        if (part4) result += `${part4}-`;
        if (part5) result += `${part5}`;

        return result;
    };

    // GPS aniqlash funksiyasi
    const getGPS = () => {
        setLoadingMap(true);
        if (!navigator.geolocation) {
            alert("Brauzeringiz lokatsiyani qo'llab-quvvatlamaydi");
            setLoadingMap(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (p) => {
                const newCoords = [p.coords.latitude, p.coords.longitude];
                setFormData(prev => ({ ...prev, coords: newCoords }));
                setLoadingMap(false);
            },
            (error) => {
                setLoadingMap(false);
                alert("Lokatsiyani aniqlashga ruxsat berilmadi.");
            },
            { enableHighAccuracy: true }
        );
    };

    // Telegramga ma'lumot yuborish
    const sendToTelegram = async (paymentMethod) => {
        setIsSubmitting(true);
        const BOT_TOKEN = '8798697794:AAH8whHzw0sTsWEUrTZAR1Nz-aU18enBADI';
        const CHAT_ID = '-1003869653928';

        const mapLink = formData.coords
            ? `https://www.google.com/maps?q=${formData.coords[0]},${formData.coords[1]}`
            : "Joylashuv kiritilmadi";

        const textMessage = `
📦 <b>YANGI BUYURTMA | NURI CARGO</b>
━━━━━━━━━━━━━━━━━━━━━━
📍 <b>Hudud:</b> ${formData.district}
⚖️ <b>Yuk vazni:</b> ${formData.weight} kg
🗺 <b>Lokatsiya:</b> <a href="${mapLink}">Xaritada ko'rish</a>

👤 <b>QABUL QILUVCHI</b>
▪️ <b>F.I.O:</b> ${formData.receiverFIO}
▪️ <b>Telefon:</b> ${formData.receiverPhone}

🛡 <b>ALOQA</b>
▪️ <b>Mijoz:</b> ${formData.contact}
▪️ <b>Holati:</b> Tasdiqlangan ✅

💳 <b>TO'LOV</b>
▪️ <b>Usul:</b> ${paymentMethod === 'cash' ? '💵 Naqd' : '💳 Karta'}
▪️ <b>Summa:</b> ${priceUSD}$ + ${serviceFeeTL} TL
━━━━━━━━━━━━━━━━━━━━━━`;

        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: textMessage,
                    parse_mode: 'HTML'
                })
            });

            const sendFile = async (file, caption) => {
                const data = new FormData();
                data.append('chat_id', CHAT_ID);
                data.append('photo', file);
                data.append('caption', caption);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: data });
            };

            if (formData.passportImg) await sendFile(formData.passportImg, `👤 Pasport: ${formData.receiverFIO}`);
            if (formData.itemsImg) await sendFile(formData.itemsImg, `📦 Yuklar rasmi`);

            nextStep();
        } catch (error) {
            alert("Xatolik! Internetni tekshiring.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <LocationCityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h5" fontWeight="900">Qaysi tumandasiz?</Typography>
                            </Box>
                            <Stack spacing={2}>
                                {['Selçuklu', 'Meram', 'Karatay'].map((dist) => (
                                    <Button
                                        key={dist} variant={formData.district === dist ? "contained" : "outlined"}
                                        onClick={() => setFormData({ ...formData, district: dist })}
                                        sx={{ py: 2, borderRadius: '20px', fontWeight: '800' }}
                                    >📍 {dist}</Button>
                                ))}
                            </Stack>
                            <Button fullWidth variant="contained" disabled={!formData.district} onClick={nextStep} sx={{ py: 2, borderRadius: '18px' }}>Davom etish</Button>
                        </Stack>
                    </Fade>
                );

            case 1:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <ScaleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                <Typography variant="h5" fontWeight="800">Yuk va Manzil</Typography>
                            </Box>
                            <Box sx={{ px: 2 }}>
                                <Typography gutterBottom>Og'irlik: <b>{formData.weight} kg</b></Typography>
                                <Slider value={formData.weight} min={10} max={200} onChange={(e, val) => setFormData({ ...formData, weight: val })} />
                            </Box>
                            <Box sx={{ height: 300, borderRadius: '25px', overflow: 'hidden', border: '2px solid #fff' }}>
                                <MapContainer center={[37.8713, 32.4846]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController coords={formData.coords} setCoords={(c) => setFormData({...formData, coords: c})} />
                                </MapContainer>
                            </Box>
                            <Button fullWidth variant="contained" color="secondary" startIcon={loadingMap ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                                    onClick={getGPS} sx={{ borderRadius: '15px', py: 1.5 }}>
                                {formData.coords ? "Joylashuv tanlandi ✅" : "Hozirgi joyimni aniqlash"}
                            </Button>
                            <Button fullWidth variant="contained" disabled={!formData.coords} onClick={nextStep} sx={{ py: 2, borderRadius: '18px' }}>Davom etish</Button>
                        </Stack>
                    </Fade>
                );

            case 2:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight="800" textAlign="center">Qabul qiluvchi</Typography>
                            <TextField fullWidth label="F.I.O" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} onChange={(e) => setFormData({ ...formData, receiverFIO: e.target.value })} />
                            <TextField fullWidth label="Telefon" value={formData.receiverPhone}
                                       onChange={(e) => setFormData({ ...formData, receiverPhone: formatPhoneNumber(e.target.value) })}
                                       sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }}
                            />
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ py: 2, borderRadius: '15px' }}>
                                {formData.passportImg ? "✅ Pasport yuklandi" : "Pasport rasmini yuklang"}
                                <input type="file" hidden onChange={(e) => setFormData({ ...formData, passportImg: e.target.files[0] })} />
                            </Button>
                            <Button fullWidth variant="contained" onClick={nextStep} disabled={!formData.receiverFIO || formData.receiverPhone.length < 18 || !formData.passportImg} sx={{ py: 2, borderRadius: '18px' }}>Davom etish</Button>
                        </Stack>
                    </Fade>
                );

            case 3:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight="800" textAlign="center">Xavfsizlik</Typography>
                            <Alert severity="warning" sx={{ borderRadius: '15px' }}>Suyuqlik va kukunlar taqiqlanadi!</Alert>
                            <Button variant={formData.isSafe ? "contained" : "outlined"} color="success" fullWidth onClick={() => setFormData({ ...formData, isSafe: true })} sx={{ borderRadius: '15px', py: 2 }}>Tasdiqlayman</Button>
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ py: 2, borderRadius: '15px' }}>
                                {formData.itemsImg ? "✅ Ro'yxat yuklandi" : "Yuklar rasmi"}
                                <input type="file" hidden onChange={(e) => setFormData({ ...formData, itemsImg: e.target.files[0] })} />
                            </Button>
                            <TextField fullWidth label="Telegram yoki Tel" onChange={(e) => setFormData({ ...formData, contact: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
                            <Button fullWidth variant="contained" onClick={nextStep} disabled={!formData.isSafe || !formData.itemsImg || !formData.contact} sx={{ py: 2, borderRadius: '18px' }}>Invoys</Button>
                        </Stack>
                    </Fade>
                );

            case 4:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Paper sx={{ p: 3, borderRadius: '25px', bgcolor: '#f0f4ff' }}>
                                <Typography variant="h6" fontWeight="900" textAlign="center">NURI CARGO INVOICE</Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box display="flex" justifyContent="space-between"><Typography>Vazn:</Typography><Typography fontWeight="700">{formData.weight} kg</Typography></Box>
                                <Box display="flex" justifyContent="space-between" mt={1}><Typography fontWeight="800">JAMI:</Typography><Typography variant="h6" color="primary">{priceUSD}$ + {serviceFeeTL} TL</Typography></Box>
                            </Paper>
                            <Stack direction="row" spacing={2}>
                                <Button fullWidth variant="contained" color="success" disabled={isSubmitting} onClick={() => sendToTelegram('cash')} sx={{ py: 2, borderRadius: '15px' }}>
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "💵 Naqd"}
                                </Button>
                                <Button fullWidth variant="contained" color="primary" disabled={isSubmitting} onClick={() => sendToTelegram('card')} sx={{ py: 2, borderRadius: '15px' }}>
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "💳 Karta"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Fade>
                );

            case 5:
                return (
                    <Zoom in><Box textAlign="center">
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="900">Tayyor!</Typography>
                        <Button fullWidth variant="outlined" sx={{ mt: 4, borderRadius: '15px' }} onClick={() => window.location.reload()}>Yangi buyurtma</Button>
                    </Box></Zoom>
                );
            default: return null;
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2, mb: 5, px: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
            <Paper elevation={10} sx={{ p: { xs: 3, md: 5 }, borderRadius: '35px' }}>
                {renderStep()}
                {activeStep > 0 && activeStep < 4 && !isSubmitting && (
                    <Button onClick={prevStep} sx={{ mt: 2, fontWeight: 'bold', color: 'text.secondary' }}>← Orqaga</Button>
                )}
            </Paper>
        </Box>
    );
}