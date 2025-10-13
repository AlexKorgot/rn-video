import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';

export default function UnsupportedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR недоступен на этом устройстве</Text>
      <Text style={styles.text}>
        Проверьте поддержку ARKit (iOS) или ARCore (Android).
      </Text>
      <Text
        style={styles.link}
        onPress={() => Linking.openURL('https://developers.google.com/ar/devices')}
      >
        Список поддерживаемых устройств ARCore
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  text: { fontSize: 14, textAlign: 'center', opacity: 0.8 },
  link: { marginTop: 12, textDecorationLine: 'underline' }
});

