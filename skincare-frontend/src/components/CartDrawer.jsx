import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-blush">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-deep-rose" />
                <h2 className="font-display text-xl text-ink">Your Ritual Bag</h2>
                {items.length > 0 && (
                  <span className="text-xs text-ink/40 font-body">({items.reduce((s,i)=>s+i.quantity,0)} items)</span>
                )}
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blush transition-colors text-ink/60 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-blush/50 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-rose/60" />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-ink mb-1">Your bag is empty</p>
                    <p className="text-sm text-ink/50">Begin your skincare ritual</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="btn-primary mt-2"
                  >
                    <Link to="/shop">Discover Products</Link>
                  </button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-blush/30 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] tracking-widest uppercase text-rose font-medium mb-0.5">{item.type}</p>
                        <p className="font-display text-base text-ink leading-tight">{item.name}</p>
                        <p className="text-xs text-ink/40 mt-0.5">{item.size}</p>
                        <div className="flex items-center justify-between mt-3">
                          {/* Qty */}
                          <div className="flex items-center gap-2 bg-blush/40 rounded-full px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-ink/60 hover:text-deep-rose transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-medium text-ink w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-ink/60 hover:text-deep-rose transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-display text-lg text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-ink/30 hover:text-rose transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-blush px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-ink/60">Subtotal</span>
                  <span className="font-display text-2xl text-ink">${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-ink/40 text-center">Shipping calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block text-center btn-primary"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs tracking-widest uppercase text-ink/50 hover:text-ink transition-colors py-1"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
