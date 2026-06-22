import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hitech.potiramisu',
  appName: 'Po Tiramisu',
  webDir: 'out',
  plugins: {
    StatusBar: {
      backgroundColor: '#110c08',
      style: 'DARK',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#110c08',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'body',
      scrollPadding: true,
      style: 'DARK',
    },
  }
};

export default config;
