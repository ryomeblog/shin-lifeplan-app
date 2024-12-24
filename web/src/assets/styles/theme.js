import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // 青
    },
    secondary: {
      main: "#ff4081", // ピンク
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
});

export default theme;
