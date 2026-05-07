import { Link } from 'react-router-dom'
import { Instagram, Youtube, Mail } from 'lucide-react'
import { useState } from 'react'

const LINKS = {
  Shop: [
    { to: '/shop', label: 'All Products' },
    { to: '/shop?filter=serums', label: 'Serums' },
    { to: '/shop?filter=moisturisers', label: 'Moisturisers' },
    { to: '/shop?filter=treatments', label: 'Treatments' },
    { to: '/shop?filter=spf', label: 'SPF' },
  ],
  Discover: [
    { to: '/quiz', label: 'Skin Quiz' },
    { to: '/advisor', label: 'AI Advisor' },
    { to: '/blog', label: 'The Journal' },
    { to: '/about', label: 'Our Story' },
  ],
  Support: [
    { to: '/account', label: 'My Account' },
    { to: '/account#orders', label: 'Order Tracking' },
    { to: '#', label: 'Shipping & Returns' },
    { to: '#', label: 'Contact Us' },
  ],
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="bg-ink text-cream/80">
      {/* Top band */}
      <div className="border-b border-cream/10 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-display italic text-cream/50 text-sm">
            Free shipping on all orders over $75
          </p>
          <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase text-cream/40">
            <span>Vegan</span>
            <span className="w-1 h-1 rounded-full bg-cream/20" />
            <span>Cruelty-Free</span>
            <span className="w-1 h-1 rounded-full bg-cream/20" />
            <span>Clean Formulas</span>
            <span className="w-1 h-1 rounded-full bg-cream/20" />
            <span>Dermatologist Tested</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-deep-rose flex items-center justify-center">
                <span className="font-display text-gold font-medium">L</span>
              </div>
              <span className="font-display text-2xl tracking-[0.2em] text-cream">LUMIÈRE</span>
            </Link>
            <p className="text-sm leading-relaxed text-cream/50 max-w-xs mb-8">
              Science-backed luxury skincare for women who believe that beautiful skin is the result of both science and ritual.
            </p>

            {/* Newsletter */}
            {subscribed ? (
              <p className="font-display italic text-rose text-lg">Thank you, you're glowing already ✨</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-cream/8 border border-cream/15 rounded-full px-4 py-2.5 text-sm text-cream placeholder-cream/30 outline-none focus:border-rose/60 transition-colors"
                />
                <button type="submit" className="btn-gold text-xs px-5 py-2.5">
                  Join
                </button>
              </form>
            )}

            <div className="flex items-center gap-4 mt-6">
              <a href="#" aria-label="Instagram" className="text-cream/30 hover:text-rose transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="YouTube" className="text-cream/30 hover:text-rose transition-colors">
                <Youtube size={18} />
              </a>
              <a href="mailto:hello@lumiereskin.com" aria-label="Email" className="text-cream/30 hover:text-rose transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-body text-[10px] tracking-widest uppercase text-cream/40 mb-5">{heading}</h4>
              <ul className="space-y-3">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-cream/60 hover:text-cream transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-cream/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/30">
          <p>© {new Date().getFullYear()} Lumière Skincare. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="#" className="hover:text-cream/60 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-cream/60 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-cream/60 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
