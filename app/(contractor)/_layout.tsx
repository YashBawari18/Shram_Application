import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Typography } from '../../src/constants/theme'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  )
}

export default function ContractorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="मज़दूर" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="बुकिंग" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="प्रोफ़ाइल" focused={focused} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="worker/[id]" options={{ href: null }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  iconWrap: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 22 },
  label: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  labelActive: { color: Colors.black, fontWeight: Typography.bold },
})
