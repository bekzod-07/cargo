import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1a237e', // To'q ko'k - Cargo uchun ishonch ramzi
        },
        secondary: {
            main: '#f57c00', // To'q sariq - Tezkorlik ramzi
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    },
});