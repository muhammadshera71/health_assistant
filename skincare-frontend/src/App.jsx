import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import FloatingChat from './components/FloatingChat'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const SkinQuiz = lazy(() => import('./pages/SkinQuiz'))
const Advisor = lazy(() => import('./pages/Advisor'))
const About = lazy(() => import('./pages/About'))
const Blog = lazy(() => import('./pages/Blog'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-blush border-t-deep-rose animate-spin" />
      <p className="font-display italic text-rose text-xl">Lumière</p>
    </div>
  </div>
)

function ShopLayout() {
  return (
    <div className="min-h-screen bg-cream text-ink font-body">
      <Navbar />
      <CartDrawer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/quiz" element={<SkinQuiz />} />
          <Route path="/advisor" element={<Advisor />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Suspense>
      <Footer />
      <FloatingChat />
    </div>
  )
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe)
  const syncFromServer = useCartStore(s => s.syncFromServer)
  const { pathname } = useLocation()

  useEffect(() => {
    fetchMe().then(user => {
      if (user) syncFromServer()
    })
  }, [])

  if (pathname === '/toca-health') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    )
  }

  return (
    <>
      <ScrollToTop />
      <ShopLayout />
    </>
  )
}
