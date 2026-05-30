import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { Colors } from '../src/constants/theme'

export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary || '#FFD700'} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
})
