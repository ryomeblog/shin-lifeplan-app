import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

function Header({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      color="primary" 
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Life Plan App
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;