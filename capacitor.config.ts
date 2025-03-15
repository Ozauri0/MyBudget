// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mybudget.app',
  appName: 'MyBudget',
  webDir: 'www/browser',
  plugins: {
    CapacitorSQLite: {
      iosIsEncryption: true,
      iosKeychainPrefix: 'angular-sqlite-app-starter',
      androidIsEncryption: true,
      androidNewsArchitectureVersion: 2
    },
    EdgeToEdge: {
      backgroundColor: "#000000", //Color del notch
    },
    
  }
};

export default config;