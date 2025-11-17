import { Offer } from '@/types/indextypes'; // We will define this type in the next step
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
    <View style={styles.container}>
      <Image source={{ uri: offer.banner_image_url }} style={styles.banner} />
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.title}>{offer.title}</Text>
          <TouchableOpacity
            onPress={handleDeletePress}
            style={styles.deleteButton}
          >
            <Trash2 color="#E53935" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{offer.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    width: '100%',
    height: 150,
  },
  details: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1, // Allow title to take up space
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8, // Makes it easier to tap
  },
});
