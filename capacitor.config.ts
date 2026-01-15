import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.pathmark.app',
    appName: 'PathMark',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
