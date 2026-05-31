module.exports = {
  expo: {
    name: 'Shram',
    slug: 'shram',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#F5C518',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'app.shram.worker',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Shram needs your location to show nearby workers and to let contractors find you.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#F5C518',
      },
      package: 'app.shram.worker',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
    },
    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Shram needs your location to show nearby workers and for contractors to find you.',
        },
      ],
    ],
    scheme: 'shram',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "4f6a1353-8dae-4879-b491-92090e82ac24"
      }
    },
  }
}
