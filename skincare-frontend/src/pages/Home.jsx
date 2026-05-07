import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Star, Sparkles, Leaf, FlaskConical, Heart } from 'lucide-react'
import { products as productsApi } from '../api'
import ProductCard from '../components/ProductCard'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

const TESTIMONIALS = [
  { name: 'Isabelle C.', location: 'London', rating: 5, text: 'Lumière has completely transformed my skin. Three months in and I receive compliments daily. My dull, uneven complexion is now genuinely luminous.', product: 'Luminous Vitamin C Serum' },
  { name: 'Priya S.', location: 'New York', rating: 5, text: 'After years of struggling with sensitive skin, I finally found a brand I can trust. Every product is gentle, effective and utterly luxurious to use.', product: 'Calming Rose Mist' },
  { name: 'Amélie D.', location: 'Paris', rating: 5, text: 'The Retinol Night Renewal is the most sophisticated formula I\'ve encountered. Fine lines softer, skin firmer — visible results in two weeks.', product: 'Retinol Night Renewal' },
]

const VALUES = [
  { icon: <Leaf size={20} />, title: 'Clean Formulas', desc: 'Free from parabens, sulphates, mineral oils and synthetic fragrances.' },
  { icon: <FlaskConical size={20} />, title: 'Science-Backed', desc: 'Each formula is developed with dermatologists and validated in clinical studies.' },
  { icon: <Heart size={20} />, title: 'Cruelty-Free', desc: 'Certified vegan and never tested on animals. Sustainably sourced ingredients.' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    productsApi.list({ featured: true, limit: 4 })
      .then(data => setFeatured(data.products))
      .catch(() => setFeatured([]))
  }, [])

  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-cream pt-20">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-[45vw] h-[45vw] max-w-2xl bg-blush/60 animate-blob opacity-70 -z-0" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
        <div className="absolute -bottom-20 left-0 w-[30vw] h-[30vw] max-w-lg bg-blush/40 animate-blob opacity-50 -z-0" style={{ borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', animationDelay: '3s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <motion.p
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate="visible"
              className="font-display italic text-rose text-lg mb-6 tracking-wide"
            >
              Curated for your skin
            </motion.p>

            <div className="overflow-hidden">
              <motion.h1
                variants={fadeUp}
                custom={1}
                initial="hidden"
                animate="visible"
                className="font-display text-7xl sm:text-8xl lg:text-9xl text-ink leading-none"
              >
                Lumi<span className="italic text-deep-rose">n</span>ous.
              </motion.h1>
            </div>
            <motion.h1
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-ink/30 leading-none font-light pl-8 mt-2"
            >
              Pure.
            </motion.h1>
            <motion.h1
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="visible"
              className="font-display italic text-5xl sm:text-6xl lg:text-7xl text-deep-rose leading-none pl-16 mt-2"
            >
              Yours.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="visible"
              className="text-ink/60 text-base leading-relaxed mt-8 max-w-md"
            >
              Science-backed luxury skincare for women who understand that radiance is cultivated — with intention, ritual, and ingredients that truly work.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={5}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link to="/shop" className="btn-primary">
                Shop the Collection
              </Link>
              <Link to="/quiz" className="btn-outline">
                Take the Skin Quiz
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              custom={6}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 mt-10"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-blush border-2 border-cream overflow-hidden">
                    <img src={`https://picsum.photos/seed/face${i}/40/40`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-gold text-gold" />)}
                </div>
                <p className="text-xs text-ink/50 mt-0.5">Loved by 12,000+ women</p>
              </div>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] max-w-lg mx-auto shadow-2xl shadow-deep-rose/10">
              <img
                src="https://picsum.photos/seed/lumhero/700/900"
                alt="Lumière skincare ritual"
                className="w-full h-full object-cover animate-float"
                style={{ animationDuration: '8s' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="absolute -left-6 top-1/4 bg-cream rounded-2xl shadow-xl px-5 py-3.5 border border-blush"
            >
              <p className="font-display text-3xl text-deep-rose font-medium">94%</p>
              <p className="text-[10px] tracking-widest uppercase text-ink/50">Natural Origin</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
              className="absolute -right-4 bottom-1/4 bg-deep-rose rounded-2xl shadow-xl px-5 py-3.5"
            >
              <p className="font-display text-3xl text-gold font-medium">100%</p>
              <p className="text-[10px] tracking-widest uppercase text-cream/70">Cruelty-Free</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-deep-rose py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-10">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="flex items-center gap-10 text-cream/80 text-xs tracking-[0.3em] uppercase font-body">
              <span>Free Shipping Over $75</span>
              <span className="text-gold">✦</span>
              <span>Vegan & Cruelty-Free</span>
              <span className="text-gold">✦</span>
              <span>Dermatologist Tested</span>
              <span className="text-gold">✦</span>
              <span>Clean Ingredients</span>
              <span className="text-gold">✦</span>
              <span>Science-Backed Formulas</span>
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-rose font-medium mb-3">Curated for You</p>
              <h2 className="section-title font-light"><em className="italic">The</em> Ritual</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-2 text-xs tracking-widest uppercase text-deep-rose hover:text-ink transition-colors group">
              View All Products
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => (
            <AnimatedSection key={p.id}>
              <motion.div variants={fadeUp} custom={i}>
                <ProductCard product={p} />
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ADVISOR CTA */}
      <section className="mx-4 sm:mx-8 lg:mx-16 my-8 rounded-3xl bg-deep-rose overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-rose" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gold" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-8 py-20">
          <AnimatedSection>
            <motion.div variants={fadeUp}>
              <Sparkles className="text-gold mx-auto mb-6" size={28} />
              <h2 className="font-display text-5xl md:text-6xl text-cream mb-6 font-light leading-tight">
                Your Skin, <em className="italic">Understood</em>
              </h2>
              <p className="text-cream/70 text-base leading-relaxed mb-10 max-w-lg mx-auto">
                Our AI Skin Advisor analyses your unique skin profile and curates a personalised ritual from our complete collection. Free, expert guidance — any time.
              </p>
              <Link to="/advisor" className="btn-gold">
                Begin Your Consultation
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {VALUES.map((v, i) => (
            <AnimatedSection key={v.title}>
              <motion.div variants={fadeUp} custom={i} className="text-center p-8">
                <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center mx-auto mb-5 text-deep-rose">
                  {v.icon}
                </div>
                <h3 className="font-display text-2xl text-ink mb-3">{v.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{v.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-blush/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-[10px] tracking-widest uppercase text-rose font-medium mb-3">Real Results</p>
              <h2 className="section-title font-light">From Our Community</h2>
            </motion.div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.name}>
                <motion.div
                  variants={fadeUp}
                  custom={i}
                  className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow border border-blush/50"
                >
                  <div className="flex gap-0.5 mb-5">
                    {Array(t.rating).fill(null).map((_, j) => (
                      <Star key={j} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="font-display italic text-xl text-ink leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                  <div className="flex items-center justify-between border-t border-blush pt-4">
                    <div>
                      <p className="font-medium text-sm text-ink">{t.name}</p>
                      <p className="text-xs text-ink/40">{t.location}</p>
                    </div>
                    <p className="text-[10px] tracking-wide text-rose/80">{t.product}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 px-6">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="max-w-lg mx-auto text-center">
            <p className="font-display italic text-rose text-lg mb-3">Stay in the glow</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink font-light mb-4">The Lumière Journal</h2>
            <p className="text-sm text-ink/50 leading-relaxed mb-8">
              Skincare rituals, ingredient education, exclusive offers and the science of luminous skin — delivered fortnightly.
            </p>
            {subscribed ? (
              <p className="font-display italic text-deep-rose text-xl">Welcome to the ritual ✨</p>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSubscribed(true) }}
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 border border-blush rounded-full px-5 py-3 text-sm outline-none focus:border-rose transition-colors bg-white text-ink placeholder-ink/30"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>
        </AnimatedSection>
      </section>
    </main>
  )
}
