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
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SendIcon from '@mui/icons-material/Send';

// Leaflet Marker fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const steps = ['Hudud', 'Yuk', 'Qabul qiluvchi', 'Xavfsizlik', 'To‘lov'];

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

// 1. Xarita boshqaruvi uchun yordamchi komponent
    function MapController({ coords }) {
        const map = useMapEvents({
            click(e) {
                setFormData(prev => ({ ...prev, coords: [e.latlng.lat, e.latlng.lng] }));
            },
        });

        // Agar koordinata o'zgarsa, xarita o'sha yerga silliq siljiydi
        React.useEffect(() => {
            if (coords) {
                map.flyTo(coords, 16, { animate: true, duration: 1.5 });
            }
        }, [coords, map]);

        return formData.coords ? <Marker position={formData.coords} /> : null;
    }




// 2. GPS aniqlash funksiyasi (animatsiya bilan)
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
                alert("Lokatsiyani aniqlashga ruxsat berilmadi yoki xatolik yuz berdi.");
            },
            { enableHighAccuracy: true }
        );
    };

const sendToGoogleSheets = async (paymentMethod) => {
        // DIQQAT: Bu yerga jadval linki emas, Apps Script'dan olingan Web App URL qo'yiladi!
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoYKVg7PPw_mxvc0K3KD-DXD2oMiF2F47c5Ctr4k_dpBw1mBRwe_4bEXDDBMypwlhkEQ/exec';

        const sheetData = {
            district: formData.district,
            weight: formData.weight,
            coords: formData.coords ? formData.coords.join(', ') : "Belgilanmagan",
            receiverFIO: formData.receiverFIO,
            receiverPhone: formData.receiverPhone,
            contact: formData.contact,
            paymentMethod: paymentMethod === 'cash' ? 'Naqd' : 'Karta',
            totalPrice: `${formData.weight * 8}$ + 400 TL`
        };

        try {
            // mode: 'no-cors' ishlatilganda fetch javob qaytarmaydi, lekin ma'lumot yetib boradi
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sheetData)
            });
            console.log("Google Sheets-ga yuborildi");
        } catch (error) {
            console.error("Sheets xatolik:", error);
        }
    };

    const sendToTelegram = async (paymentMethod) => {
        setIsSubmitting(true);
        
        // Google Sheets-ga yuborishni chaqiramiz
        await sendToGoogleSheets(paymentMethod);

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
🗺 <b>Lokatsiya:</b> <a href="${mapLink}">📍 Xaritada ko'rish</a>

👤 <b>QABUL QILUVCHI</b>
▪️ <b>F.I.O:</b> ${formData.receiverFIO}
▪️ <b>Telefon:</b> ${formData.receiverPhone}

🛡 <b>XAVFSIZLIK VA BOG'LANISH</b>
▪️ <b>Mijoz aloqa:</b> ${formData.contact}
▪️ <b>Holati:</b> Tekshirilgan va tasdiqlangan ✅

💳 <b>TO'LOV MA'LUMOTI</b>
▪️ <b>Usul:</b> ${paymentMethod === 'cash' ? '💵 Naqd' : '💳 Karta'}
▪️ <b>Jami summa:</b> ${formData.weight * 8}$ + 400 TL
━━━━━━━━━━━━━━━━━━━━━━`;

        try {
            // Telegram matnini yuborish
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: textMessage,
                    parse_mode: 'HTML',
                })
            });

            // Rasmlarni yuborish (Pasport)
            if (formData.passportImg) {
                const pData = new FormData();
                pData.append('chat_id', CHAT_ID);
                pData.append('photo', formData.passportImg);
                pData.append('caption', `👤 Pasport: ${formData.receiverFIO}`);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: pData });
            }

            // Rasmlarni yuborish (Yuklar)
            if (formData.itemsImg) {
                const iData = new FormData();
                iData.append('chat_id', CHAT_ID);
                iData.append('photo', formData.itemsImg);
                iData.append('caption', `📦 Yuklar ro'yxati`);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: iData });
            }

            nextStep();
        } catch (error) {
            alert("Xatolik yuz berdi!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = async (method) => {
        setFormData({ ...formData, paymentMethod: method });
        await sendToTelegram(method);
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
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Logistika va tezkor xizmat uchun hududingizni tanlang.
                                </Typography>
                            </Box>
                            <Stack spacing={2} sx={{ px: { xs: 0, sm: 2 } }}>
                                {['Selçuklu', 'Meram', 'Karatay'].map((dist) => (
                                    <Button
                                        key={dist} variant={formData.district === dist ? "contained" : "outlined"} size="large"
                                        onClick={() => setFormData({ ...formData, district: dist })}
                                        sx={{
                                            py: 2, borderRadius: '20px', fontWeight: '800', fontSize: '1.1rem',
                                            borderWidth: formData.district === dist ? 0 : 2,
                                            boxShadow: formData.district === dist ? '0 8px 25px rgba(25, 118, 210, 0.3)' : 'none',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { borderWidth: formData.district === dist ? 0 : 2, transform: 'translateY(-2px)' }
                                        }}
                                    >📍 {dist}</Button>
                                ))}
                            </Stack>
                            <Button fullWidth variant="contained" disabled={!formData.district} onClick={nextStep} sx={{ py: 2, borderRadius: '18px', fontWeight: '800', mt: 2 }}>Davom etish</Button>
                        </Stack>
                    </Fade>
                );

            case 1: // Yuk va Lokatsiya
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={4}>
                            {/* Og'irlik qismi (o'zgarishsiz qolishi mumkin) */}
                            <Box sx={{ textAlign: 'center' }}>
                                <ScaleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h5" fontWeight="800">Yuk va Manzil</Typography>
                            </Box>

                            <Box sx={{ px: 2 }}>
                                <Typography gutterBottom fontWeight="600">Og'irlik: {formData.weight} kg</Typography>
                                <Slider
                                    value={formData.weight} min={10} max={200}
                                    onChange={(e, val) => setFormData({ ...formData, weight: val })}
                                    sx={{ mb: 2 }}
                                />
                            </Box>

                            <Divider sx={{ fontWeight: 'bold', color: 'primary.main' }}>LOKATSIYANI BELGILANG</Divider>

                            {/* XARITA BLOKI */}
                            <Box sx={{ position: 'relative', height: 300, borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '2px solid #fff' }}>
                                <MapContainer center={[37.8713, 32.4846]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController coords={formData.coords} />
                                </MapContainer>

                                {/* Xarita ustidagi yordamchi yozuv */}
                                {!formData.coords && (
                                    <Box sx={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, bgcolor: 'rgba(255,255,255,0.9)', px: 2, py: 0.5, borderRadius: '10px', pointerEvents: 'none' }}>
                                        <Typography variant="caption" fontWeight="bold">Xaritadan tanlang yoki GPS bosing</Typography>
                                    </Box>
                                )}
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                startIcon={loadingMap ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                                onClick={getGPS}
                                sx={{
                                    borderRadius: '15px',
                                    py: 1.8,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 15px rgba(33, 203, 243, .3)'
                                }}
                            >
                                {formData.coords ? "Joylashuv yangilandi ✅" : "Hozirgi joyimni aniqlash"}
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                disabled={formData.weight < 10 || !formData.coords}
                                onClick={nextStep}
                                sx={{ py: 2, borderRadius: '18px', fontWeight: '800' }}
                            >
                                Davom etish
                            </Button>
                        </Stack>
                    </Fade>
                );

            case 2:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight="800" textAlign="center">Qabul qiluvchi ma'lumotlari</Typography>
                            <TextField fullWidth label="F.I.O (To'liq)" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} onChange={(e) => setFormData({ ...formData, receiverFIO: e.target.value })} />
                            <TextField fullWidth label="O'zbekiston telefon raqami" value={formData.receiverPhone} placeholder="+998 (90) 123-45-67"
                                       InputProps={{ startAdornment: <InputAdornment position="start">🇺🇿</InputAdornment> }}
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
                            <Button fullWidth variant="contained" onClick={nextStep} disabled={!formData.receiverFIO || formData.receiverPhone.length < 19 || !formData.passportImg} sx={{ py: 2, borderRadius: '18px', fontWeight: '800' }}>Davom etish</Button>
                        </Stack>
                    </Fade>
                );

            case 3:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight="800" textAlign="center">Xavfsizlik tekshiruvi</Typography>
                            <Alert severity="warning" sx={{ borderRadius: '15px' }}>Suyuqlik, kukun va batareyalar taqiqlanadi!</Alert>
                            <Button variant={formData.isSafe ? "contained" : "outlined"} color="success" fullWidth onClick={() => setFormData({ ...formData, isSafe: true })} sx={{ borderRadius: '15px', py: 1.5 }}>Tasdiqlayman</Button>
                            <Paper variant="outlined" sx={{ p: 2, borderStyle: 'dashed', borderRadius: '15px', textAlign: 'center' }}>
                                <Button component="label" startIcon={<CloudUploadIcon />}>
                                    {formData.itemsImg ? "✅ Ro'yxat yuklandi" : "Yuklar ro'yxati (Rasm)"}
                                    <input type="file" hidden accept="image/*" onChange={(e) => setFormData({ ...formData, itemsImg: e.target.files[0] })} />
                                </Button>
                            </Paper>
                            <TextField fullWidth label="Telegram yoki Tel" placeholder="@username" onChange={(e) => setFormData({ ...formData, contact: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '15px' } }} />
                            <Button fullWidth variant="contained" onClick={nextStep} disabled={!formData.isSafe || !formData.itemsImg || !formData.contact} sx={{ py: 2, borderRadius: '18px', fontWeight: '800' }}>Hisob-faktura</Button>
                        </Stack>
                    </Fade>
                );

            case 4:
                return (
                    <Fade in timeout={500}>
                        <Stack spacing={3}>
                            <Paper sx={{ p: 3, borderRadius: '25px', background: 'linear-gradient(135deg, #f0f4ff 0%, #d9e2ff 100%)' }}>
                                <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <ReceiptLongIcon color="primary" />
                                    <Typography variant="h6" fontWeight="900">NURI CARGO INVOICE</Typography>
                                </Stack>
                                <Divider sx={{ my: 1.5 }} />
                                <Box display="flex" justifyContent="space-between"><Typography>Hudud:</Typography><Typography fontWeight="700">{formData.district}</Typography></Box>
                                <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}><Typography>Vazn:</Typography><Typography fontWeight="700">{formData.weight} kg</Typography></Box>
                                <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}><Typography fontWeight="800">JAMI:</Typography><Typography variant="h5" fontWeight="900" color="primary">{priceUSD}$ + {serviceFeeTL} TL</Typography></Box>
                            </Paper>

                            <Stack direction="row" spacing={2}>
                                <Button fullWidth variant="contained" color="success" disabled={isSubmitting} onClick={() => handleComplete('cash')} sx={{ py: 2, borderRadius: '15px', fontWeight: 'bold' }}>
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "💵 Naqd"}
                                </Button>
                                <Button fullWidth variant="contained" color="primary" disabled={isSubmitting} onClick={() => handleComplete('card')} sx={{ py: 2, borderRadius: '15px', fontWeight: 'bold' }}>
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "💳 Karta"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Fade>
                );

            case 5:
                return (
                    <Zoom in>
                        <Box textAlign="center">
                            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="900">Tayyor!</Typography>
                            <Typography sx={{ mt: 2, mb: 4 }}>Ma'lumotlaringiz muvaffaqiyatli yuborildi. Kuryerimiz tez orada siz bilan bog'lanadi.</Typography>
                            <Button fullWidth variant="outlined" endIcon={<SendIcon />} sx={{ py: 1.5, borderRadius: '15px', fontWeight: 'bold' }} onClick={() => window.location.reload()}>
                                Yangi buyurtma
                            </Button>
                        </Box>
                    </Zoom>
                );

            default: return null;
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2, mb: 5 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                    <Step key={label} completed={activeStep > index}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper elevation={0} sx={{
                p: { xs: 3, md: 5 }, borderRadius: '35px',
                bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                {renderStep()}

                {activeStep > 0 && activeStep < 4 && !isSubmitting && (
                    <Button onClick={prevStep} sx={{ mt: 3, textTransform: 'none', fontWeight: 'bold', color: 'text.secondary' }}>
                        ← Orqaga
                    </Button>
                )}
            </Paper>
        </Box>
    );
}