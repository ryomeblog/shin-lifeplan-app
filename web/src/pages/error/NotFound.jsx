import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Container,
  Paper,
  Typography 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { BASE_PATH } from '../../config/constants';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '50%',
              width: 96,
              height: 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: 3
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 48, color: '#757575' }} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            404
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ marginBottom: 2 }}
          >
            お探しのページが見つかりません
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ marginBottom: 4 }}
          >
            このページは削除されたか、URLが間違っている可能性があります。
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate(`${BASE_PATH}/`)}
            fullWidth
            sx={{
              padding: '12px',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            ホームに戻る
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;