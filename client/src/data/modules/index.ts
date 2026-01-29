/**
 * Module Index
 * Central export for all curriculum modules
 */

export { module1_1 } from './module-1-1';
export { module1_2 } from './module-1-2';

import { module1_1 } from './module-1-1';
import { module1_2 } from './module-1-2';
import { Module } from '@/types/pedagogy';

// All modules in order
export const allModules: Module[] = [
    module1_1,
    module1_2,
];

// Quick lookup by ID
export const modulesById: Record<string, Module> = {
    [module1_1.id]: module1_1,
    [module1_2.id]: module1_2,
};

// Check if module is unlocked based on prerequisites
export function isModuleUnlocked(
    moduleId: string,
    completedModules: string[]
): boolean {
    const module = modulesById[moduleId];
    if (!module) return false;

    // First module is always unlocked
    if (module.prerequisites.length === 0) return true;

    // Check if all prerequisites are completed
    return module.prerequisites.every(prereq => completedModules.includes(prereq));
}
