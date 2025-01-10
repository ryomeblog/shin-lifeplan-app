import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const ExpenseInputModal = ({
  open,
  handleClose,
  initialData = null,
  onSubmit,
  paymentCategoryList,
}) => {
  const defaultFormData = {
    name: "",
    payment: 0,
    category: "",
    group: "",
    monthly: 1,
    durationType: "lifetime",
    endDate: null,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  // モーダルが開くたびにフォームデータを更新
  useEffect(() => {
    console.log("initialData:", JSON.stringify(initialData));
    if (open) {
      setFormData(initialData || defaultFormData);
      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "支出名は必須です";
    if (!formData.payment || formData.payment <= 0)
      newErrors.payment = "有効な金額を入力してください";
    if (!formData.category) newErrors.category = "カテゴリを選択してください";
    if (!formData.monthly || formData.monthly <= 0)
      newErrors.monthly = "有効な頻度を入力してください";
    if (formData.durationType === "date" && !formData.endDate)
      newErrors.endDate = "終了日を選択してください";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]:
        field === "payment" || field === "monthly" ? Number(value) : value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  // モーダルを閉じる際にフォームをリセット
  const handleModalClose = () => {
    handleClose();
    setFormData(defaultFormData);
    setErrors({});
  };

  return (
    <Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "支出の編集" : "新規支出の追加"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="支出名"
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="年間支出金額"
            type="number"
            value={formData.payment}
            onChange={handleChange("payment")}
            error={!!errors.payment}
            helperText={errors.payment}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">円</InputAdornment>,
            }}
          />

          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange("category")}
              label="カテゴリ"
            >
              {paymentCategoryList.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="頻度（月）"
            type="number"
            value={formData.monthly}
            onChange={handleChange("monthly")}
            error={!!errors.monthly}
            helperText={errors.monthly}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">ヶ月</InputAdornment>
              ),
            }}
          />

          <FormControl component="fieldset">
            <RadioGroup
              row
              value={formData.durationType}
              onChange={handleChange("durationType")}
            >
              <FormControlLabel
                value="lifetime"
                control={<Radio />}
                label="一生"
              />
              <FormControlLabel
                value="date"
                control={<Radio />}
                label="日付指定"
              />
            </RadioGroup>
          </FormControl>

          {formData.durationType === "date" && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="日付"
                value={formData.endDate}
                onChange={(newValue) => {
                  setFormData({
                    ...formData,
                    endDate: newValue,
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                    fullWidth
                  />
                )}
              />
            </LocalizationProvider>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? "更新" : "追加"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseInputModal;
