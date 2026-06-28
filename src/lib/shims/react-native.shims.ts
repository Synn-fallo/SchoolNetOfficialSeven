/**
 * SHIMS DE COMPATIBILITÉ REACT NATIVE → WEB
 * 
 * Ces fichiers remplacent les modules React Native par des équivalents web.
 * Ils permettent à vos hooks existants de fonctionner sans modification.
 */

// ============================================
// 1. Alert → window.alert()
// ============================================
export const Alert = {
  alert: (title: string, message?: string, buttons?: any[]) => {
    window.alert(`${title}\n${message || ''}`);
  },
};

// ============================================
// 2. Platform → Toujours 'web'
// ============================================
export const Platform = {
  OS: 'web',
  Version: 'web',
  select: (obj: any) => obj.web || obj.default,
};

// ============================================
// 3. Linking → window.location
// ============================================
export const Linking = {
  openURL: (url: string) => {
    window.open(url, '_blank');
  },
  canOpenURL: () => Promise.resolve(true),
};

// ============================================
// 4. Dimensions → window.inner
// ============================================
export const Dimensions = {
  get: (type: 'window' | 'screen') => ({
    width: type === 'window' ? window.innerWidth : window.screen.width,
    height: type === 'window' ? window.innerHeight : window.screen.height,
  }),
};

// ============================================
// 5. StatusBar → Rien sur le web
// ============================================
export const StatusBar = {
  setBarStyle: () => {},
  setBackgroundColor: () => {},
  setTranslucent: () => {},
};

// ============================================
// 6. Keyboard → Rien sur le web
// ============================================
export const Keyboard = {
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
  dismiss: () => {},
};

// ============================================
// 7. AppState → focus/blur sur le web
// ============================================
export const AppState = {
  addEventListener: (event: string, handler: () => void) => {
    if (event === 'change') {
      window.addEventListener('focus', handler);
      window.addEventListener('blur', handler);
    }
    return { remove: () => {} };
  },
  removeEventListener: () => {},
  currentState: 'active',
};

// ============================================
// 8. StyleSheet → Objets CSS simples
// ============================================
export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (styles: any) => {
    if (Array.isArray(styles)) {
      return Object.assign({}, ...styles);
    }
    return styles;
  },
};

// ============================================
// 9. AsyncStorage → localStorage (NATIF)
// ============================================
export const AsyncStorage = {
  getItem: async (key: string) => {
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    window.localStorage.removeItem(key);
  },
  clear: async () => {
    window.localStorage.clear();
  },
  getAllKeys: async () => {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  },
  multiGet: async (keys: string[]) => {
    return keys.map((key) => [key, window.localStorage.getItem(key)]);
  },
  multiSet: async (items: [string, string][]) => {
    items.forEach(([key, value]) => {
      window.localStorage.setItem(key, value);
    });
  },
  multiRemove: async (keys: string[]) => {
    keys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  },
};

export default AsyncStorage;

// ============================================
// 10. PixelRatio → 1 sur le web
// ============================================
export const PixelRatio = {
  get: () => 1,
  getFontScale: () => 1,
};

// ============================================
// 11. Vibration → Rien sur le web
// ============================================
export const Vibration = {
  vibrate: () => {},
  cancel: () => {},
};

// ============================================
// 12. Share → window.navigator.share
// ============================================
export const Share = {
  share: (options: { title?: string; message?: string; url?: string }) => {
    if (window.navigator.share) {
      return window.navigator.share({
        title: options.title,
        text: options.message,
        url: options.url,
      });
    }
    // Fallback
    window.alert(`Partager: ${options.message || options.url || ''}`);
    return Promise.resolve();
  },
};

// ============================================
// 13. PermissionsAndroid → Rien sur le web
// ============================================
export const PermissionsAndroid = {
  check: () => Promise.resolve('granted'),
  request: () => Promise.resolve('granted'),
};