import { use } from 'react';
import { DebugContext } from './DebugContextCore';

export const useDebug = () => use(DebugContext);
