import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cart as cartApi } from '../api'
import { useAuthStore } from './authStore'

function isAuthed() {
  return !!useAuthStore.getState().user
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Fetch cart from server and replace local state
      syncFromServer: async () => {
        try {
          const data = await cartApi.get()
          set({ items: data.items })
        } catch {
          // not logged in — keep local state
        }
      },

      // Push all local items to server after login
      pushLocalToServer: async () => {
        const { items } = get()
        if (!items.length) return
        for (const item of items) {
          await cartApi.addItem(item.id, item.quantity).catch(() => {})
        }
        await get().syncFromServer()
      },

      addItem: async (product, quantity = 1) => {
        if (isAuthed()) {
          try {
            const serverItem = await cartApi.addItem(product.id, quantity)
            const { items } = get()
            const idx = items.findIndex(i => i.id === product.id)
            if (idx >= 0) {
              set({ items: items.map(i => i.id === product.id ? serverItem : i), isOpen: true })
            } else {
              set({ items: [...items, serverItem], isOpen: true })
            }
          } catch (err) {
            console.error('Cart add failed', err)
          }
        } else {
          const { items } = get()
          const existing = items.find(i => i.id === product.id)
          if (existing) {
            set({ items: items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i), isOpen: true })
          } else {
            set({ items: [...items, { ...product, quantity }], isOpen: true })
          }
        }
      },

      removeItem: async (productId) => {
        if (isAuthed()) {
          const item = get().items.find(i => i.id === productId)
          if (item?._serverId) {
            await cartApi.removeItem(item._serverId).catch(() => {})
          }
        }
        set(s => ({ items: s.items.filter(i => i.id !== productId) }))
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        if (isAuthed()) {
          const item = get().items.find(i => i.id === productId)
          if (item?._serverId) {
            try {
              const updated = await cartApi.updateItem(item._serverId, quantity)
              set(s => ({ items: s.items.map(i => i.id === productId ? updated : i) }))
              return
            } catch (err) {
              console.error('Cart update failed', err)
            }
          }
        }
        set(s => ({ items: s.items.map(i => i.id === productId ? { ...i, quantity } : i) }))
      },

      clearCart: async () => {
        if (isAuthed()) {
          await cartApi.clear().catch(() => {})
        }
        set({ items: [] })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    { name: 'lumiere-cart' }
  )
)
