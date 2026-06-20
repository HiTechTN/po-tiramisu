import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { usersApi } from '../api';
import { useAuthStore } from '../store';
import { formatDate } from '../utils';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const { data } = await usersApi.getProfile();
        setProfile(data);
      } catch {} finally { setLoading(false); }
    })();
  }, []));

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Se déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        logout();
      }},
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8B4513" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#8B4513" />
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Utilisateur'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={20} color="#8B7355" />
          <Text style={styles.rowText}>{profile?.phone || 'Non renseigné'}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color="#8B7355" />
          <Text style={styles.rowText}>Membre depuis {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="location-outline" size={20} color="#8B4513" />
          <Text style={styles.actionText}>Mes adresses</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="card-outline" size={20} color="#8B4513" />
          <Text style={styles.actionText}>Moyens de paiement</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="help-circle-outline" size={20} color="#8B4513" />
          <Text style={styles.actionText}>Aide & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5D5C3' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FDF6EE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#3D2E1F' },
  email: { fontSize: 14, color: '#8B7355', marginTop: 4 },
  section: { marginTop: 16, backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#3D2E1F', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  rowText: { fontSize: 14, color: '#6B5B4D' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0E8DE' },
  actionText: { flex: 1, fontSize: 15, color: '#3D2E1F', marginLeft: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginHorizontal: 16, padding: 16, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
