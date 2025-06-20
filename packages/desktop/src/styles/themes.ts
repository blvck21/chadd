export interface Theme {
  name: string;
  displayName: string;
  type: 'retro' | 'modern' | 'classic';
  colors: {
    // Background colors
    primary: string;
    secondary: string;
    tertiary: string;
    surface: string;
    overlay: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    accentMuted: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // UI Element colors
    border: string;
    borderHover: string;
    shadow: string;
    
    // Voice activity colors
    speaking: string;
    muted: string;
    deafened: string;
  };
  fonts: {
    primary: string;
    monospace: string;
    heading: string;
  };
  effects: {
    blur: string;
    borderRadius: string;
    transition: string;
    boxShadow: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Retro Monospace Themes
export const retroGreenTheme: Theme = {
  name: 'retro-green',
  displayName: 'Retro Green Terminal',
  type: 'retro',
  colors: {
    primary: '#0d1117',
    secondary: '#161b22',
    tertiary: '#21262d',
    surface: '#30363d',
    overlay: 'rgba(13, 17, 23, 0.9)',
    
    textPrimary: '#00ff41',
    textSecondary: '#7df9ff',
    textMuted: '#58a6ff',
    textInverse: '#0d1117',
    
    accent: '#00ff41',
    accentHover: '#7df9ff',
    accentMuted: 'rgba(0, 255, 65, 0.3)',
    
    success: '#39d353',
    warning: '#ffab00',
    error: '#ff6b6b',
    info: '#7df9ff',
    
    border: '#00ff41',
    borderHover: '#7df9ff',
    shadow: 'rgba(0, 255, 65, 0.3)',
    
    speaking: '#00ff41',
    muted: '#ff6b6b',
    deafened: '#ffab00',
  },
  fonts: {
    primary: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
    monospace: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
    heading: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
  },
  effects: {
    blur: 'blur(10px)',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
    secondary: 'linear-gradient(90deg, #00ff41 0%, #7df9ff 100%)',
    accent: 'linear-gradient(45deg, #00ff41, #7df9ff)',
  },
};

export const retroAmberTheme: Theme = {
  name: 'retro-amber',
  displayName: 'Retro Amber CRT',
  type: 'retro',
  colors: {
    primary: '#1a0f00',
    secondary: '#2d1b00',
    tertiary: '#3d2500',
    surface: '#4d3000',
    overlay: 'rgba(26, 15, 0, 0.9)',
    
    textPrimary: '#ffb000',
    textSecondary: '#ffd700',
    textMuted: '#cc8800',
    textInverse: '#1a0f00',
    
    accent: '#ffb000',
    accentHover: '#ffd700',
    accentMuted: 'rgba(255, 176, 0, 0.3)',
    
    success: '#90ee90',
    warning: '#ffd700',
    error: '#ff6347',
    info: '#87ceeb',
    
    border: '#ffb000',
    borderHover: '#ffd700',
    shadow: 'rgba(255, 176, 0, 0.3)',
    
    speaking: '#ffb000',
    muted: '#ff6347',
    deafened: '#ffd700',
  },
  fonts: {
    primary: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
    monospace: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
    heading: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
  },
  effects: {
    blur: 'blur(10px)',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(255, 176, 0, 0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1a0f00 0%, #2d1b00 50%, #3d2500 100%)',
    secondary: 'linear-gradient(90deg, #ffb000 0%, #ffd700 100%)',
    accent: 'linear-gradient(45deg, #ffb000, #ffd700)',
  },
};

export const retroBlueTheme: Theme = {
  name: 'retro-blue',
  displayName: 'Retro Blue Matrix',
  type: 'retro',
  colors: {
    primary: '#001122',
    secondary: '#002244',
    tertiary: '#003366',
    surface: '#004488',
    overlay: 'rgba(0, 17, 34, 0.9)',
    
    textPrimary: '#00ddff',
    textSecondary: '#66aaff',
    textMuted: '#4488cc',
    textInverse: '#001122',
    
    accent: '#00ddff',
    accentHover: '#66aaff',
    accentMuted: 'rgba(0, 221, 255, 0.3)',
    
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4466',
    info: '#00ddff',
    
    border: '#00ddff',
    borderHover: '#66aaff',
    shadow: 'rgba(0, 221, 255, 0.3)',
    
    speaking: '#00ddff',
    muted: '#ff4466',
    deafened: '#ffaa00',
  },
  fonts: {
    primary: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
    monospace: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
    heading: '"JetBrains Mono", "Fira Code", "Source Code Pro", "Consolas", monospace',
  },
  effects: {
    blur: 'blur(10px)',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0, 221, 255, 0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)',
    secondary: 'linear-gradient(90deg, #00ddff 0%, #66aaff 100%)',
    accent: 'linear-gradient(45deg, #00ddff, #66aaff)',
  },
};

// Modern Themes
export const modernDarkTheme: Theme = {
  name: 'modern-dark',
  displayName: 'Modern Dark',
  type: 'modern',
  colors: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    tertiary: '#0f172a',
    surface: '#2d3748',
    overlay: 'rgba(26, 26, 46, 0.9)',
    
    textPrimary: '#e5e5e5',
    textSecondary: '#a0aec0',
    textMuted: '#718096',
    textInverse: '#1a1a2e',
    
    accent: '#00d4ff',
    accentHover: '#0099cc',
    accentMuted: 'rgba(0, 212, 255, 0.3)',
    
    success: '#48bb78',
    warning: '#ed8936',
    error: '#e53e3e',
    info: '#00d4ff',
    
    border: '#4a5568',
    borderHover: '#00d4ff',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    speaking: '#48bb78',
    muted: '#e53e3e',
    deafened: '#ed8936',
  },
  fonts: {
    primary: '"Segoe UI", "Roboto", "Inter", sans-serif',
    monospace: '"JetBrains Mono", "Fira Code", monospace',
    heading: '"Segoe UI", "Roboto", "Inter", sans-serif',
  },
  effects: {
    blur: 'blur(10px)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)',
    secondary: 'linear-gradient(90deg, #2d3748 0%, #1a202c 100%)',
    accent: 'linear-gradient(45deg, #00d4ff, #0099cc)',
  },
};

export const modernLightTheme: Theme = {
  name: 'modern-light',
  displayName: 'Modern Light',
  type: 'modern',
  colors: {
    primary: '#ffffff',
    secondary: '#f7fafc',
    tertiary: '#edf2f7',
    surface: '#e2e8f0',
    overlay: 'rgba(255, 255, 255, 0.9)',
    
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    textInverse: '#ffffff',
    
    accent: '#3182ce',
    accentHover: '#2c5282',
    accentMuted: 'rgba(49, 130, 206, 0.3)',
    
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce',
    
    border: '#cbd5e0',
    borderHover: '#3182ce',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    speaking: '#38a169',
    muted: '#e53e3e',
    deafened: '#d69e2e',
  },
  fonts: {
    primary: '"Segoe UI", "Roboto", "Inter", sans-serif',
    monospace: '"JetBrains Mono", "Fira Code", monospace',
    heading: '"Segoe UI", "Roboto", "Inter", sans-serif',
  },
  effects: {
    blur: 'blur(10px)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 50%, #edf2f7 100%)',
    secondary: 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 100%)',
    accent: 'linear-gradient(45deg, #3182ce, #2c5282)',
  },
};

// Classic Discord-like Theme
export const discordTheme: Theme = {
  name: 'discord',
  displayName: 'Discord Classic',
  type: 'classic',
  colors: {
    primary: '#36393f',
    secondary: '#2f3136',
    tertiary: '#202225',
    surface: '#40444b',
    overlay: 'rgba(32, 34, 37, 0.9)',
    
    textPrimary: '#dcddde',
    textSecondary: '#b9bbbe',
    textMuted: '#72767d',
    textInverse: '#36393f',
    
    accent: '#5865f2',
    accentHover: '#4752c4',
    accentMuted: 'rgba(88, 101, 242, 0.3)',
    
    success: '#3ba55d',
    warning: '#faa81a',
    error: '#ed4245',
    info: '#5865f2',
    
    border: '#40444b',
    borderHover: '#5865f2',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    speaking: '#3ba55d',
    muted: '#ed4245',
    deafened: '#faa81a',
  },
  fonts: {
    primary: '"Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif',
    monospace: '"Consolas", "Courier New", monospace',
    heading: '"Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  effects: {
    blur: 'blur(8px)',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.24)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #36393f 0%, #2f3136 50%, #202225 100%)',
    secondary: 'linear-gradient(90deg, #40444b 0%, #36393f 100%)',
    accent: 'linear-gradient(45deg, #5865f2, #4752c4)',
  },
};

// TeamSpeak-like Theme
export const teamSpeakTheme: Theme = {
  name: 'teamspeak',
  displayName: 'TeamSpeak Classic',
  type: 'classic',
  colors: {
    primary: '#1e1e1e',
    secondary: '#2d2d30',
    tertiary: '#3e3e42',
    surface: '#4d4d50',
    overlay: 'rgba(30, 30, 30, 0.9)',
    
    textPrimary: '#f0f0f0',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    textInverse: '#1e1e1e',
    
    accent: '#0078d4',
    accentHover: '#106ebe',
    accentMuted: 'rgba(0, 120, 212, 0.3)',
    
    success: '#107c10',
    warning: '#ff8c00',
    error: '#d13438',
    info: '#0078d4',
    
    border: '#464647',
    borderHover: '#0078d4',
    shadow: 'rgba(0, 0, 0, 0.4)',
    
    speaking: '#107c10',
    muted: '#d13438',
    deafened: '#ff8c00',
  },
  fonts: {
    primary: '"Segoe UI", Tahoma, Arial, sans-serif',
    monospace: '"Consolas", "Courier New", monospace',
    heading: '"Segoe UI", Tahoma, Arial, sans-serif',
  },
  effects: {
    blur: 'blur(6px)',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d30 50%, #3e3e42 100%)',
    secondary: 'linear-gradient(90deg, #4d4d50 0%, #3e3e42 100%)',
    accent: 'linear-gradient(45deg, #0078d4, #106ebe)',
  },
};

// Cyberpunk Theme
export const cyberpunkTheme: Theme = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk 2077',
  type: 'retro',
  colors: {
    primary: '#0a0a0a',
    secondary: '#1a0f1a',
    tertiary: '#2a1a2a',
    surface: '#3a2a3a',
    overlay: 'rgba(10, 10, 10, 0.9)',
    
    textPrimary: '#ff0080',
    textSecondary: '#00ffff',
    textMuted: '#8040ff',
    textInverse: '#0a0a0a',
    
    accent: '#ff0080',
    accentHover: '#00ffff',
    accentMuted: 'rgba(255, 0, 128, 0.3)',
    
    success: '#00ff80',
    warning: '#ffff00',
    error: '#ff4040',
    info: '#00ffff',
    
    border: '#ff0080',
    borderHover: '#00ffff',
    shadow: 'rgba(255, 0, 128, 0.5)',
    
    speaking: '#00ff80',
    muted: '#ff4040',
    deafened: '#ffff00',
  },
  fonts: {
    primary: '"Orbitron", "JetBrains Mono", monospace',
    monospace: '"Orbitron", "JetBrains Mono", monospace',
    heading: '"Orbitron", "JetBrains Mono", monospace',
  },
  effects: {
    blur: 'blur(8px)',
    borderRadius: '2px',
    transition: 'all 0.15s ease',
    boxShadow: '0 0 30px rgba(255, 0, 128, 0.5)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f1a 50%, #2a1a2a 100%)',
    secondary: 'linear-gradient(90deg, #ff0080 0%, #00ffff 100%)',
    accent: 'linear-gradient(45deg, #ff0080, #00ffff)',
  },
};

export const themes = {
  'retro-green': retroGreenTheme,
  'retro-amber': retroAmberTheme,
  'retro-blue': retroBlueTheme,
  'modern-dark': modernDarkTheme,
  'modern-light': modernLightTheme,
  'discord': discordTheme,
  'teamspeak': teamSpeakTheme,
  'cyberpunk': cyberpunkTheme,
};

export type ThemeName = keyof typeof themes;

export const defaultTheme = retroGreenTheme; 