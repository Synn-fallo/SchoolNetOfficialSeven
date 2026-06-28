/**
 * DÉCLARATIONS DE TYPES POUR LES SHIMS
 * 
 * Ces déclarations permettent à TypeScript de comprendre
 * que les imports de 'react-native' et autres sont valides.
 */

declare module 'react-native' {
  export * from './lib/shims/react-native.shims';
  export default from './lib/shims/react-native.shims';
}

declare module '@react-native-async-storage/async-storage' {
  export * from './lib/shims/react-native.shims';
  export default from './lib/shims/react-native.shims';
}

declare module 'react-native-safe-area-context' {
  export * from './lib/shims/web-shims';
  export default from './lib/shims/web-shims';
}

// Pour les modules non trouvés
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// Pour les Web Workers et autres
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}