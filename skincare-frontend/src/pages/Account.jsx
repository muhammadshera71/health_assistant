import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Package, MapPin, Sparkles, LogIn, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { users as usersApi } from '../api'

export default function Account() {
  const { user, login, register, logout, loading } = useAuthStore()
  const { syncFromServer, pushLocalToServer, clearCart } = useCartStore()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('orders')

  // Orders state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Addresses state
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: 'Home', line1: '', line2: '', city: '', postcode: '', country: 'United Kingdom', is_default: false })
  const [addrError, setAddrError] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleAddr = (e) => setAddrForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  useEffect(() => {
    if (!user) return
    if (activeSection === 'orders') loadOrders()
    if (activeSection === 'addresses') loadAddresses()
  }, [user, activeSection])

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const data = await fetch('/api/orders', { credentials: 'include' }).then(r => r.json())
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const loadAddresses = async () => {
    setAddressesLoading(true)
    try {
      const data = await usersApi.getAddresses()
      setAddresses(Array.isArray(data) ? data : [])
    } catch {
      setAddresses([])
    } finally {
      setAddressesLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      await pushLocalToServer()
    } catch (err) {
      setFormError(err.message || 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await register(form.firstName, form.lastName, form.email, form.password)
    } catch (err) {
      setFormError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    clearCart()
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddrError('')
    try {
      await usersApi.addAddress(addrForm)
      setShowAddAddress(false)
      setAddrForm({ label: 'Home', line1: '', line2: '', city: '', postcode: '', country: 'United Kingdom', is_default: false })
      loadAddresses()
    } catch (err) {
      setAddrError(err.message || 'Failed to add address')
    }
  }

  const handleDeleteAddress = async (id) => {
    await usersApi.deleteAddress(id).catch(() => {})
    loadAddresses()
  }

  if (loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 rounded-full border-2 border-blush border-t-deep-rose animate-spin" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-6 bg-cream">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-full bg-deep-rose flex items-center justify-center mx-auto mb-5">
              <User size={20} className="text-cream" />
            </div>
            <h1 className="font-display text-4xl text-ink">My Account</h1>
          </div>

          <div className="flex bg-blush/40 rounded-full p-1 mb-8">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setFormError('') }}
                className={`flex-1 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                  tab === t ? 'bg-deep-rose text-cream shadow-sm' : 'text-ink/50 hover:text-ink'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={tab === 'login' ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {tab === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <AuthField label="First Name" name="firstName" value={form.firstName} onChange={handle} required />
                  <AuthField label="Last Name" name="lastName" value={form.lastName} onChange={handle} required />
                </div>
              )}
              <AuthField label="Email" name="email" type="email" value={form.email} onChange={handle} required />
              <AuthField label="Password" name="password" type="password" value={form.password} onChange={handle} required />
              {formError && (
                <p className="text-xs text-rose bg-rose/10 rounded-xl px-4 py-3">{formError}</p>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                {submitting && <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />}
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-20 min-h-screen bg-cream">
      <div className="bg-blush/30 border-b border-blush py-10 px-6 text-center">
        <h1 className="font-display text-4xl text-ink">Welcome back, {user.firstName}</h1>
        <p className="text-sm text-ink/40 mt-2">{user.email}</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 grid lg:grid-cols-[220px_1fr] gap-10">
        <nav className="space-y-1 lg:sticky lg:top-24 h-fit">
          {[
            { key: 'orders', icon: <Package size={15} />, label: 'My Orders' },
            { key: 'addresses', icon: <MapPin size={15} />, label: 'Addresses' },
            { key: 'skin', icon: <Sparkles size={15} />, label: 'Skin Profile' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-colors ${
                activeSection === item.key ? 'bg-deep-rose text-cream' : 'text-ink/60 hover:bg-blush/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left text-ink/40 hover:text-rose transition-colors mt-4"
          >
            <LogIn size={15} />
            Sign Out
          </button>
        </nav>

        <div>
          {activeSection === 'orders' && (
            <div>
              <h2 className="font-display text-3xl text-ink mb-7">Order History</h2>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-blush/30 animate-pulse" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-display italic text-2xl text-ink/30 mb-4">No orders yet</p>
                  <Link to="/shop" className="btn-primary">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-blush rounded-2xl p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-sm text-ink">Order #{order.id}</p>
                          <p className="text-xs text-ink/40 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] bg-green-100 text-green-700 tracking-widest uppercase px-3 py-1 rounded-full">{order.status}</span>
                          <span className="font-display text-xl text-ink">${order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-ink/40">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'addresses' && (
            <div>
              <h2 className="font-display text-3xl text-ink mb-7">Saved Addresses</h2>
              {addressesLoading ? (
                <div className="h-24 rounded-2xl bg-blush/30 animate-pulse mb-4" />
              ) : (
                <div className="space-y-4 mb-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-white border border-blush rounded-2xl p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-ink mb-1">{addr.label}</p>
                          <p className="text-sm text-ink/50 leading-relaxed">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                            {addr.city}, {addr.postcode}<br />
                            {addr.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {addr.is_default && (
                            <span className="text-[10px] tracking-widest uppercase bg-blush text-deep-rose px-3 py-1 rounded-full">Default</span>
                          )}
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-ink/30 hover:text-rose transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddAddress ? (
                <form onSubmit={handleAddAddress} className="bg-white border border-blush rounded-2xl p-6 space-y-4">
                  <h3 className="font-display text-xl text-ink mb-2">New Address</h3>
                  <AuthField label="Label (e.g. Home)" name="label" value={addrForm.label} onChange={handleAddr} />
                  <AuthField label="Street Address" name="line1" value={addrForm.line1} onChange={handleAddr} required />
                  <AuthField label="Apt / Floor (optional)" name="line2" value={addrForm.line2 || ''} onChange={handleAddr} />
                  <div className="grid grid-cols-2 gap-3">
                    <AuthField label="City" name="city" value={addrForm.city} onChange={handleAddr} required />
                    <AuthField label="Postcode" name="postcode" value={addrForm.postcode} onChange={handleAddr} required />
                  </div>
                  <AuthField label="Country" name="country" value={addrForm.country} onChange={handleAddr} />
                  {addrError && <p className="text-xs text-rose">{addrError}</p>}
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary">Save Address</button>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="btn-outline">Cancel</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowAddAddress(true)} className="btn-outline text-xs flex items-center gap-2">
                  <Plus size={13} /> Add New Address
                </button>
              )}
            </div>
          )}

          {activeSection === 'skin' && (
            <div>
              <h2 className="font-display text-3xl text-ink mb-4">Your Skin Profile</h2>
              <p className="text-sm text-ink/50 mb-7">Complete your profile to receive personalised recommendations from our AI Advisor.</p>
              <div className="flex gap-3">
                <Link to="/quiz" className="btn-outline">Take Skin Quiz</Link>
                <Link to="/advisor" className="btn-primary">Open AI Advisor</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function AuthField({ label, name, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-ink/40 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-blush rounded-xl px-4 py-3 text-sm bg-white text-ink outline-none focus:border-rose transition-colors"
      />
    </div>
  )
}
