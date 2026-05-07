import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'

const CATEGORIES = ['All', 'Ingredients', 'Skin Tips', 'Rituals', 'Science', 'Sustainability']

const POSTS = [
  {
    id: 1,
    slug: 'vitamin-c-guide',
    category: 'Ingredients',
    title: 'The Complete Guide to Vitamin C in Skincare',
    excerpt: 'Everything you need to know about L-Ascorbic Acid — from concentration and pH to stability and layering with other actives.',
    image: 'https://picsum.photos/seed/blog1/800/500',
    readTime: 8,
    date: '2024-11-10',
    featured: true,
  },
  {
    id: 2,
    slug: 'morning-ritual',
    category: 'Rituals',
    title: 'The 5-Minute Morning Ritual That Changed Our Customers\' Skin',
    excerpt: 'You don\'t need an hour-long routine. Here\'s the distilled, science-led approach that maximises results with minimal steps.',
    image: 'https://picsum.photos/seed/blog2/800/500',
    readTime: 5,
    date: '2024-10-28',
    featured: false,
  },
  {
    id: 3,
    slug: 'retinol-beginners',
    category: 'Ingredients',
    title: 'Retinol for Beginners: Start Slowly, Glow Permanently',
    excerpt: 'The most powerful anti-ageing ingredient available without prescription — and how to introduce it without damaging your barrier.',
    image: 'https://picsum.photos/seed/blog3/800/500',
    readTime: 6,
    date: '2024-10-15',
    featured: false,
  },
  {
    id: 4,
    slug: 'skin-barrier',
    category: 'Science',
    title: 'Why Your Skin Barrier Is Everything (and How to Fix It)',
    excerpt: 'The skin barrier is the foundation of all skin health. When it\'s compromised, nothing works. Here\'s the science and the solution.',
    image: 'https://picsum.photos/seed/blog4/800/500',
    readTime: 7,
    date: '2024-10-02',
    featured: false,
  },
  {
    id: 5,
    slug: 'clean-beauty',
    category: 'Sustainability',
    title: 'What "Clean Beauty" Actually Means at Lumière',
    excerpt: 'The term is everywhere, but what does it really mean? We share our complete ingredient standards and formulation philosophy.',
    image: 'https://picsum.photos/seed/blog5/800/500',
    readTime: 4,
    date: '2024-09-20',
    featured: false,
  },
  {
    id: 6,
    slug: 'layering-actives',
    category: 'Skin Tips',
    title: 'The Art of Layering Skincare Actives Without Conflict',
    excerpt: 'Niacinamide and vitamin C. Retinol and AHAs. Learn which actives play well together and which need different routines.',
    image: 'https://picsum.photos/seed/blog6/800/500',
    readTime: 9,
    date: '2024-09-08',
    featured: false,
  },
]

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const filtered = activeCategory === 'All' ? POSTS : POSTS.filter(p => p.category === activeCategory)
  const featured = POSTS.find(p => p.featured)
  const rest = filtered.filter(p => !p.featured || activeCategory !== 'All')

  return (
    <main className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-ink text-cream py-16 px-6 text-center">
        <p className="font-display italic text-rose text-xl mb-3">Stories & Science</p>
        <h1 className="font-display text-6xl text-cream font-light">The Lumière Journal</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 text-xs tracking-widest uppercase border rounded-full px-5 py-2.5 transition-colors ${
                activeCategory === c ? 'bg-deep-rose text-cream border-deep-rose' : 'border-blush text-ink/60 hover:border-rose'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {activeCategory === 'All' && featured && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8 mb-14 bg-white rounded-3xl overflow-hidden border border-blush hover:border-rose/30 transition-colors"
          >
            <div className="aspect-video lg:aspect-auto overflow-hidden bg-blush/30">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <span className="text-[10px] tracking-widest uppercase bg-deep-rose text-cream px-3 py-1 rounded-full inline-block mb-5 w-fit">{featured.category}</span>
              <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight mb-4">{featured.title}</h2>
              <p className="text-sm text-ink/55 leading-relaxed mb-7">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-ink/30">
                  <Clock size={12} />
                  <span>{featured.readTime} min read</span>
                  <span>·</span>
                  <span>{new Date(featured.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                </div>
                <Link
                  to={`/blog/${featured.slug}`}
                  className="flex items-center gap-2 text-xs tracking-widest uppercase text-deep-rose hover:text-ink transition-colors group"
                >
                  Read More <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.article>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl overflow-hidden border border-blush hover:border-rose/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="aspect-video overflow-hidden bg-blush/30">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] tracking-widest uppercase text-rose font-medium">{post.category}</span>
                  <div className="flex items-center gap-1 text-[10px] text-ink/30">
                    <Clock size={10} />
                    <span>{post.readTime} min</span>
                  </div>
                </div>
                <h3 className="font-display text-xl text-ink leading-snug mb-2 group-hover:text-deep-rose transition-colors">{post.title}</h3>
                <p className="text-xs text-ink/50 leading-relaxed line-clamp-2 mb-5">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink/30">{new Date(post.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-deep-rose hover:text-ink transition-colors group/link"
                  >
                    Read <ArrowRight size={11} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </main>
  )
}
