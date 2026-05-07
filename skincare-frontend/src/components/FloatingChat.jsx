import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, ChevronRight } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useCartStore } from '../store/cartStore'
import { fetchProductsByIds } from '../api'
import { ChatProductCard } from './ProductCard'

const QUICK_REPLIES = [
  'Oily + acne-prone skin',
  'Dry skin',
  'Sensitive skin',
  'Anti-aging routine',
  'Morning routine help',
]

export default function FloatingChat() {
  const location = useLocation()
  const { messages, isLoading, isPanelOpen, openPanel, closePanel, sendMessage } = useChatStore()
  const { addItem } = useCartStore()
  const [input, setInput] = useState('')
  const [chatProducts, setChatProducts] = useState({})
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isPanelOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isPanelOpen])

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.productIds?.length && !chatProducts[msg.id]) {
        fetchProductsByIds(msg.productIds).then(prods => {
          setChatProducts(prev => ({ ...prev, [msg.id]: prods }))
        })
      }
    })
  }, [messages])

  // Don't show on the advisor page itself — must be after all hooks
  if (location.pathname === '/advisor') return null

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage(text)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const recentMessages = messages.slice(-6)
  const lastBotHasProducts = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.productIds?.length > 0

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 300 }}
        onClick={openPanel}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-deep-rose rounded-full shadow-xl shadow-deep-rose/30 flex items-center justify-center text-cream hover:bg-ink transition-colors animate-pulse-soft"
        aria-label="Open Skin Advisor"
      >
        {isPanelOpen ? <X size={20} /> : <Sparkles size={20} />}
      </motion.button>

      {/* Slide-up panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 bg-cream rounded-2xl shadow-2xl shadow-ink/20 overflow-hidden border border-blush flex flex-col"
            style={{ maxHeight: '80vh', height: 520 }}
          >
            {/* Header */}
            <div className="bg-deep-rose px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gold/30 flex items-center justify-center">
                  <Sparkles size={12} className="text-gold" />
                </div>
                <div>
                  <p className="font-display text-sm text-cream leading-none">AI Skin Advisor</p>
                  <p className="text-[10px] text-cream/60 font-body tracking-widest uppercase">Lumière</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/advisor"
                  onClick={closePanel}
                  className="text-cream/70 hover:text-cream transition-colors"
                  title="Open full advisor"
                >
                  <ChevronRight size={16} />
                </Link>
                <button onClick={closePanel} className="text-cream/70 hover:text-cream transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-2'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-deep-rose/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="font-display text-xs text-deep-rose">L</span>
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-deep-rose text-cream rounded-tr-sm'
                            : 'bg-white text-ink rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {chatProducts[msg.id]?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {chatProducts[msg.id].map(p => (
                            <ChatProductCard
                              key={p.id}
                              product={p}
                              onAddToCart={addItem}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-deep-rose/10 flex items-center justify-center">
                    <span className="font-display text-xs text-deep-rose">L</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-rose/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                {QUICK_REPLIES.map(r => (
                  <button
                    key={r}
                    onClick={() => sendMessage(r)}
                    className="flex-shrink-0 text-[10px] tracking-wide border border-rose/30 text-deep-rose rounded-full px-3 py-1.5 hover:bg-blush transition-colors font-body"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-blush px-3 py-3 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your skin..."
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm font-body text-ink placeholder-ink/30 outline-none border border-blush focus:border-rose transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-deep-rose rounded-full flex items-center justify-center text-cream disabled:opacity-40 hover:bg-ink transition-colors flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
