import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
  haptic?: boolean;
}

export default function BackButton({
  onPress,
  color = '#111827',
  size = 22,
  accessibilityLabel = 'Retour',
  haptic = true,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handlePress}
      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      title={accessibilityLabel}
      aria-label={accessibilityLabel}
    >
      <ArrowLeft size={size} color={color} className="stroke-[2.5]" />
    </button>
  );
}
