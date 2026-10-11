import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'minimal',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'DM Sans Variable',
    secondary: 'Barlow',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    primary: {
      lighter: '#E3F1EA',
      light: '#7FBCA1',
      main: '#2E7D5B',
      dark: '#1F5B41',
      darker: '#123828',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#F7E7DD',
      light: '#DBA488',
      main: '#C2683A',
      dark: '#9A4F2B',
      darker: '#5E301A',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#D6E6F7',
      light: '#6FA8E0',
      main: '#1565C0',
      dark: '#0D4A94',
      darker: '#082E5C',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#E3F1EA',
      light: '#7FBCA1',
      main: '#2E7D5B',
      dark: '#1F5B41',
      darker: '#123828',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FBECCF',
      light: '#E0A24D',
      main: '#A05F00',
      dark: '#8A5100',
      darker: '#573200',
      contrastText: '#FFFFFF',
    },
    error: {
      lighter: '#F9DCDC',
      light: '#E08383',
      main: '#C62828',
      dark: '#991E1E',
      darker: '#5E1212',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#FAF9F7', // Neutro-quente muito claro (leve sépia)
      '100': '#F5F3EF', // Neutro-quente suave
      '200': '#EEEBE4', // Bege-neutro claro
      '300': '#E0DBD1', // Bege-neutro tom médio
      '400': '#C4CDD5',
      '500': '#919EAB',
      '600': '#637381',
      '700': '#454F5B',
      '800': '#1C252E',
      '900': '#141A21',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
