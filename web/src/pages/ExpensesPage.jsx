import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableSortLabel,
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
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  getStyles,
  COLOR_SCHEMES,
  THEME_COLORS,
  LABEL_COLORS,
  getTitleDecorations,
  getSubTitleDecorations,
  getAccordionStyles,
} from "../assets/styles/modeStyles";
import { useNavigate } from "react-router-dom";
import ExpenseCategoryModal from "../components/Expenses/ExpenseCategoryModal";
import ExpenseGroupModal from "../components/Expenses/ExpenseGroupModal";
import ExpenseInputModal from "../components/Expenses/ExpenseInputModal";

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

function ExpensesPage({
  expenses: allExpensesByYear,
  setExpenses: setAllExpensesByYear,
  paymentCategoryList,
  paymentGroupList,
  mode = "simple",
}) {
  // ナビゲーション
  const navigate = useNavigate();
  // URLパラメータからyearを取得
  const { lifeplanId, year } = useParams();
  // モード別デザイン取得
  const styles = getStyles(mode);

  // 年別支出を取得
  const currentYearData = React.useMemo(
    () =>
      allExpensesByYear.find(
        (yearData) => yearData.year === parseInt(year)
      ) || { year: parseInt(year), expenses: [] },
    [allExpensesByYear, year]
  );

  const [titleStart, titleEnd] = getTitleDecorations(mode);
  const subTitleDecoration = getSubTitleDecorations(mode);

  // 支出カテゴリモーダル
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  // 支出グループモーダル
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  // 支出追加モーダル
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // 複数のアコーディオンの展開状態を管理
  const [expandedPanels, setExpandedPanels] = useState(new Set());

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanels((prev) => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.add(panel);
      } else {
        newSet.delete(panel);
      }
      return newSet;
    });
  };

  // カテゴリごとにグループ化する関数
  const groupedExpenses = React.useMemo(() => {
    const initialGroups = paymentCategoryList.reduce((acc, category) => {
      acc[category] = {
        items: [],
        totalPayment: 0,
      };
      return acc;
    }, {});

    currentYearData.expenses.forEach((expense) => {
      const category = expense.category;
      if (!initialGroups[category]) {
        initialGroups[category] = {
          items: [],
          totalPayment: 0,
        };
      }
      initialGroups[category].items.push(expense);
      initialGroups[category].totalPayment += expense.payment;
    });

    const sortedGroups = paymentCategoryList.map((category) => ({
      category,
      totalPayment: initialGroups[category].totalPayment,
      items: initialGroups[category].items,
    }));

    Object.entries(initialGroups)
      .filter(([category]) => !paymentCategoryList.includes(category))
      .forEach(([category, data]) => {
        sortedGroups.push({
          category,
          totalPayment: data.totalPayment,
          items: data.items,
        });
      });

    return sortedGroups;
  }, [currentYearData.expenses, paymentCategoryList]);

  const handleCategoryClick = (category) => {
    setSelectedCategory({
      name: category,
      description: "このカテゴリは...", // API等から取得
      budgetPercentage: 25,
      monthlyBudget: 50000,
      expenseCount: 5,
      note: "予算管理が必要なカテゴリです",
    });
    setCategoryModalOpen(true);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup({
      name: group,
      description: "このグループは...", // API等から取得
      totalPayment: 180000,
      percentageOfTotal: 45,
      categories: ["食費", "住宅費", "通信費"],
      note: "生活必需品に関する支出グループです",
    });
    setGroupModalOpen(true);
  };

  const handleEditExpense = (id) => {
    const expense = currentYearData.find((exp) => exp.id === id);
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id) => {
    const updatedAllExpenses = allExpensesByYear.map((yearData) => {
      if (yearData.year === parseInt(year)) {
        return {
          ...yearData,
          expenses: yearData.expenses.filter((expense) => expense.id !== id),
        };
      }
      return yearData;
    });
    setAllExpensesByYear(updatedAllExpenses);
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  const handleExpenseSubmit = (formData) => {
    const updatedAllExpenses = [...allExpensesByYear];
    const yearIndex = updatedAllExpenses.findIndex(
      (yearData) => yearData.year === parseInt(year)
    );

    if (editingExpense) {
      // Update existing expense
      if (yearIndex >= 0) {
        updatedAllExpenses[yearIndex] = {
          ...updatedAllExpenses[yearIndex],
          expenses: updatedAllExpenses[yearIndex].expenses.map((exp) =>
            exp.id === editingExpense.id ? { ...formData, id: exp.id } : exp
          ),
        };
      }
    } else {
      // Add new expense
      const newExpense = {
        ...formData,
        id:
          Math.max(
            ...allExpensesByYear.flatMap((yearData) =>
              yearData.expenses.map((exp) => exp.id)
            ),
            0
          ) + 1,
      };

      if (yearIndex >= 0) {
        // Year exists, add to existing expenses
        updatedAllExpenses[yearIndex] = {
          ...updatedAllExpenses[yearIndex],
          expenses: [...updatedAllExpenses[yearIndex].expenses, newExpense],
        };
      } else {
        // Year doesn't exist, create new year entry
        updatedAllExpenses.push({
          year: parseInt(year),
          expenses: [newExpense],
        });
      }
    }

    setAllExpensesByYear(updatedAllExpenses);
  };

  const totalPayment = currentYearData.expenses.reduce(
    (sum, expense) => sum + expense.payment,
    0
  );

  const graphData = groupedExpenses
    .filter(
      (group) =>
        group.totalPayment > 0 || paymentCategoryList.includes(group.category)
    )
    .map((group) => ({
      name: group.category,
      value: group.totalPayment,
      percentage:
        totalPayment > 0
          ? ((group.totalPayment / totalPayment) * 100).toFixed(1)
          : "0.0",
    }));

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.title}>
        {titleStart}
        {year}年支出一覧{titleEnd}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.paper}>
            <Typography variant="h6" sx={styles.subTitle} gutterBottom>
              支出カテゴリ別割合{subTitleDecoration}
            </Typography>
            <Typography variant="body2" sx={styles.totalPayment}>
              総支出額: {totalPayment.toLocaleString()}円
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
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap", // 折り返し対応
                      height: "auto", // 高さ自動調整
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
                カテゴリ別支出内訳{subTitleDecoration}
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

            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {groupedExpenses.map((groupedExpense) => (
                <Accordion
                  key={groupedExpense.category}
                  expanded={expandedPanels.has(groupedExpense.category)}
                  onChange={handleAccordionChange(groupedExpense.category)}
                  sx={getAccordionStyles(mode)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        pr: 2,
                      }}
                    >
                      <Link
                        component="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(groupedExpense.category);
                        }}
                        sx={{
                          textDecoration: "none",
                          color: THEME_COLORS[mode].accent,
                          "&:hover": {
                            color: THEME_COLORS[mode].hover,
                          },
                        }}
                      >
                        {groupedExpense.category}
                      </Link>
                      <Typography>
                        {groupedExpense.totalPayment.toLocaleString()}円
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>支出名</TableCell>
                          <TableCell
                            sx={{ display: { xs: "none", md: "block" } }}
                          >
                            グループ
                          </TableCell>
                          <TableCell align="right">金額</TableCell>
                          <TableCell
                            sx={{
                              display: { xs: "none", md: "block" },
                            }}
                            align="right"
                          >
                            1月換算
                          </TableCell>
                          <TableCell align="center">操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedExpense.items.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{expense.name}</TableCell>
                            <TableCell
                              sx={{
                                display: { xs: "none", md: "block" },
                              }}
                            >
                              <Link
                                component="button"
                                onClick={() => handleGroupClick(expense.group)}
                                sx={{
                                  textDecoration: "none",
                                  color: THEME_COLORS[mode].accent,
                                  "&:hover": {
                                    color: THEME_COLORS[mode].hover,
                                  },
                                }}
                              >
                                {expense.group}
                              </Link>
                            </TableCell>
                            <TableCell align="right">
                              {expense.payment}円
                            </TableCell>
                            <TableCell
                              sx={{
                                display: { xs: "none", md: "block" },
                              }}
                              align="right"
                            >
                              {Math.ceil(expense.payment / expense.monthly)}円
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => handleEditExpense(expense.id)}
                                sx={styles.iconButton}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteExpense(expense.id)}
                                sx={styles.iconButton}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* モーダルコンポーネントの追加 */}
      <ExpenseCategoryModal
        open={categoryModalOpen}
        handleClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
      />
      <ExpenseGroupModal
        open={groupModalOpen}
        handleClose={() => setGroupModalOpen(false)}
        group={selectedGroup}
      />
      <ExpenseInputModal
        open={expenseModalOpen}
        handleClose={() => setExpenseModalOpen(false)}
        initialData={editingExpense}
        onSubmit={handleExpenseSubmit}
        paymentCategoryList={paymentCategoryList}
        paymentGroupList={paymentGroupList}
      />
    </Box>
  );
}

export default ExpensesPage;
