import React, { useState, useEffect } from 'react';
// Ishlatilmagan DialogTitle va IconButton olib tashlandi
import {
    Dialog, DialogContent,
    Typography, Stack, Button, Box
} from '@mui/material';

// Ishlatilmagan LocationOnIcon olib tashlandi
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { motion } from 'framer-motion';

const regions = [
    { id: 'selcuklu', name: 'Selçuklu', icon: '🏢' },
    { id: 'meram', name: 'Meram', icon: '🌳' },
    { id: 'karatay', name: 'Karatay', icon: '🏗️' }
];

const RegionModal = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const savedRegion = localStorage.getItem('user_region');
        if (!savedRegion) {
            setOpen(true);
        }
    }, []);

    const handleSelect = (regionId) => {
        localStorage.setItem('user_region', regionId);
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, padding: '10px' } // MUI'da style o'rniga sx ishlatish tavsiya etiladi
            }}
        >
            <DialogContent>
                <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <Box sx={{
                            bgcolor: 'primary.light',
                            p: 2,
                            borderRadius: '50%',
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <LocalShippingIcon sx={{ fontSize: 40 }} />
                        </Box>
                    </motion.div>

                    <Typography variant="h5" fontWeight="700" textAlign="center">
                        Xush kelibsiz!
                    </Typography>

                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Logistika xizmatini to'g'ri tashkillashtirishimiz uchun hududingizni tanlang:
                    </Typography>

                    <Stack spacing={1.5} width="100%" sx={{ mt: 2 }}>
                        {regions.map((region) => (
                            <Button
                                key={region.id}
                                variant="outlined"
                                size="large"
                                fullWidth
                                startIcon={<span>{region.icon}</span>}
                                onClick={() => handleSelect(region.id)}
                                sx={{
                                    py: 1.5,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    borderWidth: '2px',
                                    '&:hover': {
                                        borderWidth: '2px',
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                    }
                                }}
                            >
                                {region.name}
                            </Button>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default RegionModal;