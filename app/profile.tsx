import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { colors, Button, ScreenLayout } from '../src/presentation/components';

export default function ProfileConfigScreen() {
  const [sector, setSector] = useState('Prestação de Serviços');
  const [cnae, setCnae] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('SP');
  const insets = useSafeAreaInsets();

  return (
    <ScreenLayout>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Configure seu negócio</Text>
        <Text style={styles.subtitle}>
          Personalize seu perfil para que nosso{' '}
          <Text style={{ color: colors.green, fontWeight: '700' }}>Concierge Digital</Text>{' '}
          encontre as melhores licitações.
        </Text>

        {/* Sector */}
        <View style={styles.field}>
          <Text style={styles.label}>Ramo de Atuação</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={sector}
              onValueChange={setSector}
              style={styles.picker}
            >
              <Picker.Item label="Prestação de Serviços" value="Prestação de Serviços" />
              <Picker.Item label="Obras e Engenharia" value="Obras e Engenharia" />
              <Picker.Item label="Papelaria e Material de Escritório" value="Papelaria" />
              <Picker.Item label="Tecnologia da Informação" value="TI" />
            </Picker>
          </View>
        </View>

        {/* CNAE */}
        <View style={styles.field}>
          <Text style={styles.label}>CNAE Principal</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 8211-3/00"
            placeholderTextColor={`${colors.textMuted}80`}
            value={cnae}
            onChangeText={setCnae}
            keyboardType="default"
          />
        </View>

        {/* City + UF */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua cidade"
              placeholderTextColor={`${colors.textMuted}80`}
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={[styles.field, { width: 110 }]}>
            <Text style={styles.label}>UF</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={uf} onValueChange={setUf} style={styles.picker}>
                <Picker.Item label="SP" value="SP" />
                <Picker.Item label="RJ" value="RJ" />
                <Picker.Item label="MG" value="MG" />
                <Picker.Item label="RS" value="RS" />
                <Picker.Item label="BA" value="BA" />
              </Picker>
            </View>
          </View>
        </View>

        <Button
          variant="primary"
          style={styles.saveButton}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Salvar Configurações</Text>
        </Button>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  title: { fontSize: 28, fontWeight: '900', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  input: {
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    height: 54,
    justifyContent: 'center',
  },
  picker: {
    color: colors.text,
    height: 54,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 16,
  },
});
