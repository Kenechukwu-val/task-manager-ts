import { writable } from 'svelte/store';

export const token = writable<string | null>(null);
export const user = writable<{ id: string; name: string; email: string } | null>(null);