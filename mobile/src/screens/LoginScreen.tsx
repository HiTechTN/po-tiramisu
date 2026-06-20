import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import { useAuthStore } from '../store';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const { data } =      const { data } = await authApi.login({ email, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      const { data: user } = await authApi.getMe();
      setUser(user);
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🍰</Text>
        <Text style={styles.title}>Po Tiramisu</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword}
          secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Pas de compte ? Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 60, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#8B4513', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#8B7355', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5D5C3', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12 },
  btn: { backgroundColor: '#8B4513', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#8B4513', textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '500' },
});
