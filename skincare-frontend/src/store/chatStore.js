import { create } from 'zustand'

const SESSION_KEY = 'lumiere-chat-history'

const loadSession = () => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveSession = (messages) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages))
  } catch {}
}

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: "Hello, and welcome to your Lumière skin consultation ✨ I'm your personal AI Skin Advisor, here to guide you toward a ritual that truly works for your unique skin.\n\nTo begin — could you tell me a little about your skin type? Are you typically oily, dry, combination, normal, or sensitive?",
  timestamp: Date.now(),
  productIds: [],
}

export const useChatStore = create((set, get) => ({
  messages: loadSession().length ? loadSession() : [GREETING],
  isLoading: false,
  isPanelOpen: false,

  addMessage: (message) => {
    const msgs = [...get().messages, { id: Date.now(), timestamp: Date.now(), ...message }]
    set({ messages: msgs })
    saveSession(msgs)
  },

  setLoading: (isLoading) => set({ isLoading }),

  clearChat: () => {
    const reset = [{ ...GREETING, id: 'greeting', timestamp: Date.now() }]
    set({ messages: reset })
    saveSession(reset)
  },

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set(s => ({ isPanelOpen: !s.isPanelOpen })),

  sendMessage: async (userContent) => {
    const { messages, addMessage, setLoading } = get()

    addMessage({ role: 'user', content: userContent, productIds: [] })
    setLoading(true)

    const apiMessages = [...messages, { role: 'user', content: userContent }]
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      const rawContent = data.content || ''

      // Parse product recommendations from <recommendations>{"ids":[...]}</recommendations>
      const recMatch = rawContent.match(/<recommendations>([\s\S]*?)<\/recommendations>/)
      let productIds = []
      let displayContent = rawContent

      if (recMatch) {
        try {
          const parsed = JSON.parse(recMatch[1])
          productIds = parsed.ids || []
        } catch {}
        displayContent = rawContent.replace(/<recommendations>[\s\S]*?<\/recommendations>/, '').trim()
      }

      addMessage({ role: 'assistant', content: displayContent, productIds })
    } catch (err) {
      addMessage({
        role: 'assistant',
        content: "I'm so sorry — it seems I'm having a brief connection issue. Please try again in a moment, and I'll be right here to help you find your perfect ritual.",
        productIds: [],
      })
    } finally {
      setLoading(false)
    }
  },
}))
