import { Platform, TurboModuleRegistry } from 'react-native';

type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const memory = new Map<string, string>();

const memoryStore: KeyValueStore = {
  async getItem(key) {
    return memory.get(key) ?? null;
  },
  async setItem(key, value) {
    memory.set(key, value);
  },
};

function hasNativeStorage() {
  if (Platform.OS === 'web') {
    return true;
  }
  try {
    return Boolean(
      TurboModuleRegistry.get('RNCAsyncStorage') ||
        TurboModuleRegistry.get('RNC_AsyncSQLiteDBStorage') ||
        TurboModuleRegistry.get('PlatformLocalStorage'),
    );
  } catch {
    return false;
  }
}

export async function openStore(): Promise<{ store: KeyValueStore; persistent: boolean }> {
  if (!hasNativeStorage()) {
    return { store: memoryStore, persistent: false };
  }
  try {
    const module = await import('@react-native-async-storage/async-storage');
    return { store: module.default, persistent: true };
  } catch {
    return { store: memoryStore, persistent: false };
  }
}
