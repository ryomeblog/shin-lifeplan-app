import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box
} from '@mui/material';
import { 
  Home as HomeIcon, 
  AddCircle as AddIcon, 
  MonetizationOn as MoneyIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { THEME_COLORS } from '../../assets/styles/modeStyles';
import { BASE_PATH } from "../../config/constants";

function Sidebar({ open, onClose, mode = 'simple' }) {
  const navigate = useNavigate();
  const colors = THEME_COLORS[mode];

  const menuItems = [
    { 
      text: 'ホーム', 
      icon: <HomeIcon />, 
      path: `${BASE_PATH}/`
    },
    { 
      text: 'ライフプラン作成', 
      icon: <AddIcon />, 
      path: `${BASE_PATH}//create-life-plan`
    },
    { 
      text: '支出一覧', 
      icon: <MoneyIcon />, 
      path: `${BASE_PATH}/expenses`
    }
  ];

  const drawerStyles = {
    width: 240,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 240,
      boxSizing: 'border-box',
      backgroundColor: colors.surface,
      borderRight: mode === 'cute' ? `2px solid ${colors.accent}` : 'none',
      paddingTop: '64px',
    },
  };

  const listItemStyles = {
    margin: mode === 'cute' ? '8px' : '4px',
    borderRadius: mode === 'cute' ? '12px' : '4px',
    '&:hover': {
      backgroundColor: colors.hover,
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={drawerStyles}
    >
      <Box sx={{ backgroundColor: colors.surface, height: '100%' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={listItemStyles}
            >
              <ListItemIcon sx={{ color: colors.primary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: colors.primary,
                  ...(mode === 'cute' && {
                    '& .MuiTypography-root': {
                      fontWeight: 'medium',
                    }
                  })
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;