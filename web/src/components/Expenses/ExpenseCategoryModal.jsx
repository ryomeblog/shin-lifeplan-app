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

const ExpenseCategoryModal = ({ open, handleClose, category }) => {
  if (!category) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">カテゴリ: {category.name}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          {category.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>カテゴリ詳細</Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="予算割合"
              secondary={`${category.budgetPercentage}%`}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="月間予算上限"
              secondary={`${category.monthlyBudget?.toLocaleString()}円`}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="関連支出項目数"
              secondary={category.expenseCount}
            />
          </ListItem>
        </List>

        {category.note && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">備考</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {category.note}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ExpenseCategoryModal;