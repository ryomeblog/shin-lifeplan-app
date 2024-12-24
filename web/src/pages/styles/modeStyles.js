// テーマごとの基本カラー設定
const THEME_COLORS = {
  dark: {
    primary: '#FFFFFF',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    accent: '#404040',
    hover: '#505050',
    shadow: 'rgba(0, 0, 0, 0.3)'
  },
  cute: {
    primary: '#FF69B4',
    background: '#FFF0F5',
    surface: 'white',
    accent: '#FFB6C1',
    hover: '#FF1493',
    shadow: 'rgba(255, 182, 193, 0.2)'
  },
  simple: {
    primary: '#2C3E50',
    background: '#F8F9FA',
    surface: 'white',
    accent: '#4EA8DE',
    hover: '#2C3E50',
    shadow: 'rgba(0, 0, 0, 0.1)'
  }
};

// グラフ用カラースキーム
export const COLOR_SCHEMES = {
  simple: ['#4EA8DE', '#5E60CE', '#6930C3', '#7400B8', '#80FFDB'],
  cute: ['#FF69B4', '#FF8DA1', '#FFB7C5', '#FFC4D6', '#FFD1DC'],
  dark: ['#00FFFF', '#00CED1', '#48D1CC', '#40E0D0', '#7FFFD4']
};

// ラベルカラー
export const LABEL_COLORS = {
  simple: '#2C3E50',  // ダークブルー
  cute: '#FF1493',    // ディープピンク
  dark: '#FFFFFF'     // 白
};

// タイトル装飾
const DECORATIONS = {
  title: {
    simple: ['', ''],
    cute: ['✿ ', ' ✿'],
    dark: ['◆ ', ' ◆']
  },
  subtitle: {
    simple: '',
    cute: ' ♡',
    dark: ' ◆'
  }
};

// タイトル装飾取得関数
export const getTitleDecorations = (mode) => 
  DECORATIONS.title[mode] || DECORATIONS.title.simple;

export const getSubTitleDecorations = (mode) => 
  DECORATIONS.subtitle[mode] || DECORATIONS.subtitle.simple;

// メインスタイル生成関数
export const getStyles = (mode) => {
  const colors = THEME_COLORS[mode] || THEME_COLORS.simple;

  return {
    container: {
      backgroundColor: colors.background,
      minHeight: '100vh',
      padding: '24px'
    },

    paper: {
      borderRadius: mode === 'cute' ? '16px' : '8px',
      border: mode === 'cute' ? `2px solid ${colors.accent}` : 'none',
      padding: '16px',
      backgroundColor: colors.surface,
      boxShadow: `0 4px 6px ${colors.shadow}`
    },

    title: {
      color: colors.primary,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: '24px'
    },

    subTitle: {
      color: colors.primary,
      fontWeight: 'bold'
    },

    totalAmount: {
      color: colors.primary,
      textAlign: 'center',
      marginBottom: '16px',
      fontWeight: 'bold'
    },

    table: {
      '& .MuiTableHead-root': {
        backgroundColor: colors.background
      },
      '& .MuiTableCell-head': {
        color: mode === 'dark' ? colors.background : colors.primary,
        fontWeight: 'bold'
      },
      '& .MuiTableRow-root': {
        '& .MuiTableCell-body': {
          color: mode === 'dark' ? colors.primary : 'inherit'
        },
        '&:hover': {
          backgroundColor: colors.background
        }
      }
    },

    button: {
      backgroundColor: colors.accent,
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: colors.hover
      },
      borderRadius: mode === 'cute' ? '20px' : undefined
    },

    iconButton: {
      color: colors.primary
    },

    legend: {
      color: colors.primary
    }
  };
};