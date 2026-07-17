// src/styles/theme.ts
// Task 1.5.4: Ant Design theme override theo design system
import type { ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: '#005AE0',
    borderRadius: 8,
    fontFamily: "'Be Vietnam Pro', sans-serif",
  },
  components: {
    Button: { controlHeight: 40 },
    Input: { controlHeight: 40 },
  },
};
