// components/common/SearchBar.tsx
import React, { ReactNode, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { X as CloseIcon } from 'lucide-react-native';
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
  const { theme } = useTheme();
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
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 12,
          height: 48,
        }}
      >
        {leftAccessory ? (
          <View style={{ marginRight: 8 }}>{leftAccessory}</View>
        ) : null}

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
            style={{ padding: 6, marginLeft: 4 }}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
          >
            <CloseIcon size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        {rightAccessory ? (
          <View style={{ marginLeft: 8 }}>{rightAccessory}</View>
        ) : null}
      </View>
    </View>
  );
};
