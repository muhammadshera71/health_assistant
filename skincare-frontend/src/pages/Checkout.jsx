import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ChevronDown, Check } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { orders as ordersApi } from '../api'

export default function Checkout() {
  const { items, clearCart } = useCartStore()
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [step, setStep] = useState('shipping')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', address: '', city: '', postcode: '', country: 'United Kingdom',
    cardNumber: '', expiry: '', cvv: '', nameOnCard: '',
  })

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 75 ? 0 : 6.99
  const total = subtotal + shipping

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setPlacing(true)
    setError('')
    try {
      await ordersApi.place({
        address_override: {
          label: 'Shipping',
          line1: form.address,
          city: form.city,
          postcode: form.postcode,
          country: form.country,
        },
      })
      await clearCart()
      setStep('confirm')
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (step === 'confirm') {
    return (
      <main className="pt-20 min-h-screen bg-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-deep-rose/10 flex items-center justify-center mx-auto mb-7">
            <Check size={36} className="text-deep-rose" />
          </div>
          <h1 className="font-display text-5xl text-ink mb-4">Order Placed</h1>
          <p className="text-ink/55 leading-relaxed mb-8">
            Thank you, {form.firstName}. Your Lumière ritual is on its way. You'll receive a confirmation at <strong className="text-ink">{form.email}</strong>.
          </p>
          <p className="font-display italic text-rose text-lg mb-8">Expect radiance in 3–5 business days.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            <Link to="/account" className="btn-outline">Track Order</Link>
          </div>
        </motion.div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="pt-20 min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-3xl text-ink/40 mb-4">Your bag is empty</p>
          <Link to="/shop" className="btn-primary">Discover Products</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-20 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link to="/" className="font-display text-xl tracking-wider text-ink">LUMIÈRE</Link>
          <span className="text-ink/20">/</span>
          <span className="text-sm text-ink/40">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Form */}
          <div>
            {/* Steps */}
            <div className="flex items-center gap-3 mb-8 text-xs tracking-widest uppercase">
              <span className={step === 'shipping' ? 'text-deep-rose font-medium' : 'text-ink/30'}>1. Shipping</span>
              <span className="text-ink/20">——</span>
              <span className={step === 'payment' ? 'text-deep-rose font-medium' : 'text-ink/30'}>2. Payment</span>
            </div>

            {step === 'shipping' && (
              <motion.form
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={(e) => { e.preventDefault(); setStep('payment') }}
                className="space-y-5"
              >
                <h2 className="font-display text-2xl text-ink mb-6">Shipping Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
                  <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                <Field label="Street Address" name="address" value={form.address} onChange={handleChange} required />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City" name="city" value={form.city} onChange={handleChange} required />
                  <Field label="Postcode" name="postcode" value={form.postcode} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ink/40 mb-2">Country</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border border-blush rounded-xl px-4 py-3 text-sm bg-white text-ink outline-none focus:border-rose transition-colors appearance-none"
                  >
                    {['United Kingdom', 'United States', 'France', 'Germany', 'Australia'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Continue to Payment</button>
              </motion.form>
            )}

            {step === 'payment' && (
              <motion.form
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handlePlaceOrder}
                className="space-y-5"
              >
                <h2 className="font-display text-2xl text-ink mb-6">Payment Details</h2>
                <div className="bg-blush/30 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-ink/50">
                  <Lock size={13} className="text-rose/70" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
                <Field label="Name on Card" name="nameOnCard" value={form.nameOnCard} onChange={handleChange} required />
                <Field label="Card Number" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" required />
                  <Field label="CVV" name="cvv" value={form.cvv} onChange={handleChange} placeholder="123" required />
                </div>
                {error && (
                  <p className="text-sm text-rose bg-rose/10 rounded-xl px-4 py-3">{error}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep('shipping')} className="btn-outline flex-1">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={placing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {placing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order · $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-blush rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="font-display text-xl text-ink mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-14 h-16 rounded-lg overflow-hidden bg-blush/30 flex-shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-deep-rose text-cream text-[9px] rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-ink leading-tight">{item.name}</p>
                    <p className="text-[10px] text-ink/40">{item.size}</p>
                  </div>
                  <span className="font-display text-sm text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-blush pt-4 space-y-2">
              <div className="flex justify-between text-sm text-ink/55">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink/55">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-ink/30">Add ${(75 - subtotal).toFixed(2)} more for free shipping</p>
              )}
              <div className="flex justify-between font-display text-xl text-ink pt-2 border-t border-blush">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-ink/40 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-blush rounded-xl px-4 py-3 text-sm bg-white text-ink placeholder-ink/20 outline-none focus:border-rose transition-colors"
      />
    </div>
  )
}
