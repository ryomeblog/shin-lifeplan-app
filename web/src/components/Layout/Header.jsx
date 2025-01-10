import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { THEME_COLORS, getTitleDecorations } from '../../assets/styles/modeStyles';
import { BASE_PATH } from "../../config/constants";

function Header({ onMenuClick, mode = 'simple' }) {
  const navigate = useNavigate();
  const colors = THEME_COLORS[mode];
  const [prefix, suffix] = getTitleDecorations(mode);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: colors.surface,
        boxShadow: `0 2px 4px ${colors.shadow}`,
        borderBottom: mode === 'cute' ? `2px solid ${colors.accent}` : 'none',
      }}
    >
      <Toolbar>
        <IconButton
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            color: colors.primary,
            '&:hover': {
              backgroundColor: colors.hover,
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            color: colors.primary,
            fontWeight: 'bold',
            ...(mode === 'cute' && {
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            })
          }}
          onClick={() => navigate(`${BASE_PATH}/`)}
        >
          {prefix}Life Plan App{suffix}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;