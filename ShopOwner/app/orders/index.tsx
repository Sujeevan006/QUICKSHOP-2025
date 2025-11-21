import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; // 👈 Import useTheme
import { Loader2, PackageCheck, RefreshCw, Truck } from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  status: 'PENDING' | 'PACKING' | 'DELIVERED';
  created_at: string;
}

export default function OrdersScreen() {
  const { token } = useContext(AuthContext);
  const { theme } = useTheme(); // 👈 Get theme
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // ... (fetchOrders and handleStatusChange logic remains the same)
  const fetchOrders = async () => {
    /* ... */
  };
  const handleStatusChange = async (
    orderId: number,
    newStatus: 'PACKING' | 'DELIVERED'
  ) => {
    /* ... */
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item }: { item: Order }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.infoContainer}>
        <Text style={[styles.orderId, { color: theme.text }]}>
          Order #{item.id}
        </Text>
        <Text style={[styles.detail, { color: theme.textSecondary }]}>
          Customer ID: {item.customer_id}
        </Text>
        <Text style={[styles.detail, { color: theme.textSecondary }]}>
          Status: {item.status}
        </Text>
        <Text style={[styles.detail, { color: theme.textSecondary }]}>
          Placed on {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>

      {item.status === 'PENDING' && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFA500' }]}
          onPress={() => handleStatusChange(item.id, 'PACKING')}
        >
          <PackageCheck size={18} color="#fff" />
          <Text style={styles.btnText}>Mark as Packing</Text>
        </TouchableOpacity>
      )}

      {item.status === 'PACKING' && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]} // Use primary color for consistency
          onPress={() => handleStatusChange(item.id, 'DELIVERED')}
        >
          <Truck size={18} color="#fff" />
          <Text style={styles.btnText}>Mark as Delivered</Text>
        </TouchableOpacity>
      )}

      {item.status === 'DELIVERED' && (
        <View style={[styles.actionBtn, { backgroundColor: '#28A745' }]}>
          <Loader2 size={18} color="#fff" />
          <Text style={styles.btnText}>Delivered</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Orders</Text>

      <TouchableOpacity style={styles.refresh} onPress={fetchOrders}>
        <RefreshCw color={theme.primary} size={20} />
        <Text style={[styles.refreshText, { color: theme.primary }]}>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            No orders yet.
          </Text>
        }
        refreshing={loading}
        onRefresh={fetchOrders}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    borderWidth: 1, // Add border for dark mode visibility
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoContainer: { marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  detail: { fontSize: 13 },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  btnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  empty: { textAlign: 'center', marginTop: 20 },
  refresh: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  refreshText: { marginLeft: 6, fontWeight: '600' },
});
