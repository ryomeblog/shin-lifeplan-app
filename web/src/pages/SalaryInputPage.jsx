import React, { useState } from 'react';
import { 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Paper,
  Divider
} from '@mui/material';

function SalaryInputPage() {
  const [salaryData, setSalaryData] = useState({
    totalSalary: '',
    residentTax: '',
    incomeTax: '',
    employeePension: '',
    healthInsurance: '',
    nursingInsurance: '',
    employmentInsurance: ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // カンマ区切りの数値入力処理
    const cleanValue = value.replace(/,/g, '');
    if (!isNaN(cleanValue)) {
      setSalaryData(prev => ({
        ...prev,
        [name]: cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }));
    }
  };

  const calculateDeductions = () => {
    const total = parseFloat(salaryData.totalSalary.replace(/,/g, '')) || 0;
    
    // デフォルトの税率（概算）
    const deductions = {
      residentTax: Math.round(total * 0.1),
      incomeTax: Math.round(total * 0.2),
      employeePension: Math.round(total * 0.091),
      healthInsurance: Math.round(total * 0.05),
      nursingInsurance: Math.round(total * 0.015),
      employmentInsurance: Math.round(total * 0.003)
    };

    setSalaryData(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(deductions).map(([key, value]) => 
          [key, value.toLocaleString()]
        )
      )
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // 数値のクリーニング
    const cleanedData = Object.fromEntries(
      Object.entries(salaryData).map(([key, value]) => 
        [key, parseFloat(value.replace(/,/g, ''))]
      )
    );

    console.log('給与データ:', cleanedData);
    // TODO: バックエンドに送信または状態管理に保存
  };

  return (
    <Grid 
      container 
      justifyContent="center" 
      alignItems="center" 
      spacing={2}
    >
      <Grid item xs={12} sm={10} md={8}>
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
            給与入力
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="支給総額"
                  name="totalSalary"
                  variant="outlined"
                  value={salaryData.totalSalary}
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
                  variant="contained" 
                  color="secondary"
                  onClick={calculateDeductions}
                  fullWidth
                >
                  概算控除額を計算
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider>税金・保険料</Divider>
              </Grid>

              {[
                { name: 'residentTax', label: '住民税' },
                { name: 'incomeTax', label: '所得税' },
                { name: 'employeePension', label: '厚生年金' },
                { name: 'healthInsurance', label: '健康保険' },
                { name: 'nursingInsurance', label: '介護保険' },
                { name: 'employmentInsurance', label: '雇用保険' }
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.name}>
                  <TextField
                    fullWidth
                    label={item.label}
                    name={item.name}
                    variant="outlined"
                    value={salaryData[item.name]}
                    onChange={handleInputChange}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9,]*'
                    }}
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                >
                  給与情報を登録
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default SalaryInputPage;