// components/common/EmptyState.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Inbox } from 'lucide-react-native';

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode; // Optional custom icon
  actionLabel?: string; // Optional button label
  onActionPress?: () => void; // Optional button handler
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  testID?: string;
};

const EmptyStateComp: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  actionLabel,
  onActionPress,
  containerStyle,
  titleStyle,
  subtitleStyle,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        },
        containerStyle,
      ]}
    >
      {/* Icon (optional, defaults to Inbox-like indicator) */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${theme.primary}1A`, // ~10% alpha
          marginBottom: 12,
        }}
      >
        {icon ?? <Inbox size={32} color={theme.primary} />}
      </View>

      <Text
        style={[
          {
            color: theme.text,
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center',
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            {
              color: theme.textSecondary,
              fontSize: 13,
              marginTop: 6,
              textAlign: 'center',
            },
            subtitleStyle,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          style={{
            marginTop: 14,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: theme.primary,
          }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default memo(EmptyStateComp);
