import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, RotateCcw, ArrowLeft } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useCartStore } from '../store/cartStore'
import { fetchProductsByIds } from '../api'
import { ChatProductCard } from '../components/ProductCard'

const QUICK_REPLIES = [
  'I have oily + acne-prone skin',
  'My skin is very dry',
  'I have sensitive skin',
  'I\'m concerned about fine lines',
  'Help me build a morning routine',
  'I want to brighten my complexion',
  'Combination skin concerns',
]

export default function Advisor() {
  const { messages, isLoading, sendMessage, clearChat } = useChatStore()
  const { addItem } = useCartStore()
  const [input, setInput] = useState('')
  const [chatProducts, setChatProducts] = useState({})
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    messages.forEach(msg => {
      if (msg.productIds?.length && !chatProducts[msg.id]) {
        fetchProductsByIds(msg.productIds).then(prods => {
          setChatProducts(prev => ({ ...prev, [msg.id]: prods }))
        })
      }
    })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage(text)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickReply = (text) => {
    if (isLoading) return
    sendMessage(text)
  }

  const showQuickReplies = messages.length <= 2

  return (
    <div className="flex flex-col h-screen bg-cream" style={{ paddingTop: 0 }}>
      {/* Header */}
      <div className="bg-deep-rose text-cream flex-shrink-0" style={{ paddingTop: '4rem' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-cream/60 hover:text-cream transition-colors flex items-center gap-1.5 text-xs tracking-wide"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Lumière</span>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-gold" />
              <h1 className="font-display text-lg tracking-wide text-cream">AI Skin Advisor</h1>
              <Sparkles size={14} className="text-gold" />
            </div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/50 mt-0.5">Lumière</p>
          </div>

          <button
            onClick={clearChat}
            title="Reset conversation"
            className="text-cream/50 hover:text-cream transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Subtle status */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-cream/40 tracking-widest uppercase">Online · Available now</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {/* Bot avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-deep-rose flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-deep-rose/20">
                    <span className="font-display text-gold text-sm font-medium">L</span>
                  </div>
                )}

                <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? '' : ''}`}>
                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-body whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-deep-rose text-cream rounded-tr-sm shadow-md shadow-deep-rose/20'
                        : 'bg-white text-ink rounded-tl-sm shadow-sm border border-blush/50'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Product recommendation cards */}
                  {chatProducts[msg.id]?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 space-y-2"
                    >
                      <p className="text-[10px] tracking-widest uppercase text-rose/80 font-medium ml-1">
                        Recommended for you
                      </p>
                      {chatProducts[msg.id].map(product => (
                        <ChatProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={addItem}
                        />
                      ))}
                      <Link
                        to="/shop"
                        className="block text-center text-[10px] tracking-widest uppercase text-deep-rose/70 hover:text-deep-rose mt-2 transition-colors"
                      >
                        View all products →
                      </Link>
                    </motion.div>
                  )}

                  <p className="text-[10px] text-ink/25 mt-1.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-deep-rose flex items-center justify-center flex-shrink-0 shadow-md shadow-deep-rose/20">
                <span className="font-display text-gold text-sm font-medium">L</span>
              </div>
              <div className="bg-white border border-blush/50 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 bg-rose/50 rounded-full block"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick replies */}
      <AnimatePresence>
        {showQuickReplies && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex-shrink-0 bg-cream/80 backdrop-blur-sm border-t border-blush"
          >
            <div className="max-w-3xl mx-auto px-4 py-3">
              <p className="text-[9px] tracking-widest uppercase text-ink/30 mb-2">Quick Replies</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {QUICK_REPLIES.map(r => (
                  <button
                    key={r}
                    onClick={() => handleQuickReply(r)}
                    className="flex-shrink-0 text-xs border border-rose/30 text-deep-rose rounded-full px-4 py-2 hover:bg-blush hover:border-rose transition-colors font-body whitespace-nowrap"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-blush shadow-lg shadow-ink/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe your skin, ask about routines, ingredients..."
            rows={1}
            className="flex-1 bg-blush/30 rounded-2xl px-5 py-3 text-sm font-body text-ink placeholder-ink/30 outline-none resize-none border border-transparent focus:border-rose/40 focus:bg-white transition-all max-h-32 leading-relaxed"
            style={{ minHeight: '48px' }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-deep-rose rounded-full flex items-center justify-center text-cream disabled:opacity-35 hover:bg-ink transition-colors flex-shrink-0 shadow-md shadow-deep-rose/25"
          >
            <Send size={16} />
          </motion.button>
        </div>
        <p className="text-center text-[9px] text-ink/20 pb-2 tracking-wide">
          AI recommendations are personalised but not a substitute for dermatological advice.
        </p>
      </div>
    </div>
  )
}
