import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Loader2, Package, PackageCheck, RefreshCw, Truck } from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  status: 'PENDING' | 'PACKING' | 'DELIVERED';
  created_at: string;
}

export default function OrdersScreen() {
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Placeholder logic preserved
  const fetchOrders = async () => {
    // Implement fetch logic here
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleStatusChange = async (
    orderId: number,
    newStatus: 'PACKING' | 'DELIVERED'
  ) => {
    // Implement status change logic here
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item, index }: { item: Order; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.orderId, { color: theme.text }]}>
              Order #{item.id}
            </Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, theme) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status, theme) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.infoContainer}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Customer ID:</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{item.customer_id}</Text>
        </View>

        <View style={styles.actionsContainer}>
          {item.status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => handleStatusChange(item.id, 'PACKING')}
              activeOpacity={0.8}
            >
              <PackageCheck size={18} color="#fff" />
              <Text style={styles.btnText}>Mark as Packing</Text>
            </TouchableOpacity>
          )}

          {item.status === 'PACKING' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleStatusChange(item.id, 'DELIVERED')}
              activeOpacity={0.8}
            >
              <Truck size={18} color="#fff" />
              <Text style={styles.btnText}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}

          {item.status === 'DELIVERED' && (
            <View style={[styles.completedBadge, { borderColor: '#10B981' }]}>
              <Loader2 size={16} color="#10B981" />
              <Text style={[styles.completedText, { color: '#10B981' }]}>Delivered</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Orders</Text>
        <TouchableOpacity 
          style={[styles.refreshBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
          onPress={fetchOrders}
        >
          <RefreshCw color={theme.text} size={16} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={theme.textSecondary} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No orders yet.
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchOrders}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'PENDING': return '#F59E0B'; // Amber
    case 'PACKING': return theme.primary; // Blue
    case 'DELIVERED': return '#10B981'; // Emerald
    default: return theme.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: { fontSize: 28, fontWeight: '800' },
  refreshBtn: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  date: { fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  divider: { height: 1, marginVertical: 12 },
  
  infoContainer: { flexDirection: 'row', marginBottom: 16 },
  detailLabel: { fontSize: 14, marginRight: 8 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  
  actionsContainer: { alignItems: 'flex-end' },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
  },
  btnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  completedText: { fontWeight: '600', marginLeft: 6 },
  
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '500' },
});
