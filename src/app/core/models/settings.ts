import { SecuritySettings } from '../services/anti-cheat.service';

export interface PlatformSettings {
    siteName: string;
    welcomeMessage: string;
    passingScore?: number;
    maxAttempts?: number;
    allowRetakes?: boolean;
    showCorrectAnswers?: boolean;
    securitySettings?: SecuritySettings;
}
