import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#405DE6', // インスタグラムライクな青
      light: '#5B67CA',
      dark: '#3A4FB7'
    },
    secondary: {
      main: '#C13584', // インスタグラムのピンク
      light: '#DD2A7B',
      dark: '#B93070'
    },
    background: {
      default: '#FAFAFA', // インスタグラムのライトグレー
      paper: '#FFFFFF'
    },
    text: {
      primary: '#262626', // インスタグラムのダークグレー
      secondary: '#8E8E8E'
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px'
        }
      }
    }
  }
});

export default theme;