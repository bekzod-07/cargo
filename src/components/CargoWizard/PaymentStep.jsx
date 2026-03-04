import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Paper, Typography } from '@mui/material';
import WeightStep from './WeightStep';
import ReceiverStep from './ReceiverStep';
import ForbiddenStep from './ForbiddenStep';
import SummaryStep from './SummaryStep';
import PaymentStep from './PaymentStep';

const steps = ['Og‘irlik', 'Qabul qiluvchi', 'Xavfsizlik', 'Kvitansiya', 'To‘lov'];

const CargoWizard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        weight: 10,
        location: null,
        receiverName: '',
        receiverPhone: '',
        passportImg: null,
        isSafe: null,
        itemsImg: null,
        senderContact: '',
        paymentMethod: ''
    });

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const updateData = (newData) => {
        setFormData((prev) => ({ ...prev, ...newData }));
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0: return <WeightStep data={formData} update={updateData} onNext={handleNext} />;
            case 1: return <ReceiverStep data={formData} update={updateData} onNext={handleNext} />;
            case 2: return <ForbiddenStep data={formData} onNext={handleNext} />;
            case 3: return <SummaryStep data={formData} onNext={handleNext} />;
            case 4: return <PaymentStep data={formData} />;
            default: return 'Nomalum sahifa';
        }
    };

    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>
            <Box sx={{ mt: 4 }}>
                {getStepContent(activeStep)}
            </Box>
        </Box>
    );
};

export default CargoWizard;