/**
 * CUSTOM HOOKS over Redux
 *
 * Typed wrappers around useDispatch/useSelector so every component
 * gets full TypeScript inference without importing RootState everywhere.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
