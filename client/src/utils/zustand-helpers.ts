/**
 * Helpers para configuração de Zustand stores
 * Inclui persist, devtools e migrations
 */

import { StateCreator } from 'zustand';
import { PersistOptions, persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

/**
 * Configuração de persistência com migrations
 */
export interface StoreMigration {
  version: number;
  migrate: (persistedState: any) => any;
}

/**
 * Cria store com persist + devtools
 */
export function createPersistedStore<T>(
  name: string,
  storeCreator: StateCreator<T>,
  persistOptions?: Omit<PersistOptions<T>, 'name' | 'version'> & {
    version?: number;
    migrations?: StoreMigration[];
  }
) {
  const { version = 1, migrations = [], ...restPersistOptions } = persistOptions || {};

  // Migration function
  const migrate = (persistedState: any, version: number): any => {
    if (!persistedState) return persistedState;

    const currentVersion = persistedState.version || 0;
    
    if (currentVersion >= version) {
      return persistedState;
    }

    // Apply migrations in order
    let state = persistedState;
    for (let v = currentVersion + 1; v <= version; v++) {
      const migration = migrations.find(m => m.version === v);
      if (migration) {
        state = migration.migrate(state);
      }
    }

    return { ...state, version };
  };

  const persistConfig: PersistOptions<T> = {
    name,
    version,
    migrate,
    ...restPersistOptions,
  };

  // Apply middleware: devtools -> persist
  const store = devtools(
    persist(storeCreator, persistConfig),
    { name }
  );

  return store;
}
