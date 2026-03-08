import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.servicebay.app',
    appName: 'ServiceBay',
    webDir: 'dist',

    // Status bar
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#09090b',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#09090b',
        },
        Keyboard: {
            resize: 'body',
            style: 'DARK',
        },
    },

    // For local dev with live reload
    server: {
        // Uncomment and set your local IP for live reload during development:
        // url: 'http://192.168.1.XXX:5173',
        // cleartext: true,
        androidScheme: 'https',
    },
};

export default config;
