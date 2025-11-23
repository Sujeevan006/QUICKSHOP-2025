import { useTheme } from '@/context/ThemeContext';
import { Offer } from '@/types';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface OfferItemProps {
  offer: Offer;
  onDelete: (id: number) => void;
}

export default function OfferItem({ offer, onDelete }: OfferItemProps) {
  const theme = useTheme();

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(offer.id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
      <Image source={{ uri: offer.banner_image_url }} style={styles.banner} />
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{offer.title}</Text>
          <TouchableOpacity
            onPress={handleDeletePress}
            style={styles.deleteButton}
          >
            <Trash2 color="#EF4444" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{offer.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    width: '100%',
    height: 160,
  },
  details: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
});
