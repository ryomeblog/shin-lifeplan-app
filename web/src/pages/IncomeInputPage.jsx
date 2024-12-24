import React, { useState } from 'react';
import { 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Paper,
  MenuItem
} from '@mui/material';

const incomeTypes = [
  { value: 'interest', label: '利子所得' },
  { value: 'dividend', label: '配当所得' },
  { value: 'realEstate', label: '不動産所得' },
  { value: 'business', label: '事業所得' },
  { value: 'salary', label: '給与所得' },
  { value: 'retirement', label: '退職所得' },
  { value: 'forestry', label: '山林所得' },
  { value: 'transfer', label: '譲渡所得' },
  { value: 'temporary', label: '一時所得' },
  { value: 'miscellaneous', label: '雑所得' }
];

function IncomeInputPage() {
  const [incomeType, setIncomeType] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const handleInputChange = (event) => {
    // カンマ区切りの数値入力処理
    const value = event.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      setIncomeAmount(value.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const cleanedAmount = incomeAmount.replace(/,/g, '');
    const incomeData = {
      type: incomeType,
      amount: parseFloat(cleanedAmount)
    };

    console.log('収入データ:', incomeData);
    // TODO: バックエンドに送信または状態管理に保存
  };

  return (
    <Grid 
      container 
      justifyContent="center" 
      alignItems="center" 
      spacing={2}
    >
      <Grid item xs={12} sm={8} md={6}>
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2 
          }}
        >
          <Typography variant="h5" align="center">
            収入入力
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="収入の種類"
                  value={incomeType}
                  onChange={(e) => setIncomeType(e.target.value)}
                  variant="outlined"
                  required
                >
                  {incomeTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="収入金額"
                  variant="outlined"
                  value={incomeAmount}
                  onChange={handleInputChange}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9,]*'
                  }}
                  required
                  helperText="カンマ区切りで入力してください"
                />
              </Grid>

              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                >
                  収入を登録
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default IncomeInputPage;