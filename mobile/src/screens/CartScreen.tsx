import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { cartApi } from '../api';
import { useCartStore } from '../store';
import { formatPrice } from '../utils';

export default function CartScreen({ navigation }: any) {
  const { items, total, itemCount, setCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchCart(); }, []));

  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) {
      Alert.alert('Retirer', 'Retirer cet article du panier ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', style: 'destructive', onPress: async () => {
          await cartApi.remove(productId);
          fetchCart();
        }},
      ]);
      return;
    }
    try { await cartApi.update(productId, newQty); fetchCart(); } catch {}
  };

  const clearAll = () => {
    Alert.alert('Vider le panier', 'Supprimer tous les articles ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Vider', style: 'destructive', onPress: async () => { await cartApi.clear(); clearCart(); } },
    ]);
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoApplying(true);
    try {
      const { data } = await cartApi.applyPromo(promoCode.trim());
      if (data.success) { Alert.alert('✅', 'Code promo appliqué !'); fetchCart(); }
      else { Alert.alert('Erreur', data.message || 'Code promo invalide'); }
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.detail || 'Code promo invalide');
    } finally { setPromoApplying(false); }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8B4513" /></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cart-outline" size={80} color="#D4C5B3" />
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.shopBtnText}>Voir les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{itemCount} article{itemCount > 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={clearAll}><Text style={styles.clearText}>Vider</Text></TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product_name || `Produit #${item.product_id}`}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.unit_price || item.price_dt || 0)}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.product_id, item.quantity - 1)}>
                <Ionicons name="remove" size={18} color="#8B4513" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.product_id, item.quantity + 1)}>
                <Ionicons name="add" size={18} color="#8B4513" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.promoRow}>
              <TextInput style={styles.promoInput} placeholder="Code promo" value={promoCode} onChangeText={setPromoCode} />
              <TouchableOpacity style={styles.promoBtn} onPress={applyPromo} disabled={promoApplying}>
                {promoApplying ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.promoBtnText}>Appliquer</Text>}
              </TouchableOpacity>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.checkoutBtnText}>Passer la commande</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EE' },
  emptyText: { fontSize: 18, color: '#8B7355', marginTop: 16 },
  shopBtn: { marginTop: 16, backgroundColor: '#8B4513', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: '#FFF', fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5D5C3' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3D2E1F' },
  clearText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0E8DE' },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#3D2E1F' },
  itemPrice: { fontSize: 14, color: '#8B4513', marginTop: 4 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5D5C3', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },
  footer: { padding: 16 },
  promoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  promoInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5D5C3', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  promoBtn: { backgroundColor: '#8B4513', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  promoBtnText: { color: '#FFF', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#3D2E1F' },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#8B4513' },
  checkoutBtn: { backgroundColor: '#8B4513', borderRadius: 12, padding: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
