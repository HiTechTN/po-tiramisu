import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { productsApi } from '../api';
import { formatPrice } from '../utils';

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = async (category?: string | null) => {
    try {
      const params: Record<string, any> = { page: 1, per_page: 50 };
      if (category) params.category = category;
      const { data } = await productsApi.list(params);
      setProducts(data.items || data);
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await productsApi.getCategories();
      setCategories(data);
    } catch {}
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
    fetchCategories();
  }, [selectedCategory]);

  const onRefresh = () => { setRefreshing(true); fetchProducts(selectedCategory); };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price_dt)}</Text>
        {item.stock <= 0 && <Text style={styles.outOfStock}>Rupture de stock</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B4513']} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <FlatList
            horizontal
            data={[null, ...categories]}
            keyExtractor={(item) => item || 'all'}
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                  {item || 'Tous'}
                </Text>
              </TouchableOpacity>
            )}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  categoryList: { marginBottom: 12, maxHeight: 44 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#E5D5C3',
  },
  categoryChipActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  categoryText: { color: '#6B5B4D', fontSize: 14, fontWeight: '500' },
  categoryTextActive: { color: '#FFF' },
  productCard: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12,
    marginBottom: 12, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  productImage: { width: 120, height: 120 },
  productInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#3D2E1F', marginBottom: 4 },
  productDescription: { fontSize: 13, color: '#8B7355', marginBottom: 6 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#8B4513' },
  outOfStock: { fontSize: 12, color: '#EF4444', marginTop: 4 },
});
