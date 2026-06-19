import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, TextInput, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { supabase } from './src/lib/supabase';
import { Order, RawMaterialRequirement } from '@potiramisu/shared';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const theme = {
  bg: '#0F0B09',
  cardBg: '#1A1412',
  cardBorder: '#3A2E2A',
  primary: '#C28859',
  textMain: '#FDFBF7',
  textMuted: '#A89F9A',
  accent: '#E5A97C',
};

function AdminApp() {
  const [activeTab, setActiveTab] = useState<'queue' | 'materials' | 'settings'>('queue');
  const [orders, setOrders] = useState<Order[]>([]);
  const [targetDate, setTargetDate] = useState<string>('');
  const [materials, setMaterials] = useState<RawMaterialRequirement[]>([]);
  const [isStoreClosed, setIsStoreClosed] = useState(false);
  const [storeToggleLoading, setStoreToggleLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'completed')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
  }, []);

  const fetchStoreStatus = useCallback(async () => {
    const { data } = await supabase.rpc('is_store_open', { check_date: new Date().toISOString().split('T')[0] });
    if (data !== null && data !== undefined) {
      setIsStoreClosed(!data);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStoreStatus();

    const channel = supabase
      .channel('admin-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, fetchStoreStatus]);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
    }
  };

  const triggerSuccessHaptic = () => {
    if (Platform.OS !== 'web') {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { }
    }
  };

  const updateOrderStatus = async (id: string, currentStatus: string) => {
    triggerSuccessHaptic();
    const statuses: readonly Order['status'][] = ['pending', 'preparing', 'delivering', 'completed', 'cancelled'];
    const nextIndex = statuses.indexOf(currentStatus as Order['status']) + 1;
    if (nextIndex < statuses.length) {
      const { error } = await supabase.from('orders').update({ status: statuses[nextIndex] }).eq('id', id);
      if (error) {
        Alert.alert('Error', 'Failed to update order status');
        return;
      }
      fetchOrders();
    }
  };

  const calculateMaterials = async () => {
    triggerHaptic();
    if (!targetDate) return;
    setMaterialsLoading(true);
    const { data, error } = await supabase.rpc('get_raw_material_requirements', { target_date: targetDate });
    if (error) {
      Alert.alert('Error', 'Failed to calculate materials');
    } else if (data) {
      setMaterials(data as RawMaterialRequirement[]);
    }
    setMaterialsLoading(false);
  };

  const toggleStore = async (value: boolean) => {
    triggerHaptic();
    setStoreToggleLoading(true);
    const { error } = await supabase.rpc('set_store_closed', {
      closed: value,
      target_date: new Date().toISOString().split('T')[0],
    });
    if (error) {
      Alert.alert('Error', 'Failed to update store status');
      return;
    }
    setIsStoreClosed(value);
    setStoreToggleLoading(false);
  };

  const switchTab = (tab: typeof activeTab) => {
    if (tab !== activeTab) {
      triggerHaptic();
      setActiveTab(tab);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Po Tiramisu Admin</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'queue' && styles.activeTab]} onPress={() => switchTab('queue')}>
          <Text style={[styles.tabText, activeTab === 'queue' && styles.activeTabText]}>Queue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'materials' && styles.activeTab]} onPress={() => switchTab('materials')}>
          <Text style={[styles.tabText, activeTab === 'materials' && styles.activeTabText]}>Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'settings' && styles.activeTab]} onPress={() => switchTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'queue' && (
          <Animated.FlatList
            data={orders}
            keyExtractor={item => item.id}
            itemLayoutAnimation={Layout.springify()}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 100).springify()} exiting={FadeOutUp} layout={Layout.springify()}>
                <TouchableOpacity style={styles.card} onPress={() => updateOrderStatus(item.id, item.status)} activeOpacity={0.7}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>#{item.id.split('-')[0].toUpperCase()}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.customerName}>{item.customer_name} • {item.customer_phone}</Text>
                  <Text style={styles.date}>Delivery: {item.delivery_date}</Text>
                  <Text style={styles.tapText}>Tap to advance status →</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No active orders.</Text>}
          />
        )}

        {activeTab === 'materials' && (
          <Animated.View entering={FadeInUp.springify()} style={styles.materialsContainer}>
            <Text style={styles.label}>Target Date (YYYY-MM-DD):</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="2024-06-25"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity style={styles.buttonPrimary} onPress={calculateMaterials} disabled={materialsLoading}>
                <Text style={styles.buttonText}>{materialsLoading ? '...' : 'Calculate'}</Text>
              </TouchableOpacity>
            </View>
            
            <Animated.FlatList
              data={materials}
              keyExtractor={item => item.ingredient_name}
              itemLayoutAnimation={Layout.springify()}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.materialRow}>
                  <Text style={styles.materialName}>{item.ingredient_name}</Text>
                  <Text style={styles.materialQty}>{item.total_quantity} {item.unit}</Text>
                </Animated.View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No materials to calculate or no orders on this date.</Text>}
            />
          </Animated.View>
        )}

        {activeTab === 'settings' && (
          <Animated.View entering={FadeInUp.springify()} style={styles.settingsContainer}>
            <Text style={styles.settingsHeader}>Store Operations</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Close Store for Today</Text>
              <Switch
                value={isStoreClosed}
                onValueChange={toggleStore}
                disabled={storeToggleLoading}
                trackColor={{ false: theme.cardBorder, true: theme.primary }}
                thumbColor={theme.textMain}
              />
            </View>
            <Text style={styles.helperText}>
              When enabled, customers will not be able to select today as a delivery date.
              The store status is persisted in the database.
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AdminApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.textMain,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.primary,
  },
  tabText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: theme.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: theme.cardBg,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    color: theme.primary,
    fontWeight: '900',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    backgroundColor: 'rgba(194, 136, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(194, 136, 89, 0.3)',
  },
  statusBadgeText: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  customerName: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  date: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: 14,
  },
  tapText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyText: {
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  materialsContainer: {
    flex: 1,
  },
  label: {
    color: theme.textMain,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: theme.cardBg,
    color: theme.textMain,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  materialName: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '500',
  },
  materialQty: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  settingsContainer: {
    flex: 1,
  },
  settingsHeader: {
    color: theme.textMain,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardBg,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  settingText: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    color: theme.textMuted,
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 4,
  }
});
