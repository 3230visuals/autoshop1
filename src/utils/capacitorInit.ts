/**
 * Capacitor native plugin initialization.
 * Called once on app mount to configure StatusBar, Keyboard, and SplashScreen
 * for native Android/iOS shells. Safe no-op on web.
 */
import { Capacitor } from '@capacitor/core';

export async function initCapacitorPlugins(): Promise<void> {
    // Only run on native platforms (Android/iOS), not web
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Status Bar — dark background, light icons
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#09090b' });
    } catch {
        // StatusBar not available — ignore
    }

    try {
        // Keyboard — adjust viewport when keyboard opens (iOS)
        const { Keyboard } = await import('@capacitor/keyboard');
        void Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-open');
        });
        void Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-open');
        });
    } catch {
        // Keyboard not available — ignore
    }

    try {
        // Splash Screen — hide after app is mounted
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
    } catch {
        // SplashScreen not available — ignore
    }
}
