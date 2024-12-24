import React, { useState } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LifePlanCreatePage() {
  const [planName, setPlanName] = useState('');
  const [inflationRate, setInflationRate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!planName || !inflationRate) {
      alert('すべての項目を入力してください');
      return;
    }

    const newLifePlan = {
      name: planName,
      inflationRate: parseFloat(inflationRate)
    };

    // TODO: バックエンドに送信または状態管理に保存
    console.log('新しいライフプラン:', newLifePlan);

    // ホーム画面に戻る
    navigate('/');
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
            新しいライフプランの作成
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ライフプラン名"
                  variant="outlined"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="年間インフレ率 (%)"
                  variant="outlined"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  inputProps={{
                    min: 0,
                    step: 0.1
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                >
                  ライフプラン作成
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LifePlanCreatePage;