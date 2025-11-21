// components/common/ThemedToast.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return { r, g, b };
};
const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

type MessageCardProps = {
  icon: React.ReactNode;
  color: string; // accent color for icon
  message?: string; // if omitted/empty => icon-only mode
  onPress?: () => void;
  textColor: string; // for text toasts
  bgColor: string; // for text toasts
  borderColor: string; // for text toasts
};

const MessageCard = ({
  icon,
  color,
  message,
  onPress,
  textColor,
  bgColor,
  borderColor,
}: MessageCardProps) => {
  const hasText = !!message && message.trim().length > 0;

  // ICON-ONLY: solid white background, centered bubble, clear accent icon
  if (!hasText) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={{
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: '#ffffff', // solid white
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.08)', // subtle border for both themes
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          {icon}
        </View>
      </TouchableOpacity>
    );
  }

  // TEXT + ICON: same as before (still supported)
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        marginHorizontal: 12,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View style={{ height: 3, backgroundColor: color }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: rgba(color, 0.12),
            marginRight: 10,
          }}
        >
          {icon}
        </View>
        <Text
          numberOfLines={2}
          style={{ color: textColor, fontSize: 13, fontWeight: '700', flex: 1 }}
        >
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

type ThemedToastProps = {
  position?: 'bottom' | 'top';
  bottomOffset?: number;
  topOffset?: number;
};

export function ThemedToast({
  position = 'bottom',
  bottomOffset = 72,
  topOffset = 40,
}: ThemedToastProps) {
  const { theme } = useTheme();
  const primary = theme.primary;
  const infoMain = '#0ea5e9';
  const errorMain = '#ef4444';

  const toastConfig: ToastConfig = {
    // Generic "message" (works for icon-only too)
    message: ({ props }) => {
      const color: string = props?.color || primary;
      const icon: React.ReactNode = props?.icon || (
        <Info size={20} color={color} />
      );
      const msg: string | undefined = props?.iconOnly ? '' : props?.message;

      return (
        <MessageCard
          icon={icon}
          color={color}
          message={msg}
          onPress={props?.onPress}
          textColor={theme.text}
          bgColor={theme.surface}
          borderColor={rgba(color, 0.35)}
        />
      );
    },

    // Presets (also respect iconOnly)
    success: ({ text1, props }) => {
      const color = primary;
      const icon = props?.icon || <CheckCircle2 size={20} color={color} />;
      const msg = props?.iconOnly ? '' : text1 || props?.message || 'Success';
      return (
        <MessageCard
          icon={icon}
          color={color}
          message={msg}
          onPress={props?.onPress}
          textColor={theme.text}
          bgColor={theme.surface}
          borderColor={rgba(color, 0.35)}
        />
      );
    },

    error: ({ text1, props }) => {
      const color = errorMain;
      const icon = props?.icon || <XCircle size={20} color={color} />;
      const msg = props?.iconOnly ? '' : text1 || props?.message || 'Error';
      return (
        <MessageCard
          icon={icon}
          color={color}
          message={msg}
          onPress={props?.onPress}
          textColor={theme.text}
          bgColor={theme.surface}
          borderColor={rgba(color, 0.35)}
        />
      );
    },

    info: ({ text1, props }) => {
      const color = infoMain;
      const icon = props?.icon || <Info size={20} color={color} />;
      const msg = props?.iconOnly ? '' : text1 || props?.message || 'Info';
      return (
        <MessageCard
          icon={icon}
          color={color}
          message={msg}
          onPress={props?.onPress}
          textColor={theme.text}
          bgColor={theme.surface}
          borderColor={rgba(color, 0.35)}
        />
      );
    },
  };

  return (
    <Toast
      config={toastConfig}
      position={position}
      bottomOffset={position === 'bottom' ? bottomOffset : undefined}
      topOffset={position === 'top' ? topOffset : undefined}
    />
  );
}

export default memo(ThemedToast);
