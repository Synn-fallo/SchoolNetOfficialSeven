// Export des shims React Native
export * from './react-native.shims';
export * from './web-shims';

// Export par défaut pour l'import de 'react-native'
import * as ReactNative from './react-native.shims';
import * as WebShims from './web-shims';

export default {
  ...ReactNative,
  ...WebShims,
};