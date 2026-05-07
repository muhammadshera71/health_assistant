import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingBag, ChevronDown, ArrowLeft, Leaf } from 'lucide-react'
import { products as productsApi } from '../api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCartStore()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    productsApi.getBySlug(slug)
      .then(p => {
        setProduct(p)
        return productsApi.list({ limit: 50 })
      })
      .then(data => {
        setRelated(data.products.filter(p => p.slug !== slug).slice(0, 4))
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 rounded-full border-2 border-blush border-t-deep-rose animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <p className="font-display text-3xl text-ink/40">Product not found</p>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : product.rating || 0

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-ink/40 mb-8">
          <Link to="/" className="hover:text-rose transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-rose transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-ink/60">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl overflow-hidden aspect-[4/5] bg-blush/30"
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-deep-rose' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:pt-4">
            {product.badge && (
              <span className="inline-block bg-deep-rose text-cream text-[10px] tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                {product.badge}
              </span>
            )}
            <p className="text-xs tracking-widest uppercase text-rose font-medium mb-2">{product.type}</p>
            <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight mb-3">{product.name}</h1>
            <p className="text-ink/60 text-base mb-5">{product.shortDesc}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className={i <= Math.round(avgRating) ? 'fill-gold text-gold' : 'text-ink/20 fill-ink/10'} />
                ))}
              </div>
              <span className="text-sm text-ink/50">{avgRating.toFixed(1)} ({product.reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display text-4xl text-ink">${product.price}</span>
              <span className="text-sm text-ink/40">{product.size}</span>
            </div>

            {/* Skin types */}
            <div className="flex flex-wrap gap-2 mb-8">
              {product.skinTypes.filter(t => t !== 'all').map(t => (
                <span key={t} className="text-[10px] tracking-widest uppercase bg-blush text-ink/60 px-3 py-1.5 rounded-full border border-blush">
                  {t}
                </span>
              ))}
            </div>

            {/* Add to cart */}
            <div className="flex gap-4 items-center mb-10">
              <div className="flex items-center gap-3 bg-blush/40 rounded-full px-4 py-2.5 border border-blush">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-ink/50 hover:text-deep-rose w-5 text-center font-medium">−</button>
                <span className="w-6 text-center text-sm font-medium text-ink">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="text-ink/50 hover:text-deep-rose w-5 text-center font-medium">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full font-body text-xs tracking-widest uppercase font-medium transition-all duration-300 ${
                  added ? 'bg-green-600/90 text-white' : 'btn-primary'
                }`}
              >
                <ShoppingBag size={15} />
                {added ? 'Added to Ritual ✓' : 'Add to Ritual'}
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t border-blush">
              {[
                { key: 'description', label: 'Description' },
                { key: 'ingredients', label: 'Ingredients' },
                { key: 'how-to-use', label: 'How to Use' },
              ].map(tab => (
                <div key={tab.key} className="border-b border-blush">
                  <button
                    onClick={() => setActiveTab(activeTab === tab.key ? '' : tab.key)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-xs tracking-widest uppercase text-ink/70 font-medium">{tab.label}</span>
                    <ChevronDown size={15} className={`text-ink/40 transition-transform ${activeTab === tab.key ? 'rotate-180' : ''}`} />
                  </button>
                  {activeTab === tab.key && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pb-5"
                    >
                      {tab.key === 'description' && (
                        <p className="text-sm text-ink/60 leading-relaxed">{product.description}</p>
                      )}
                      {tab.key === 'ingredients' && (
                        <div className="flex flex-wrap gap-2">
                          {product.ingredients.map(ing => (
                            <span key={ing} className="flex items-center gap-1.5 text-xs bg-blush/50 text-ink/70 px-3 py-1.5 rounded-full">
                              <Leaf size={10} className="text-rose/60" />
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                      {tab.key === 'how-to-use' && (
                        <p className="text-sm text-ink/60 leading-relaxed">{product.howToUse}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl text-ink mb-8">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {product.reviews.map((r, i) => (
              <div key={i} className="bg-white border border-blush rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-gold text-gold' : 'text-ink/20 fill-ink/10'} />)}
                </div>
                <p className="font-display italic text-base text-ink leading-relaxed mb-4">"{r.text}"</p>
                <div className="flex justify-between items-center text-xs text-ink/40">
                  <span className="font-medium text-ink/60">{r.author}</span>
                  <span>{new Date(r.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl text-ink mb-8">Complete the Ritual</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
