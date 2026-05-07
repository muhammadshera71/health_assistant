import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, RotateCcw, ShoppingBag, Star } from 'lucide-react'
import { fetchProductsByIds } from '../api'
import { useCartStore } from '../store/cartStore'

const STEPS = [
  {
    id: 'skinType',
    question: 'What is your skin type?',
    subtitle: 'Be honest — this is your skin\'s foundation.',
    options: [
      { value: 'oily', label: 'Oily', desc: 'Shiny, large pores, prone to breakouts' },
      { value: 'dry', label: 'Dry', desc: 'Tight, sometimes flaky, dull finish' },
      { value: 'combination', label: 'Combination', desc: 'Oily T-zone, normal or dry cheeks' },
      { value: 'normal', label: 'Normal', desc: 'Balanced, rarely problematic' },
      { value: 'sensitive', label: 'Sensitive', desc: 'Easily irritated, prone to redness' },
    ],
  },
  {
    id: 'concern',
    question: 'What is your primary skin concern?',
    subtitle: 'Choose the one that matters most right now.',
    options: [
      { value: 'acne', label: 'Acne & Breakouts', desc: 'Frequent spots, clogged pores' },
      { value: 'anti-aging', label: 'Fine Lines & Firmness', desc: 'Signs of ageing, loss of elasticity' },
      { value: 'brightening', label: 'Dullness & Uneven Tone', desc: 'Lacklustre, pigmentation, dark spots' },
      { value: 'dryness', label: 'Dryness & Dehydration', desc: 'Tight, flaky, never feeling quenched' },
      { value: 'redness', label: 'Redness & Sensitivity', desc: 'Reactive, easily irritated' },
      { value: 'pores', label: 'Large Pores & Texture', desc: 'Visibly enlarged pores, rough texture' },
    ],
  },
  {
    id: 'routine',
    question: 'When do you prefer your skincare ritual?',
    subtitle: 'Timing helps us recommend the right formulas.',
    options: [
      { value: 'morning', label: 'Morning Only', desc: 'Quick and protective' },
      { value: 'evening', label: 'Evening Only', desc: 'Restorative and intensive' },
      { value: 'both', label: 'AM & PM', desc: 'Full ritual devotee' },
      { value: 'building', label: 'Just Starting', desc: 'Building my first routine' },
    ],
  },
  {
    id: 'age',
    question: 'What is your age range?',
    subtitle: 'Skin changes with age — we formulate accordingly.',
    options: [
      { value: 'under25', label: 'Under 25', desc: 'Prevention and balance' },
      { value: '25-35', label: '25–35', desc: 'Maintaining and protecting' },
      { value: '35-45', label: '35–45', desc: 'Addressing early signs' },
      { value: '45plus', label: '45+', desc: 'Intensive restoration' },
    ],
  },
]

function matchProducts(answers) {
  const { skinType, concern } = answers
  const ids = {
    'oily+acne': [3, 11, 1, 10],
    'oily+pores': [3, 11, 9],
    'dry+dryness': [2, 8, 7],
    'dry+anti-aging': [2, 4, 1],
    'sensitive+redness': [5, 8, 2],
    'sensitive+dryness': [5, 8, 7],
    'combination+brightening': [1, 3, 9],
    'combination+pores': [3, 9, 1],
    'normal+anti-aging': [4, 1, 6],
    'normal+brightening': [1, 9, 6, 10],
  }
  const key = `${skinType}+${concern}`
  const fallback = {
    oily: [3, 11, 10],
    dry: [2, 7, 8],
    sensitive: [5, 8, 2],
    combination: [3, 1, 9],
    normal: [1, 4, 10],
  }
  return ids[key] || fallback[skinType] || [1, 2, 5, 10]
}

export default function SkinQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [resultProducts, setResultProducts] = useState([])
  const { addItem } = useCartStore()

  const currentStep = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  useEffect(() => {
    if (results?.length) {
      fetchProductsByIds(results).then(setResultProducts).catch(() => setResultProducts([]))
    }
  }, [results])

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentStep.id]: value }
    setAnswers(newAnswers)
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setResults(matchProducts(newAnswers))
    }
  }

  const restart = () => {
    setStep(0)
    setAnswers({})
    setResults(null)
    setResultProducts([])
  }

  return (
    <main className="pt-20 min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-blush/30 border-b border-blush py-12 text-center px-6">
        <p className="text-[10px] tracking-widest uppercase text-rose mb-3">Personalised Skincare</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink font-light">Your Skin Quiz</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-14">
        {!results ? (
          <>
            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tracking-widest uppercase text-ink/40">
                  Step {step + 1} of {STEPS.length}
                </span>
                <span className="text-xs tracking-widest uppercase text-rose">{Math.round(progress)}%</span>
              </div>
              <div className="h-1 bg-blush rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-deep-rose rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-3xl md:text-4xl text-ink mb-2 leading-tight">
                  {currentStep.question}
                </h2>
                <p className="text-sm text-ink/50 mb-8">{currentStep.subtitle}</p>

                <div className="space-y-3">
                  {currentStep.options.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between bg-white border border-blush hover:border-deep-rose hover:bg-blush/20 rounded-2xl p-5 text-left group transition-all duration-200"
                    >
                      <div>
                        <p className="font-medium text-ink text-base">{opt.label}</p>
                        <p className="text-xs text-ink/40 mt-0.5">{opt.desc}</p>
                      </div>
                      <ArrowRight size={16} className="text-ink/20 group-hover:text-deep-rose transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>

                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="mt-6 text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full bg-deep-rose/10 flex items-center justify-center mx-auto mb-6">
                <span className="font-display italic text-deep-rose text-2xl">✦</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-ink mb-3 font-light">
                Your Personal Ritual
              </h2>
              <p className="text-sm text-ink/50 max-w-sm mx-auto">
                Based on your answers, we've curated these formulas specifically for your {answers.skinType} skin.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {resultProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="bg-white border border-blush rounded-2xl p-5 flex gap-4 hover:border-rose/40 transition-colors"
                >
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-blush/30 flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] tracking-widest uppercase text-rose">{product.type}</p>
                    <h3 className="font-display text-xl text-ink leading-tight mt-0.5">{product.name}</h3>
                    <p className="text-xs text-ink/50 mt-1 line-clamp-2">{product.shortDesc}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'text-ink/20 fill-ink/10'} />)}
                      <span className="text-[10px] text-ink/30 ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-display text-xl text-ink">${product.price}</span>
                      <button
                        onClick={() => addItem(product)}
                        className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase bg-deep-rose text-cream px-4 py-2 rounded-full hover:bg-ink transition-colors"
                      >
                        <ShoppingBag size={11} />
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/shop" className="btn-primary flex-1 text-center">
                Shop All Products
              </Link>
              <Link to="/advisor" className="btn-outline flex-1 text-center">
                Get AI Consultation
              </Link>
            </div>

            <button onClick={restart} className="w-full mt-4 flex items-center justify-center gap-2 text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors py-2">
              <RotateCcw size={12} /> Retake Quiz
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
