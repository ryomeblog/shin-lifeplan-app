import React, { useState } from "react";
import {
  Typography,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  getStyles,
  COLOR_SCHEMES,
  LABEL_COLORS,
  getTitleDecorations,
  getSubTitleDecorations,
} from "./styles/modeStyles";
import { useNavigate } from 'react-router-dom';

// カスタムラベルコンポーネント
const renderCustomizedLabel = (props, mode) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name } =
    props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentValue = (percent * 100).toFixed(1);

  const labelColor = LABEL_COLORS[mode];

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fill={labelColor}
      style={{
        fontWeight: "bold",
        textShadow: mode === "dark" ? "1px 1px 2px rgba(0,0,0,0.8)" : "none",
      }}
    >
      {`${name} (${percentValue}%)`}
    </text>
  );
};

const sampleExpenses = [
  {
    id: 1,
    name: "食費",
    amount: 50000,
    category: "基礎生活費",
    group: "生活必需品",
  },
  {
    id: 2,
    name: "家賃",
    amount: 100000,
    category: "住宅費",
    group: "生活必需品",
  },
  {
    id: 3,
    name: "通信費",
    amount: 10000,
    category: "通信費",
    group: "生活必需品",
  },
  { id: 4, name: "交通費", amount: 20000, category: "交通費", group: "生活費" },
  { id: 5, name: "娯楽費", amount: 30000, category: "娯楽費", group: "生活費" },
];

function ExpensesPage({ mode = "simple" }) {
    const navigate = useNavigate();
  const [expenses, setExpenses] = useState(sampleExpenses);
  const styles = getStyles(mode);
  const [titleStart, titleEnd] = getTitleDecorations(mode);
  const subTitleDecoration = getSubTitleDecorations(mode);

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const graphData = expenses.map((expense) => ({
    name: expense.name,
    value: expense.amount,
    percentage: ((expense.amount / totalAmount) * 100).toFixed(1),
  }));

  const handleEditExpense = (id) => {
    console.log(`Edit expense with id: ${id}`);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const handleAddExpense = () => {
    navigate("/");
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.title}>
        {titleStart}My Expenses{titleEnd}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.paper}>
            <Typography variant="h6" sx={styles.subTitle} gutterBottom>
              支出カテゴリ別割合{subTitleDecoration}
            </Typography>
            <Typography variant="body2" sx={styles.totalAmount}>
              総支出額: {totalAmount.toLocaleString()}円
            </Typography>
            <Box sx={{ height: 400, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graphData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(props) => renderCustomizedLabel(props, mode)}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {graphData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLOR_SCHEMES[mode][
                            index % COLOR_SCHEMES[mode].length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()}円`}
                    contentStyle={{
                      backgroundColor: mode === "dark" ? "#2D2D2D" : "white",
                      border:
                        mode === "cute"
                          ? "1px solid #FFB6C1"
                          : "1px solid #ccc",
                      borderRadius: mode === "cute" ? "10px" : "4px",
                      color: LABEL_COLORS[mode],
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => value}
                    wrapperStyle={{
                      color: LABEL_COLORS[mode],
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={styles.paper}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={styles.subTitle}>
                支出内訳{subTitleDecoration}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddExpense}
                sx={styles.button}
              >
                支出追加
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader sx={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>項目名</TableCell>
                    <TableCell align="right">金額</TableCell>
                    <TableCell>カテゴリ</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.name}</TableCell>
                      <TableCell align="right">
                        {expense.amount.toLocaleString()}円
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleEditExpense(expense.id)}
                          sx={styles.iconButton}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteExpense(expense.id)}
                          sx={styles.iconButton}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ExpensesPage;
