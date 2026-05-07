import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function ProductCard({ product, className = '' }) {
  const { addItem } = useCartStore()

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-rose/10 transition-shadow duration-500 ${className}`}
    >
      {/* Image */}
      <Link to={`/shop/${product.slug}`} className="block overflow-hidden bg-blush/30 aspect-[3/4] relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-deep-rose text-cream text-[10px] tracking-widest uppercase font-medium px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product) }}
            className="w-full bg-deep-rose/95 backdrop-blur-sm text-cream font-body text-xs tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 hover:bg-ink transition-colors"
          >
            <ShoppingBag size={14} />
            Add to Ritual
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] tracking-widest uppercase text-rose font-medium mb-1">{product.type}</p>
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg text-ink leading-snug hover:text-deep-rose transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-ink/50 mt-0.5 mb-2 line-clamp-1">{product.shortDesc}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-gold fill-gold" />
            <span className="text-xs text-ink/60">{product.rating} ({product.reviewCount})</span>
          </div>
          <span className="font-display text-lg text-ink font-medium">${product.price}</span>
        </div>
      </div>
    </motion.div>
  )
}

/* Compact inline card used inside the chatbot */
export function ChatProductCard({ product, onAddToCart }) {
  return (
    <div className="flex gap-3 bg-cream rounded-xl border border-blush p-3 mt-2 hover:border-rose/40 transition-colors">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-blush/50 flex-shrink-0">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] tracking-widest uppercase text-rose font-medium">{product.type}</p>
        <p className="font-display text-sm text-ink leading-tight mt-0.5">{product.name}</p>
        <p className="text-[11px] text-ink/50 mt-0.5 line-clamp-1">{product.shortDesc}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display text-base text-deep-rose font-medium">${product.price}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="text-[10px] tracking-widest uppercase bg-deep-rose text-cream px-3 py-1.5 rounded-full hover:bg-ink transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
