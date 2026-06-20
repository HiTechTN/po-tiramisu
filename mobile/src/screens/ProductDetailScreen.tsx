import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productsApi, cartApi } from '../api';
import { useCartStore } from '../store';
import { formatPrice } from '../utils';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { setCart } = useCartStore();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await productsApi.get(String(id));
        setProduct(data);
      } catch (e) {
        Alert.alert('Erreur', 'Produit introuvable');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addToCart = async () => {
    setAdding(true);
    try {
      await cartApi.add(product.id, quantity);
      const { data } = await cartApi.get();
      setCart(data);
      Alert.alert('✅ Ajouté', `${product.name} × ${quantity} ajouté au panier`);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.detail || "Impossible d'ajouter au panier");
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8B4513" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price_dt)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.stockRow}>
          <Ionicons name={product.stock > 0 ? 'checkmark-circle' : 'close-circle'} size={20} color={product.stock > 0 ? '#10B981' : '#EF4444'} />
          <Text style={[styles.stockText, { color: product.stock > 0 ? '#10B981' : '#EF4444' }]}>
            {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
          </Text>
        </View>

        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={24} color="#8B4513" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, (product.stock <= 0 || adding) && styles.addBtnDisabled]}
          onPress={addToCart}
          disabled={product.stock <= 0 || adding}
        >
          {adding ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.addBtnText}>Ajouter au panier — {formatPrice(product.price_dt * quantity)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#3D2E1F', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#8B4513', marginBottom: 12 },
  description: { fontSize: 15, color: '#6B5B4D', lineHeight: 22, marginBottom: 16 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  stockText: { fontSize: 14, fontWeight: '500' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5D5C3', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 20, fontWeight: 'bold', color: '#3D2E1F', minWidth: 40, textAlign: 'center' },
  addBtn: { backgroundColor: '#8B4513', borderRadius: 12, padding: 16, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
