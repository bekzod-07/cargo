import { Paper, Typography, Divider, Button, Stack } from '@mui/material';

const SummaryStep = ({ data, onNext }) => {
    const priceUSD = data.weight * 8;
    const serviceFeeTL = 400;

    return (
        <Paper elevation={6} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom color="primary">📄 BUYURTMA MA’LUMOTI</Typography>
            <Divider sx={{ my: 1 }} />

            <Stack spacing={1} sx={{ my: 2 }}>
                <Typography><b>Og‘irlik:</b> {data.weight} kg</Typography>
                <Typography><b>Manzil:</b> {localStorage.getItem('user_region')}</Typography>
                <Typography variant="h5" color="secondary" sx={{ mt: 2 }}>
                    Narx: {priceUSD}$ + {serviceFeeTL} TL
                </Typography>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="contained" color="success" onClick={() => onNext('cash')}>💵 Naqd</Button>
                <Button variant="contained" color="primary" onClick={() => onNext('card')}>💳 Karta</Button>
            </Stack>
        </Paper>
    );
};
export default SummaryStep;