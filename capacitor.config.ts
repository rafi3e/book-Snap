import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.booksnap.app',
  appName: 'Booksnap',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.100:3000',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      "covers.openlibrary.org",
      "openlibrary.org"
    ]
  }
};

export default config;