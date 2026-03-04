import React, { useState } from 'react';
import {
    Box, Stepper, Step, StepLabel, Button, Typography,
    TextField, Stack, Paper, Divider, Alert
} from '@mui/material'; // IconButton bu yerdan olib tashlandi
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const steps = ['Og‘irlik', 'Qabul qiluvchi', 'Xavfsizlik', 'Kvitansiya', 'To‘lov'];

export default function CargoWizard({ region }) {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        weight: 10,
        location: null,
        receiverFIO: '',
        receiverPhone: '+998',
        passportImg: null,
        isSafe: null,
        itemsImg: null,
        contact: '',
        paymentMethod: ''
    });

    const nextStep = () => setActiveStep((prev) => prev + 1);
    const prevStep = () => setActiveStep((prev) => prev - 1);

    // 9-qadam mantiqi: Formula (kg * 8$) + 400 TL
    const priceUSD = formData.weight * 8;
    const serviceFeeTL = 400;

    const renderStep = () => {
        switch (activeStep) {
            case 0: // 4-qadam: Og'irlik va Location
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight="600">Yuk og'irligini kiriting</Typography>
                        <TextField
                            label="Og'irlik (kg)" type="number" fullWidth
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                            error={formData.weight < 10}
                            helperText={formData.weight < 10 ? "Minimal 10 kg bo'lishi shart" : "Kargo uchun minimal limit 10 kg"}
                        />
                        <Button
                            variant="outlined" startIcon={<MyLocationIcon />}
                            color={formData.location ? "success" : "primary"}
                            onClick={() => {
                                navigator.geolocation.getCurrentPosition(p => {
                                    setFormData({...formData, location: p.coords});
                                    alert("GPS koordinatalar saqlandi!");
                                });
                            }}
                            sx={{ borderRadius: '10px', py: 1.5 }}
                        >
                            {formData.location ? "📍 Lokatsiya yuborildi" : "📍 Lokatsiya yuborish (Majburiy)"}
                        </Button>
                        <Button
                            variant="contained"
                            disabled={formData.weight < 10 || !formData.location}
                            onClick={nextStep}
                            sx={{ py: 1.5, borderRadius: '10px' }}
                        >
                            Davom etish
                        </Button>
                    </Stack>
                );

            case 1: // 5-qadam: Qabul qiluvchi
                return (
                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight="600">O'zbekistondagi qabul qiluvchi</Typography>
                        <TextField label="F.I.O" fullWidth onChange={(e) => setFormData({...formData, receiverFIO: e.target.value})} />
                        <TextField label="Telefon" fullWidth value={formData.receiverPhone} onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})} />
                        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} color="secondary">
                            Pasport rasmini yuklash
                            <input type="file" hidden accept="image/*" onChange={(e) => setFormData({...formData, passportImg: e.target.files[0]})} />
                        </Button>
                        {formData.passportImg && <Alert severity="info">Rasm: {formData.passportImg.name}</Alert>}
                        <Button variant="contained" onClick={nextStep} disabled={!formData.receiverFIO || !formData.passportImg}>Davom etish</Button>
                    </Stack>
                );

            case 2: // 6, 7, 8-qadamlar: Xavfsizlik
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight="600">Xavfsizlik va Ma'lumotlar</Typography>
                        <Typography variant="body2" color="text.secondary">Taqiqlangan buyum yo'qligiga ishonchingiz komilmi?</Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant={formData.isSafe ? "contained" : "outlined"}
                                color="success" fullWidth onClick={() => setFormData({...formData, isSafe: true})}
                                startIcon={<CheckCircleIcon />}
                            > Ha </Button>
                            <Button
                                variant="outlined" color="error" fullWidth
                                onClick={() => alert("Taqiqlangan buyum bilan buyurtma qabul qilinmaydi!")}
                                startIcon={<CancelIcon />}
                            > Yo'q </Button>
                        </Stack>

                        <Divider />
                        <Typography variant="body2">Yuk ichidagi mahsulotlar ro'yxati (Rasm):</Typography>
                        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                            Ro'yxatni yuklash
                            <input type="file" hidden accept="image/*" onChange={(e) => setFormData({...formData, itemsImg: e.target.files[0]})} />
                        </Button>

                        <TextField label="Telegram username yoki Tel" fullWidth onChange={(e) => setFormData({...formData, contact: e.target.value})} />

                        <Button variant="contained" onClick={nextStep} disabled={!formData.isSafe || !formData.itemsImg || !formData.contact}>Tasdiqlash</Button>
                    </Stack>
                );

            case 3: // 9-qadam: Kvitansiya
                return (
                    <Paper elevation={0} sx={{ p: 3, border: '2px dashed #1a237e', borderRadius: 4, bgcolor: '#f0f4ff' }}>
                        <Typography variant="h5" textAlign="center" fontWeight="800" gutterBottom>📄 BUYURTMA</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={1.5}>
                            <Typography><b>Hudud:</b> {region}</Typography>
                            <Typography><b>Og'irlik:</b> {formData.weight} kg</Typography>
                            <Typography variant="h5" color="primary" sx={{ mt: 2, fontWeight: '700' }}>
                                Jami: {priceUSD}$ + {serviceFeeTL} TL
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                            <Button fullWidth variant="contained" color="success" onClick={() => { setFormData({...formData, paymentMethod: 'cash'}); nextStep(); }}>💵 Naqd</Button>
                            <Button fullWidth variant="contained" color="primary" onClick={() => { setFormData({...formData, paymentMethod: 'card'}); nextStep(); }}>💳 Karta</Button>
                        </Stack>
                    </Paper>
                );

            case 4: // 10-qadam: To'lov
                return (
                    <Box textAlign="center">
                        {formData.paymentMethod === 'cash' ? (
                            <Box>
                                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="700">Buyurtma qabul qilindi!</Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    Ertaga kargo xodimimiz manzilga boradi. To‘lovni naqd topshirasiz.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                <Typography variant="h6">Bank ma'lumotlari (IBAN)</Typography>
                                <Paper sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ffe0b2' }}>
                                    <Typography variant="body1"><b>Ism:</b> NURI KARGO</Typography>
                                    <Typography variant="body1"><b>IBAN:</b> TR76 0001 2345 6789 0000 11</Typography>
                                </Paper>
                                <Typography variant="body2">To'lov cheki (Screenshot) yuklang:</Typography>
                                <Button variant="contained" component="label" color="warning">
                                    Chekni yuklash
                                    <input type="file" hidden accept="image/*" />
                                </Button>
                                <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={() => alert("To'lov yuborildi. Tez orada tasdiqlanadi!")}>
                                    Tasdiqlash
                                </Button>
                            </Stack>
                        )}
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map(label => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 5 }}>
                {renderStep()}
                {activeStep > 0 && activeStep < 4 && (
                    <Button onClick={prevStep} sx={{ mt: 2, textTransform: 'none' }} color="inherit">
                        ← Orqaga
                    </Button>
                )}
            </Paper>
        </Box>
    );
}