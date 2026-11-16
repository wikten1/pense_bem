import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

function subscribe(onChange: () => void) {
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}

export function useAppActive() {
  return useSyncExternalStore(subscribe, () => AppState.currentState, () => null) === 'active';
}
