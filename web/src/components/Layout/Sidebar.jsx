import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { 
  Home as HomeIcon, 
  AddCircle as AddIcon, 
  MonetizationOn as MoneyIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const menuItems = [
    { 
      text: 'ホーム', 
      icon: <HomeIcon />, 
      path: '/' 
    },
    { 
      text: 'ライフプラン作成', 
      icon: <AddIcon />, 
      path: '/create-life-plan' 
    },
    { 
      text: '支出一覧', 
      icon: <MoneyIcon />, 
      path: '/expenses' 
    }
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;