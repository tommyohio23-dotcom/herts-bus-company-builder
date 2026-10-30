import { createContext, useContext } from 'react';
import type { AreaKey } from './areas';

/** Display currency for each area menu; game amounts are kept as local-currency numbers. */
export const AREA_CURRENCY: Record<AreaKey, string> = { herts: '£', london: '£', beds: '£', bucks: '£', essex: '£', boston: '$', nyc: '$', berlin: '€' };
export const CurrencyContext = createContext('£');
export const useCur = () => useContext(CurrencyContext);
export const AreaContext = createContext<AreaKey>('herts');
export const useArea = () => useContext(AreaContext);
