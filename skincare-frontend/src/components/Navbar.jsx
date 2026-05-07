import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, User, Search, Menu, X, Sparkles } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/quiz', label: 'Skin Quiz' },
  { to: '/advisor', label: 'AI Advisor' },
  { to: '/about', label: 'Our Story' },
  { to: '/blog', label: 'Journal' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { items, openCart } = useCartStore()
  const user = useAuthStore(s => s.user)
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const isHome = location.pathname === '/'

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? 'bg-cream/95 backdrop-blur-md shadow-sm border-b border-blush'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-full bg-deep-rose flex items-center justify-center shadow-sm group-hover:shadow-deep-rose/30 transition-shadow">
                <span className="font-display text-gold text-sm font-medium">L</span>
              </div>
              <span className="font-display text-xl md:text-2xl tracking-[0.2em] text-ink font-medium">
                LUMIÈRE
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `font-body text-xs tracking-widest uppercase transition-colors duration-200 relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-deep-rose after:transition-all after:duration-300 ${
                      isActive
                        ? 'text-deep-rose after:w-full'
                        : 'text-ink/70 hover:text-deep-rose after:w-0 hover:after:w-full'
                    }`
                  }
                >
                  {label}
                  {to === '/advisor' && (
                    <Sparkles size={10} className="inline ml-1 text-gold" />
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-4 md:gap-5">
              <button
                aria-label="Search"
                className="text-ink/70 hover:text-deep-rose transition-colors hidden md:block"
              >
                <Search size={18} />
              </button>
              <Link
                to="/account"
                aria-label="Account"
                className="flex items-center gap-1.5 text-ink/70 hover:text-deep-rose transition-colors hidden md:flex"
              >
                <User size={18} />
                {user && (
                  <span className="text-[10px] tracking-wide font-medium text-deep-rose">{user.firstName}</span>
                )}
              </Link>
              <button
                onClick={openCart}
                aria-label={`Cart (${count} items)`}
                className="relative text-ink/70 hover:text-deep-rose transition-colors"
              >
                <ShoppingBag size={18} />
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-deep-rose text-cream text-[9px] font-medium rounded-full flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-ink/70 hover:text-deep-rose transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-cream border-b border-blush shadow-lg"
          >
            <nav className="flex flex-col py-6 px-8 gap-5">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `font-body text-sm tracking-widest uppercase ${isActive ? 'text-deep-rose' : 'text-ink/80'}`
                  }
                >
                  {label}
                  {to === '/advisor' && <Sparkles size={12} className="inline ml-1.5 text-gold" />}
                </NavLink>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t border-blush">
                <Link to="/account" className="text-xs tracking-widest uppercase text-ink/60">Account</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
