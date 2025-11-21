import OfferItem from '@/components/OfferItem';
import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { Offer } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { PlusCircle } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OffersScreen() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch offers from the API
  const fetchOffers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.get('/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(response.data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      Alert.alert('Error', 'Could not load your offers.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // useFocusEffect will re-run the fetch logic every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  // Handle offer deletion
  const handleDeleteOffer = async (id: number) => {
    try {
      await api.delete(`/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the offer from the local state for an immediate UI update
      setOffers((prevOffers) => prevOffers.filter((offer) => offer.id !== id));
      Alert.alert('Success', 'Offer has been deleted.');
    } catch (error) {
      console.error('Failed to delete offer:', error);
      Alert.alert('Error', 'Could not delete the offer.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Offers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/products/add-offer')}
        >
          <PlusCircle color="#fff" size={22} />
          <Text style={styles.addButtonText}>New Offer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OfferItem offer={item} onDelete={handleDeleteOffer} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              You haven't created any offers yet.
            </Text>
            <Text style={styles.emptySubText}>
              Tap 'New Offer' to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  list: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});
