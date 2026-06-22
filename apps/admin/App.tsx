import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from './src/lib/supabase';
import { Order, RawMaterialRequirement } from '@potiramisu/shared';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OrderQueue } from './src/components/OrderQueue';
import { MaterialsCalculator } from './src/components/MaterialsCalculator';
import { StoreSettings } from './src/components/StoreSettings';
import { theme } from './src/theme';

function AdminApp() {
  const [activeTab, setActiveTab] = useState<'queue' | 'materials' | 'settings'>('queue');
  const [orders, setOrders] = useState<Order[]>([]);
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

  const calculateMaterials = async (date: string) => {
    triggerHaptic();
    if (!date) return;
    setMaterialsLoading(true);
    const { data, error } = await supabase.rpc('get_raw_material_requirements', { target_date: date });
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
          <OrderQueue orders={orders} onAdvanceStatus={updateOrderStatus} />
        )}

        {activeTab === 'materials' && (
          <MaterialsCalculator
            onCalculate={calculateMaterials}
            materials={materials}
            loading={materialsLoading}
          />
        )}

        {activeTab === 'settings' && (
          <StoreSettings
            isStoreClosed={isStoreClosed}
            onToggle={toggleStore}
            loading={storeToggleLoading}
          />
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
});
