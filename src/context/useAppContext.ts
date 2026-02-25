import { useContext } from 'react';
import { AppContext } from './AppContextCore';
import type { AppContextType } from './AppContextCore';

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
