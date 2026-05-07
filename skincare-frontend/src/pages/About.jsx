import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Leaf, FlaskConical, Heart, Award } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

function Section({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

const PRINCIPLES = [
  { icon: <Leaf size={22} />, title: 'Clean Ingredients', desc: 'We believe luxury and clean beauty are not in conflict. Every Lumière formula is free from parabens, sulphates, phthalates, synthetic fragrances and mineral oils.' },
  { icon: <FlaskConical size={22} />, title: 'Clinically Proven', desc: 'Every formula undergoes clinical efficacy trials and independent dermatological testing. We publish our data because we believe in full transparency.' },
  { icon: <Heart size={22} />, title: 'Ethical Beauty', desc: 'Certified vegan and cruelty-free by Leaping Bunny. Our ingredients are sustainably sourced, and we use 100% recyclable packaging.' },
  { icon: <Award size={22} />, title: 'Expert Crafted', desc: 'Developed in partnership with leading dermatologists, biochemists and estheticians who have spent careers studying the science of skin.' },
]

export default function About() {
  return (
    <main className="pt-20 min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-ink text-cream py-28 px-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-deep-rose -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display italic text-rose text-xl mb-5"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl md:text-7xl text-cream font-light leading-none mb-8"
          >
            Skin That Glows From <em className="italic text-gold">Within</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-cream/60 text-base leading-relaxed max-w-xl mx-auto"
          >
            Lumière was founded on the conviction that true luxury in skincare means formulas that are both exquisite to use and genuinely efficacious — backed by science, crafted with integrity.
          </motion.p>
        </div>
      </div>

      {/* Founder letter */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Section>
            <motion.div variants={fadeUp} className="rounded-3xl overflow-hidden aspect-[3/4] bg-blush/50">
              <img src="https://picsum.photos/seed/founder/600/800" alt="Lumière founder" className="w-full h-full object-cover" />
            </motion.div>
          </Section>
          <Section>
            <motion.div variants={fadeUp} className="space-y-6">
              <p className="text-[10px] tracking-widest uppercase text-rose">A Letter from Our Founder</p>
              <h2 className="font-display text-4xl text-ink font-light leading-tight">
                Science and ritual are not opposites.
              </h2>
              <div className="space-y-4 text-ink/60 text-sm leading-loose">
                <p>
                  When I trained as a biochemist and esthetician, I was always frustrated by the false choice: you could have the luxury experience or the effective ingredient — rarely both. Lumière was born from refusing that compromise.
                </p>
                <p>
                  We spent three years developing each formula, rejecting anything that couldn't pass our clinical efficacy bar or that contained an ingredient we couldn't justify. The result is a collection I use every morning and every evening — and that I'm immeasurably proud of.
                </p>
                <p>
                  Our AI Skin Advisor was the natural extension of this mission: personalised guidance that gives every woman the consultation I wish I'd had at the start of my skincare journey.
                </p>
              </div>
              <div className="border-t border-blush pt-5">
                <p className="font-display italic text-2xl text-ink">Dr. Isabelle Laurent</p>
                <p className="text-xs text-ink/40 tracking-widest uppercase mt-1">Founder & Chief Formulator</p>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 bg-blush/30 px-6">
        <div className="max-w-6xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="section-title font-light">What We Stand For</h2>
            </motion.div>
          </Section>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRINCIPLES.map((p, i) => (
              <Section key={p.title}>
                <motion.div variants={fadeUp} custom={i} className="bg-white rounded-2xl p-7 h-full">
                  <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center text-deep-rose mb-5">
                    {p.icon}
                  </div>
                  <h3 className="font-display text-xl text-ink mb-3">{p.title}</h3>
                  <p className="text-sm text-ink/55 leading-relaxed">{p.desc}</p>
                </motion.div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '2019', label: 'Founded' },
            { value: '12,000+', label: 'Happy Customers' },
            { value: '94%', label: 'Natural Origin' },
            { value: '0', label: 'Compromises' },
          ].map((s, i) => (
            <Section key={s.label}>
              <motion.div variants={fadeUp} custom={i}>
                <p className="font-display text-5xl md:text-6xl text-deep-rose font-light">{s.value}</p>
                <p className="text-xs tracking-widest uppercase text-ink/40 mt-2">{s.label}</p>
              </motion.div>
            </Section>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream px-6 text-center border-t border-blush">
        <Section>
          <motion.div variants={fadeUp} className="max-w-lg mx-auto">
            <h2 className="font-display text-4xl text-ink font-light mb-5">Begin Your Ritual</h2>
            <p className="text-sm text-ink/50 mb-8">Let our AI Skin Advisor build your personalised Lumière ritual.</p>
            <Link to="/advisor" className="btn-primary">Meet Your Advisor</Link>
          </motion.div>
        </Section>
      </section>
    </main>
  )
}
