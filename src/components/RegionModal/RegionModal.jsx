import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, Typography, Stack,
    Button, Box, Zoom
} from '@mui/material';
import { motion } from 'framer-motion';

// Premium Ikonkalar
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const regions = [
    {
        id: 'selcuklu',
        name: 'Selçuklu',
        icon: <BusinessCenterIcon sx={{ fontSize: 28 }} />,
        color: '#6366f1',
        desc: 'Markaziy biznes va zamonaviy hayot'
    },
    {
        id: 'meram',
        name: 'Meram',
        icon: <NaturePeopleIcon sx={{ fontSize: 28 }} />,
        color: '#10b981',
        desc: 'Yashil hudud va sokin tabiat'
    },
    {
        id: 'karatay',
        name: 'Karatay',
        icon: <PrecisionManufacturingIcon sx={{ fontSize: 28 }} />,
        color: '#f59e0b',
        desc: 'Sanoat markazi va tarixiy obidalar'
    }
];

const RegionModal = ({ onSelect }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const sessionRegion = sessionStorage.getItem('user_region_session');
        if (!sessionRegion) {
            setOpen(true);
        }
    }, []);

    const handleSelect = (regionId) => {
        sessionStorage.setItem('user_region_session', regionId);
        if (onSelect) onSelect(regionId);
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Zoom}
            PaperProps={{
                sx: {
                    borderRadius: '28px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }
            }}
        >
            <DialogContent sx={{ p: 4 }}>
                <Stack alignItems="center" spacing={3}>

                    {/* Premium Animatsion Logo */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Box sx={{
                            p: 2,
                            borderRadius: '22px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: 'white',
                            display: 'flex',
                            boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.4)'
                        }}>
                            <RocketLaunchIcon sx={{ fontSize: 40 }} />
                        </Box>
                    </motion.div>

                    <Box textAlign="center">
                        <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-0.5px' }}>
                            Xush Kelibsiz!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 1 }}>
                            Kargo xizmatidan foydalanish uchun hududingizni tanlang
                        </Typography>
                    </Box>

                    <Stack spacing={2} width="100%">
                        {regions.map((region) => (
                            <motion.div
                                key={region.id}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    fullWidth
                                    onClick={() => handleSelect(region.id)}
                                    sx={{
                                        p: 2.5,
                                        justifyContent: 'flex-start',
                                        borderRadius: '20px',
                                        background: 'rgba(255, 255, 255, 0.6)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'white',
                                            borderColor: region.color,
                                            boxShadow: `0 12px 20px -8px ${region.color}40`
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: '14px',
                                        bgcolor: `${region.color}10`,
                                        color: region.color,
                                        display: 'flex',
                                        mr: 2.5,
                                        border: `1px solid ${region.color}20`
                                    }}>
                                        {region.icon}
                                    </Box>
                                    <Box textAlign="left">
                                        <Typography variant="subtitle1" fontWeight="800" color="#1e293b" sx={{ lineHeight: 1.1 }}>
                                            {region.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            {region.desc}
                                        </Typography>
                                    </Box>
                                </Button>
                            </motion.div>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default RegionModal;