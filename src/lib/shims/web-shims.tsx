/**
 * SHIMS DE COMPOSANTS REACT NATIVE → WEB
 * 
 * Ces composants remplacent les primitives React Native (View, Text, etc.)
 * par des balises HTML standard.
 */

import React from 'react';

// ============================================
// View → div
// ============================================
type ViewProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  style?: React.CSSProperties;
};

export const View: React.FC<ViewProps> = ({ className, style, ...props }) => (
  <div className={className} style={style} {...props} />
);

// ============================================
// Text → span avec numberOfLines
// ============================================
type TextProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  style?: React.CSSProperties;
  numberOfLines?: number;
};

export const Text: React.FC<TextProps> = ({ 
  className, 
  style,
  numberOfLines,
  ...props 
}) => {
  const lineClampClass = numberOfLines ? `line-clamp-${numberOfLines}` : '';
  return (
    <span 
      className={`${className || ''} ${lineClampClass}`} 
      style={style}
      {...props} 
    />
  );
};

// ============================================
// ScrollView → div avec overflow
// ============================================
type ScrollViewProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  style?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
};

export const ScrollView: React.FC<ScrollViewProps> = ({ 
  className, 
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  children,
  ...props 
}) => {
  const scrollClasses = `
    overflow-auto
    ${showsVerticalScrollIndicator ? '' : 'scrollbar-hide'}
    ${showsHorizontalScrollIndicator ? '' : 'scrollbar-hide'}
  `;
  
  return (
    <div 
      className={`${scrollClasses} ${className || ''}`} 
      style={{ ...style, ...contentContainerStyle }}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================
// TouchableOpacity → button avec activeOpacity
// ============================================
type TouchableOpacityProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  style?: React.CSSProperties;
  activeOpacity?: number;
  onPress?: () => void;
};

export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({ 
  className, 
  style,
  activeOpacity = 0.7,
  onPress,
  children,
  ...props 
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);
  
  const opacityStyle = { opacity: isPressed ? activeOpacity : 1 };
  
  return (
    <button
      className={`cursor-pointer bg-transparent border-none ${className || ''}`}
      style={{ ...style, ...opacityStyle }}
      onClick={onPress}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================
// Pressable → button
// ============================================
export const Pressable = TouchableOpacity;

// ============================================
// Image → img avec support source
// ============================================
type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  className?: string;
  style?: React.CSSProperties;
  source?: { uri: string } | string | number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};

export const Image: React.FC<ImageProps> = ({ 
  className, 
  style,
  source,
  src,
  alt = '',
  resizeMode = 'cover',
  ...props 
}) => {
  let imageSrc: string | undefined = src;
  
  if (typeof source === 'object' && source !== null && 'uri' in source) {
    imageSrc = source.uri;
  } else if (typeof source === 'string') {
    imageSrc = source;
  } else if (typeof source === 'number') {
    // Pour les require() - on utilise une chaîne vide
    imageSrc = '';
  }
  
  const objectFitMap: Record<string, string> = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'fill',
    repeat: 'repeat',
    center: 'none',
  };
  
  return (
    <img
      className={className}
      style={{ ...style, objectFit: objectFitMap[resizeMode] || 'cover' }}
      src={imageSrc}
      alt={alt}
      {...props}
    />
  );
};

// ============================================
// TextInput → input
// ============================================
type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  style?: React.CSSProperties;
};

export const TextInput: React.FC<TextInputProps> = ({ className, style, ...props }) => (
  <input
    className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className || ''}`}
    style={style}
    {...props}
  />
);

// ============================================
// ActivityIndicator → Spinner CSS
// ============================================
type ActivityIndicatorProps = {
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'large' | number;
  color?: string;
};

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ 
  className, 
  style,
  size = 'small',
  color = '#3b82f6'
}) => {
  const sizeClass = size === 'large' ? 'w-8 h-8' : size === 'small' ? 'w-5 h-5' : `w-${size} h-${size}`;
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClass} ${className || ''}`}
      style={{ color, borderColor: color, borderRightColor: 'transparent', ...style }}
    />
  );
};

// ============================================
// FlatList → Simple map + div
// ============================================
type FlatListProps<T> = {
  data: T[];
  renderItem: (item: { item: T; index: number }) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  className?: string;
  style?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;
};

export function FlatList<T>({ 
  data, 
  renderItem, 
  keyExtractor, 
  className,
  style,
  contentContainerStyle,
}: FlatListProps<T>) {
  return (
    <div className={className} style={{ ...style, ...contentContainerStyle }}>
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );
}

// ============================================
// SafeAreaView → View
// ============================================
export const SafeAreaView: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={className} {...props} />
);

// ============================================
// KeyboardAvoidingView → View
// ============================================
export const KeyboardAvoidingView: React.FC<ViewProps> = ({ className, ...props }) => (
  <View className={className} {...props} />
);