import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from './src/store';
import { authApi } from './src/api';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#9CA3AF',
        headerStyle: { backgroundColor: '#8B4513' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Po Tiramisu' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Panier' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Commandes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { setUser, setLoading, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const { data } = await authApi.getMe();
          setUser(data);
        } else {
          setLoading(false);
        }
      } catch {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        setLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EE' }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, headerStyle: { backgroundColor: '#8B4513' }, headerTintColor: '#fff' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Paiement', headerStyle: { backgroundColor: '#8B4513' }, headerTintColor: '#fff' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
