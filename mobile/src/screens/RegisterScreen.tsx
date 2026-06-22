import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import { useAuthStore } from '../store';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return;
    }
    setLoading(true);
    try {
      await authApi.register({ email, password, full_name: fullName, phone: phone || undefined });
      const { data } = await authApi.login({ email, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      const { data: user } = await authApi.getMe();
      setUser(user);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.detail || "Impossible de créer le compte");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🍰</Text>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Po Tiramisu</Text>

        <TextInput style={styles.input} placeholder="Nom complet *" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Téléphone" value={phone} onChangeText={setPhone}
          keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Mot de passe *" value={password} onChangeText={setPassword}
          secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmer le mot de passe *" value={confirmPassword}
          onChangeText={setConfirmPassword} secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Création...' : "S'inscrire"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 50, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#8B4513', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#8B7355', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5D5C3', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 10 },
  btn: { backgroundColor: '#8B4513', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#8B4513', textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '500' },
});
