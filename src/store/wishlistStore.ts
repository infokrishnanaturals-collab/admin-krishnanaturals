import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase/config';

interface WishlistState {
    items: string[];
    isLoading: boolean;
    syncWithDatabase: () => Promise<void>;
    toggleItem: (productId: string) => Promise<void>;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,

            syncWithDatabase: async () => {
                const user = auth.currentUser;
                if (!user) return;

                set({ isLoading: true });
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('wishlists')
                    .select('product_id')
                    .eq('user_id', user.uid);

                if (!error && data) {
                    set({ items: data.map(d => d.product_id), isLoading: false });
                } else {
                    set({ isLoading: false });
                }
            },

            toggleItem: async (productId: string) => {
                const user = auth.currentUser;
                if (!user) {
                    toast.error("Please login to save to wishlist");
                    return;
                }

                const supabase = createClient();
                const currentItems = get().items;
                const isSaved = currentItems.includes(productId);

                // Optimistic UI update
                if (isSaved) {
                    set({ items: currentItems.filter(id => id !== productId) });
                    toast.success("Removed from wishlist");

                    // Background DB Sync
                    await supabase.from('wishlists').delete().eq('user_id', user.uid).eq('product_id', productId);
                } else {
                    set({ items: [...currentItems, productId] });
                    toast.success("Added to wishlist");

                    // Background DB Sync
                    await supabase.from('wishlists').insert({ user_id: user.uid, product_id: productId });
                }
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'kn-wishlist-storage',
        }
    )
);
