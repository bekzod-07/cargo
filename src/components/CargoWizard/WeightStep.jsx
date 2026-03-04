import { TextField, Button, Stack, Alert } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

const WeightStep = ({ data, update, onNext }) => {
    const error = data.weight < 10;

    return (
        <Stack spacing={3} alignItems="center">
            <TextField
                label="Yuk og‘irligi (kg)"
                type="number"
                fullWidth
                value={data.weight}
                onChange={(e) => update({ weight: parseInt(e.target.value) || 0 })}
                error={error}
                helperText={error ? "Minimal og'irlik 10 kg bo'lishi shart" : ""}
            />

            <Button
                variant="outlined"
                color={data.location ? "success" : "primary"}
                startIcon={<MyLocationIcon />}
                onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        update({ location: pos.coords });
                        alert("Lokatsiya saqlandi!");
                    });
                }}
            >
                {data.location ? "📍 Lokatsiya yuborildi" : "📍 Lokatsiya yuborish"}
            </Button>

            <Button
                variant="contained"
                disabled={error || !data.location}
                onClick={onNext}
            >
                Davom etish
            </Button>
        </Stack>
    );
};
export default WeightStep;