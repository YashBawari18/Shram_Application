import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Radius, Shadow, Spacing } from '../../src/constants/theme'

function TabIcon({ iconName, label, focused }: { iconName: keyof typeof Ionicons.glyphMap; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={iconName} size={22} color={focused ? Colors.primary : Colors.textMuted} />
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  )
}

export default function WorkerLayout() {
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
          tabBarIcon: ({ focused }) => <TabIcon iconName={focused ? "home" : "home-outline"} label="होम" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon iconName={focused ? "briefcase" : "briefcase-outline"} label="काम" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon iconName={focused ? "person" : "person-outline"} label="प्रोफ़ाइल" focused={focused} />,
        }}
      />
      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="rate/[id]" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    height: 72,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
    paddingBottom: 10,
    paddingTop: 10,
  },
  iconWrap: { alignItems: 'center', gap: 3 },
  emoji: { fontSize: 22 },
  label: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  labelActive: { color: Colors.primary, fontWeight: Typography.bold },
})
