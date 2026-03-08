import { createContext } from 'react';

export interface DebugContextType {
    enabled: boolean;
}

export const DebugContext = createContext<DebugContextType>({ enabled: false });
