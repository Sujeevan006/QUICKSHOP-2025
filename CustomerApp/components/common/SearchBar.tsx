// components/common/SearchBar.tsx
import React, { ReactNode, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { X as CloseIcon, Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onClear?: () => void; // clears search text
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftAccessory?: ReactNode; // optional leading slot (e.g., Search icon)
  rightAccessory?: ReactNode; // trailing slot (e.g., Clear pill / Filter button)
  showClearIcon?: boolean; // small X to clear text
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  testID?: string;
};

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder,
  onClear,
  containerStyle,
  inputStyle,
  leftAccessory,
  rightAccessory,
  showClearIcon = true,
  autoFocus = false,
  onSubmitEditing,
  testID,
}) => {
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';
  const inputRef = useRef<TextInput>(null);

  return (
    <View
      style={[
        { marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
        containerStyle,
      ]}
      testID={testID}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          borderRadius: 14, // More rounded
          // In light mode, use shadow instead of border for a cleaner "floating" look
          // In dark mode, use border for visibility
          borderWidth: isDark ? 1 : 0,
          borderColor: theme.border,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.05,
              shadowRadius: 8,
            },
            android: {
              elevation: isDark ? 0 : 2,
            },
          }),
          paddingHorizontal: 14,
          height: 52, // Slightly taller
        }}
      >
        {leftAccessory ? (
          <View style={{ marginRight: 10 }}>{leftAccessory}</View>
        ) : (
          // Default search icon if no accessory provided, for better UX
          <View style={{ marginRight: 10 }}>
             <Search size={20} color={theme.textSecondary} />
          </View>
        )}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          style={{
            flex: 1,
            color: theme.text,
            paddingVertical: 8,
            fontSize: 16,
            fontWeight: '500',
            ...(inputStyle as object),
          }}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={placeholder}
        />

        {showClearIcon && value.length > 0 && (
          <TouchableOpacity
            onPress={() => (onClear ? onClear() : onChangeText(''))}
            style={{ 
              padding: 6, 
              marginLeft: 4,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: 12,
            }}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
          >
            <CloseIcon size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        {rightAccessory ? (
          <View style={{ marginLeft: 10 }}>{rightAccessory}</View>
        ) : null}
      </View>
    </View>
  );
};
