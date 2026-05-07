import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { products as productsApi } from '../api'
import ProductCard from '../components/ProductCard'

const SKIN_TYPES = ['All', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive']
const CONCERNS = ['Brightening', 'Anti-Aging', 'Acne', 'Hydration', 'Sensitivity', 'Pores', 'Barrier']
const TYPES = ['All', 'Serum', 'Moisturiser', 'Toner', 'Mask', 'Cleanser', 'SPF / Sunscreen', 'Eye Cream', 'Night Treatment', 'Facial Mist', 'Lip Treatment']
const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Best Rated', 'Most Reviewed']

export default function Shop() {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [skinType, setSkinType] = useState('All')
  const [activeConcerns, setActiveConcerns] = useState([])
  const [productType, setProductType] = useState('All')
  const [sort, setSort] = useState('Featured')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    productsApi.list({ limit: 100 })
      .then(data => setAllProducts(data.products))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const toggleConcern = (c) => {
    setActiveConcerns(prev =>
      prev.includes(c.toLowerCase()) ? prev.filter(x => x !== c.toLowerCase()) : [...prev, c.toLowerCase()]
    )
  }

  const filtered = useMemo(() => {
    let list = [...allProducts]
    if (skinType !== 'All') list = list.filter(p => p.skinTypes.includes(skinType.toLowerCase()) || p.skinTypes.includes('all'))
    if (productType !== 'All') list = list.filter(p => p.type === productType)
    if (activeConcerns.length) list = list.filter(p => activeConcerns.some(c => p.concerns.includes(c)))
    switch (sort) {
      case 'Price: Low to High': list.sort((a, b) => a.price - b.price); break
      case 'Price: High to Low': list.sort((a, b) => b.price - a.price); break
      case 'Best Rated': list.sort((a, b) => b.rating - a.rating); break
      case 'Most Reviewed': list.sort((a, b) => b.reviewCount - a.reviewCount); break
    }
    return list
  }, [allProducts, skinType, productType, activeConcerns, sort])

  const hasFilters = skinType !== 'All' || productType !== 'All' || activeConcerns.length > 0

  const clearFilters = () => {
    setSkinType('All')
    setProductType('All')
    setActiveConcerns([])
  }

  return (
    <main className="pt-20 min-h-screen">
      <div className="bg-blush/30 border-b border-blush py-12 px-6 text-center">
        <p className="text-[10px] tracking-widest uppercase text-rose font-medium mb-3">Our Collection</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink font-light">The Ritual Shop</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 text-xs tracking-widest uppercase border rounded-full px-4 py-2.5 transition-colors ${filtersOpen ? 'bg-deep-rose text-cream border-deep-rose' : 'border-blush text-ink/60 hover:border-rose'}`}
            >
              <SlidersHorizontal size={13} />
              Filters {hasFilters && `(${(skinType !== 'All' ? 1 : 0) + (productType !== 'All' ? 1 : 0) + activeConcerns.length})`}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-rose/80 hover:text-rose transition-colors">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/40">{filtered.length} products</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs bg-white border border-blush rounded-full px-4 py-2.5 text-ink/70 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-blush p-6 mb-8 space-y-6"
          >
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink/40 mb-3">Skin Type</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map(s => (
                  <button key={s} onClick={() => setSkinType(s)}
                    className={`text-xs tracking-wide border rounded-full px-4 py-2 transition-colors ${skinType === s ? 'bg-deep-rose text-cream border-deep-rose' : 'border-blush text-ink/60 hover:border-rose'}`}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink/40 mb-3">Skin Concerns</p>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map(c => (
                  <button key={c} onClick={() => toggleConcern(c)}
                    className={`text-xs tracking-wide border rounded-full px-4 py-2 transition-colors ${activeConcerns.includes(c.toLowerCase()) ? 'bg-rose text-cream border-rose' : 'border-blush text-ink/60 hover:border-rose'}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink/40 mb-3">Product Type</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setProductType(t)}
                    className={`text-xs tracking-wide border rounded-full px-4 py-2 transition-colors ${productType === t ? 'bg-deep-rose text-cream border-deep-rose' : 'border-blush text-ink/60 hover:border-rose'}`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-blush/30 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display italic text-3xl text-ink/30 mb-3">No products found</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product, i) => (
              <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}
