import OfferItem from '@/components/OfferItem';
import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { Offer } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Tag } from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OffersScreen() {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Your Offers</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/products/add-offer')}
          activeOpacity={0.8}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>New Offer</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={offers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
            <OfferItem offer={item} onDelete={handleDeleteOffer} />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Tag size={48} color={theme.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              You haven't created any offers yet.
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
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
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
