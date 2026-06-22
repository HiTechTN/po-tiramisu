import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi, paymentsApi } from '../api';
import { useCartStore } from '../store';
import { formatPrice } from '../utils';

export default function CheckoutScreen({ navigation }: any) {
  const { items, total, promoCode, promoDiscount } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'flouci' | 'demo'>('demo');

  const placeOrder = async () => {
    if (items.length === 0) { Alert.alert('Erreur', 'Panier vide'); return; }
    setLoading(true);
    try {
      const { data: order } = await ordersApi.create({
        shipping_address: 'Adresse par défaut',
        notes: '',
      });

      if (paymentMethod === 'demo') {
        await paymentsApi.demoComplete(order.id);
        Alert.alert('✅ Commande passée', `Commande #${order.id} confirmée et payée !`, [
          { text: 'Voir mes commandes', onPress: () => navigation.navigate('Main') },
        ]);
      } else {
        const { data: payment } = await paymentsApi.initFlouci(order.id, total);
        Alert.alert('💳 Paiement', `Redirection vers Flouci...\nURL: ${payment.payment_url || 'N/A'}`, [
          { text: 'Confirmer le paiement', onPress: async () => {
            await paymentsApi.demoComplete(order.id);
            Alert.alert('✅', 'Paiement confirmé !');
            navigation.navigate('Main');
          }},
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.detail || 'Impossible de passer la commande');
    } finally { setLoading(false); }
  };

  const discountAmount = promoDiscount || 0;
  const finalTotal = total - discountAmount;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Récapitulatif</Text>
        {items.map((item: any) => (
          <View key={item.product_id} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.product_name || `Produit #${item.product_id}`}</Text>
            <Text style={styles.itemQty}>×{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatPrice((item.unit_price || 0) * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Mode de paiement</Text>
        <TouchableOpacity
          style={[styles.payOption, paymentMethod === 'demo' && styles.payOptionActive]}
          onPress={() => setPaymentMethod('demo')}
        >
          <Ionicons name="cash-outline" size={24} color={paymentMethod === 'demo' ? '#8B4513' : '#6B5B4D'} />
          <Text style={[styles.payText, paymentMethod === 'demo' && styles.payTextActive]}>Paiement à la livraison</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.payOption, paymentMethod === 'flouci' && styles.payOptionActive]}
          onPress={() => setPaymentMethod('flouci')}
        >
          <Ionicons name="card-outline" size={24} color={paymentMethod === 'flouci' ? '#8B4513' : '#6B5B4D'} />
          <Text style={[styles.payText, paymentMethod === 'flouci' && styles.payTextActive]}>Flouci (en ligne)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Sous-total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        {discountAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: '#10B981' }]}>Réduction promo</Text>
            <Text style={[styles.totalValue, { color: '#10B981' }]}>-{formatPrice(discountAmount)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, { borderTopWidth: 2, borderTopColor: '#E5D5C3', paddingTop: 12, marginTop: 8 }]}>
          <Text style={styles.grandTotal}>Total à payer</Text>
          <Text style={styles.grandTotalPrice}>{formatPrice(finalTotal)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.payBtn, loading && styles.payBtnDisabled]}
        onPress={placeOrder}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : (
          <Text style={styles.payBtnText}>Confirmer et payer {formatPrice(finalTotal)}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  section: { backgroundColor: '#FFF', margin: 16, marginBottom: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#3D2E1F', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0E8DE' },
  itemName: { flex: 1, fontSize: 14, color: '#3D2E1F' },
  itemQty: { fontSize: 14, color: '#8B7355', marginHorizontal: 8 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#3D2E1F' },
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: '#E5D5C3', borderRadius: 10, marginBottom: 8 },
  payOptionActive: { borderColor: '#8B4513', backgroundColor: '#FDF6EE' },
  payText: { fontSize: 15, color: '#6B5B4D' },
  payTextActive: { color: '#8B4513', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { fontSize: 14, color: '#6B5B4D' },
  totalValue: { fontSize: 14, fontWeight: '500', color: '#3D2E1F' },
  grandTotal: { fontSize: 18, fontWeight: 'bold', color: '#3D2E1F' },
  grandTotalPrice: { fontSize: 22, fontWeight: 'bold', color: '#8B4513' },
  payBtn: { margin: 16, backgroundColor: '#8B4513', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32 },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
