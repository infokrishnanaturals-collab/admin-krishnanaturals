import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@/lib/firebase/config';

export interface CartItem {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    weight: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const syncCartWithServer = async (items: CartItem[]) => {
    const user = auth?.currentUser;
    if (!user) return;

    if (items.length === 0) {
        await fetch(process.env.NEXT_PUBLIC_API_URL + `/cart/sync?userId=${user.uid}`, { method: 'DELETE' });
    } else {
        await fetch(process.env.NEXT_PUBLIC_API_URL + '/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, userEmail: user.email, items })
        });
    }
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => {
                let newItems: CartItem[];
                const existingItem = state.items.find((i) => i.id === item.id);
                if (existingItem) {
                    newItems = state.items.map((i) =>
                        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                    );
                } else {
                    newItems = [...state.items, item];
                }
                syncCartWithServer(newItems);
                return { items: newItems };
            }),
            removeItem: (id) => set((state) => {
                const newItems = state.items.filter((i) => i.id !== id);
                syncCartWithServer(newItems);
                return { items: newItems };
            }),
            updateQuantity: (id, quantity) => set((state) => {
                const newItems = state.items.map((i) =>
                    i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
                );
                syncCartWithServer(newItems);
                return { items: newItems };
            }),
            clearCart: () => {
                set({ items: [] });
                syncCartWithServer([]);
            },
            getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: 'kn-cart-storage',
        }
    )
);
