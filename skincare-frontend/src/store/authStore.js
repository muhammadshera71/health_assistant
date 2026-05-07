import { create } from 'zustand'
import { auth as authApi } from '../api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    try {
      const user = await authApi.me()
      set({ user, loading: false })
      return user
    } catch {
      set({ user: null, loading: false })
      return null
    }
  },

  login: async (email, password) => {
    const user = await authApi.login(email, password)
    set({ user })
    return user
  },

  register: async (firstName, lastName, email, password) => {
    const user = await authApi.register(firstName, lastName, email, password)
    set({ user })
    return user
  },

  logout: async () => {
    await authApi.logout().catch(() => {})
    set({ user: null })
  },
}))
