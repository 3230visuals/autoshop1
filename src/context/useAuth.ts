import { use } from 'react';
import { AuthContext } from './AuthContextCore';
import type { AuthContextType } from './AuthContextCore';

export const useAuth = (): AuthContextType => {
    const ctx = use(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
