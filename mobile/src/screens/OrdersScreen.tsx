import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ordersApi } from '../api';
import { formatPrice, formatDate, statusColors, statusLabels } from '../utils';

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const { data } = await ordersApi.list();
        setOrders(data.items || data);
      } catch {} finally { setLoading(false); }
    })();
  }, []));

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8B4513" /></View>;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="receipt-outline" size={80} color="#D4C5B3" />
        <Text style={styles.emptyText}>Aucune commande</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>Commande #{item.id}</Text>
            <View style={[styles.badge, { backgroundColor: statusColors[item.status] || '#9CA3AF' }]}>
              <Text style={styles.badgeText}>{statusLabels[item.status] || item.status}</Text>
            </View>
          </View>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          <Text style={styles.total}>{formatPrice(item.total_amount)}</Text>
          <Text style={styles.items}>{item.items?.length || 0} article{(item.items?.length || 0) > 1 ? 's' : ''}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EE' },
  emptyText: { fontSize: 18, color: '#8B7355', marginTop: 16 },
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#3D2E1F' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: '#8B7355', marginBottom: 6 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#8B4513' },
  items: { fontSize: 13, color: '#6B5B4D', marginTop: 4 },
});
