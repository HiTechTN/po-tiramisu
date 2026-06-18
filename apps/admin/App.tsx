import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Switch, TextInput, Button } from 'react-native';
import { supabase } from './src/lib/supabase';
import { Order, RawMaterialRequirement } from '@potiramisu/shared';

export default function App() {
  const [activeTab, setActiveTab] = useState<'queue' | 'materials' | 'settings'>('queue');
  
  // State for Queue
  const [orders, setOrders] = useState<Order[]>([]);

  // State for Materials
  const [targetDate, setTargetDate] = useState<string>('');
  const [materials, setMaterials] = useState<RawMaterialRequirement[]>([]);

  // State for Settings
  const [isStoreClosed, setIsStoreClosed] = useState(false);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        console.log('Order Change received!', payload);
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'completed')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  const updateOrderStatus = async (id: string, currentStatus: string) => {
    const statuses = ['pending', 'preparing', 'delivering', 'completed', 'cancelled'];
    const nextIndex = statuses.indexOf(currentStatus) + 1;
    if (nextIndex < statuses.length) {
      await supabase.from('orders').update({ status: statuses[nextIndex] }).eq('id', id);
      fetchOrders();
    }
  };

  const calculateMaterials = async () => {
    if (!targetDate) return;
    const { data, error } = await supabase.rpc('get_raw_material_requirements', { target_date: targetDate });
    if (data && !error) {
      setMaterials(data as RawMaterialRequirement[]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Po Tiramisu Admin</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'queue' && styles.activeTab]} onPress={() => setActiveTab('queue')}>
          <Text style={[styles.tabText, activeTab === 'queue' && styles.activeTabText]}>Queue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'materials' && styles.activeTab]} onPress={() => setActiveTab('materials')}>
          <Text style={[styles.tabText, activeTab === 'materials' && styles.activeTabText]}>Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'settings' && styles.activeTab]} onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'queue' && (
          <FlatList
            data={orders}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => updateOrderStatus(item.id, item.status)}>
                <Text style={styles.orderId}>{item.id.split('-')[0]}</Text>
                <Text style={styles.customerName}>{item.customer_name} - {item.customer_phone}</Text>
                <Text style={styles.status}>Status: {item.status.toUpperCase()}</Text>
                <Text style={styles.date}>Date: {item.delivery_date}</Text>
                <Text style={styles.tapText}>Tap to advance status</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No active orders.</Text>}
          />
        )}

        {activeTab === 'materials' && (
          <View style={styles.materialsContainer}>
            <Text style={styles.label}>Target Date (YYYY-MM-DD):</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="2024-06-25"
              />
              <Button title="Calculate" onPress={calculateMaterials} color="#c2410c" />
            </View>
            
            <FlatList
              data={materials}
              keyExtractor={item => item.ingredient_name}
              renderItem={({ item }) => (
                <View style={styles.materialRow}>
                  <Text style={styles.materialName}>{item.ingredient_name}</Text>
                  <Text style={styles.materialQty}>{item.total_quantity} {item.unit}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No materials to calculate or no orders on this date.</Text>}
            />
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsHeader}>Store Operations</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Force Close Store</Text>
              <Switch
                value={isStoreClosed}
                onValueChange={(val) => setIsStoreClosed(val)}
                trackColor={{ false: "#767577", true: "#c2410c" }}
                thumbColor={isStoreClosed ? "#fff" : "#f4f3f4"}
              />
            </View>
            <Text style={styles.helperText}>
              When enabled, customers will not be able to select any new delivery dates. (Note: Database trigger to actual daily_capacity logic needed to fully enforce).
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#c2410c',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#c2410c',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orderId: {
    color: '#c2410c',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  customerName: {
    color: '#f8fafc',
    fontSize: 16,
    marginBottom: 5,
  },
  status: {
    color: '#94a3b8',
    marginBottom: 2,
  },
  date: {
    color: '#94a3b8',
    marginBottom: 10,
  },
  tapText: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 50,
  },
  materialsContainer: {
    flex: 1,
  },
  label: {
    color: '#f8fafc',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  materialName: {
    color: '#f8fafc',
    fontSize: 16,
  },
  materialQty: {
    color: '#c2410c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsContainer: {
    flex: 1,
  },
  settingsHeader: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 8,
  },
  settingText: {
    color: '#f8fafc',
    fontSize: 16,
  },
  helperText: {
    color: '#64748b',
    marginTop: 10,
    fontSize: 14,
  }
});
