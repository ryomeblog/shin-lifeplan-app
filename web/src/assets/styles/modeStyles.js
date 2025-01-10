import { createTheme } from "@mui/material/styles";
import { padding } from "@mui/system";

const baseTheme = createTheme();

// テーマごとの基本カラー設定
export const THEME_COLORS = {
  dark: {
    primary: "#FFFFFF",
    background: "#1A1A1A",
    surface: "#2D2D2D",
    accent: "#404040",
    hover: "#505050",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
  cute: {
    primary: "#FF69B4",
    background: "#FFF0F5",
    surface: "white",
    accent: "#FFB6C1",
    hover: "#FF1493",
    shadow: "rgba(255, 182, 193, 0.2)",
  },
  simple: {
    primary: "#2C3E50",
    background: "#F8F9FA",
    surface: "white",
    accent: "#4EA8DE",
    hover: "#2C3E50",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
};

// グラフ用カラースキーム
export const COLOR_SCHEMES = {
  simple: [
    "#4EA8DE",
    "#5E60CE",
    "#6930C3",
    "#7400B8",
    "#80FFDB",
    "#167707",
    "#4FD73A",
    "#1E7670",
  ],
  cute: [
    "#FF69B4",
    "#FF8DA1",
    "#FFB7C5",
    "#48F5C1",
    "#F5B548",
    "#7048F5",
    "#48B0F5",
    "#48F58D",
  ],
  dark: ["#00FFFF", "#00CED1", "#48D1CC", "#40E0D0", "#7FFFD4"],
};

// ラベルカラー
export const LABEL_COLORS = {
  simple: "#2C3E50", // ダークブルー
  cute: "#FF1493", // ディープピンク
  dark: "#FFFFFF", // 白
};

// タイトル装飾
const DECORATIONS = {
  title: {
    simple: ["", ""],
    cute: ["✿ ", " ✿"],
    dark: ["◆ ", " ◆"],
  },
  subtitle: {
    simple: "",
    cute: " ♡",
    dark: " ◆",
  },
};

// ブレイクポイントの定義
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// モード共通の基本スタイル定数
const BASE_SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
};

const BASE_FONT_SIZES = {
  xs: {
    title: '1.5rem',
    subtitle: '1.1rem',
    body: '0.875rem',
    small: '0.75rem',
  },
  sm: {
    title: '1.75rem',
    subtitle: '1.25rem',
    body: '1rem',
    small: '0.875rem',
  },
  md: {
    title: '2rem',
    subtitle: '1.5rem',
    body: '1rem',
    small: '0.875rem',
  },
};

// ボーダーラディウスの定義
const BORDER_RADIUS = {
  simple: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  cute: {
    small: '12px',
    medium: '16px',
    large: '24px',
  },
  dark: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
};

// アニメーションの定義
const ANIMATIONS = {
  simple: {
    transition: 'all 0.3s ease',
    hover: {
      transform: 'translateY(-2px)',
    },
  },
  cute: {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    hover: {
      transform: 'scale(1.02)',
    },
  },
  dark: {
    transition: 'all 0.3s ease',
    hover: {
      transform: 'translateY(-2px)',
    },
  },
};

// タイトル装飾取得関数
export const getTitleDecorations = (mode) =>
  DECORATIONS.title[mode] || DECORATIONS.title.simple;

export const getSubTitleDecorations = (mode) =>
  DECORATIONS.subtitle[mode] || DECORATIONS.subtitle.simple;

// アコーディオンのスタイルをmodeStylesに基づいて定義
export const getAccordionStyles = (mode) => {
  const colors = THEME_COLORS[mode] || THEME_COLORS.simple;

  const baseStyles = {
    "&:before": {
      display: "none",
    },
    mb: 1,
    backgroundColor: colors.surface,
    boxShadow: `0 2px 4px ${colors.shadow}`,
  };

  return {
    ...baseStyles,
    borderRadius: mode === "cute" ? "12px" : "4px",
    border: mode === "cute" ? `1px solid ${colors.accent}` : "none",

    "& .MuiAccordionSummary-root": {
      backgroundColor: colors.background,
      borderRadius: mode === "cute" ? "12px" : "4px",
      "&.Mui-expanded": {
        borderRadius: mode === "cute" ? "12px 12px 0 0" : "4px 4px 0 0",
      },
      "& .MuiAccordionSummary-content": {
        color: colors.primary,
      },
    },

    "& .MuiAccordionDetails-root": {
      backgroundColor: colors.surface,
      borderRadius: mode === "cute" ? "0 0 12px 12px" : "0 0 4px 4px",
    },
  };
};

// メインスタイル生成関数
export const getStyles = (mode) => {
  const colors = THEME_COLORS[mode] || THEME_COLORS.simple;
  const borderRadius = BORDER_RADIUS[mode];
  const animation = ANIMATIONS[mode];

  return {
    container: {
      backgroundColor: colors.background,
      minHeight: "100vh",
      padding: baseTheme.spacing(3),
      [baseTheme.breakpoints.down("sm")]: {
        padding: baseTheme.spacing(1),
      },
    },

    paper: {
      // borderRadius: mode === "cute" ? "16px" : "8px",
      // border: mode === "cute" ? `2px solid ${colors.accent}` : "none",
      // padding: "16px",
      // boxShadow: `0 4px 6px ${colors.shadow}`,
      // '@media (max-width:600px)': {
      //   padding: "8px",
      //   borderRadius: mode === "cute" ? "12px" : "6px",
      // },

      // padding: baseTheme.spacing(3),
      // boxShadow: baseTheme.shadows[3],
      // borderRadius: 8,
      // [baseTheme.breakpoints.down("sm")]: {
      //   padding: baseTheme.spacing(1.5),
      // },
      
      borderRadius: borderRadius.medium,
      border: mode === "cute" ? `2px solid ${colors.border}` : "none",
      padding: {
        xs: BASE_SPACING.xs,
        sm: BASE_SPACING.sm,
        md: BASE_SPACING.md,
      },
      backgroundColor: colors.surface,
      boxShadow: `0 4px 6px ${colors.shadow}`,
      transition: animation.transition,
      display: 'flex',
      flexDirection: 'column',

      "&:hover": {
        ...animation.hover,
      },
    },

    title: {
      color: colors.primary,
      textAlign: "center",
      fontWeight: "bold",
      // marginBottom: "24px",
      // fontSize: "2rem",
      // '@media (max-width:600px)': {
      //   fontSize: "1.5rem",
      //   marginBottom: "16px",
      // },

      marginBottom: baseTheme.spacing(2),
      fontSize: "2rem",
      [baseTheme.breakpoints.down("sm")]: {
        fontSize: "1.5rem",
      },
    },

    subTitle: {
      color: colors.primary,
      fontWeight: "bold",
      fontSize: {
        xs: BASE_FONT_SIZES.xs.subtitle,
        sm: BASE_FONT_SIZES.sm.subtitle,
        md: BASE_FONT_SIZES.md.subtitle,
      },
      marginBottom: {
        xs: BASE_SPACING.xs,
        sm: BASE_SPACING.sm,
      },
    },

    button: {
      backgroundColor: colors.accent,
      color: "#FFFFFF",
      // "&:hover": {
      //   backgroundColor: colors.hover,
      // },
      // borderRadius: mode === "cute" ? "20px" : undefined,
      // padding: "12px 24px",
      // "@media (max-width:600px)": {
      //   padding: "8px 16px",
      //   fontSize: "0.875rem",
      // },

      // fontSize: "1rem",
      // [baseTheme.breakpoints.down("sm")]: {
      //   fontSize: "0.875rem",
      // },
      borderRadius: mode === "cute" ? borderRadius.large : borderRadius.small,
      padding: {
        xs: '6px 12px',
        sm: '8px 16px',
      },
      fontSize: {
        xs: BASE_FONT_SIZES.xs.small,
        sm: BASE_FONT_SIZES.sm.body,
      },
      transition: animation.transition,

      "&:hover": {
        backgroundColor: colors.hover,
        ...animation.hover,
      },
    },

    iconButton: {
      color: colors.primary,
      transition: animation.transition,
      
      "&:hover": {
        ...animation.hover,
      },
    },

    table: {
      "& .MuiTableHead-root": {
        backgroundColor: colors.background,
      },
      "& .MuiTableCell-head": {
        color: mode === "dark" ? colors.background : colors.primary,
        fontWeight: "bold",
      },
      "& .MuiTableRow-root": {
        "& .MuiTableCell-body": {
          color: mode === "dark" ? colors.primary : "inherit",
        },
        "&:hover": {
          backgroundColor: colors.background,
        },
      },
    },
  };
};
