import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.booksnap.app',
  appName: 'Booksnap',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      "covers.openlibrary.org",
      "openlibrary.org"
    ]
  }
};

export default config;
