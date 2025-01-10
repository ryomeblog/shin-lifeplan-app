import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ExpenseGroupModal = ({ open, handleClose, group }) => {
  if (!group) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">支出グループ: {group.name}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {group.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>グループ詳細</Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="総支出額"
              secondary={`${group.totalAmount?.toLocaleString()}円`}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="支出全体に対する割合"
              secondary={`${group.percentageOfTotal}%`}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>含まれるカテゴリ</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {group.categories?.map((category, index) => (
            <Chip
              key={index}
              label={category}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>

        {group.note && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">備考</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {group.note}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ExpenseGroupModal;