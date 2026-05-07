import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Menu, X, ArrowRight, Video, Activity, ClipboardList,
  Brain, Apple, FlaskConical, ChevronRight, Check
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#process' },
  { label: 'Our Work', href: '#work' },
  { label: 'About', href: '#about' },
]

const SERVICES = [
  {
    icon: Video,
    title: 'Telemedicine',
    description: 'Connect with licensed physicians from the comfort of your home via secure video consultations.',
  },
  {
    icon: Activity,
    title: 'Health Monitoring',
    description: 'Real-time tracking of vitals and health metrics with smart alerts for early intervention.',
  },
  {
    icon: ClipboardList,
    title: 'Care Plans',
    description: 'Personalized treatment plans crafted by specialists tailored to your unique health profile.',
  },
  {
    icon: Brain,
    title: 'Mental Health',
    description: 'Access to therapists and mental wellness programs to support your emotional well-being.',
  },
  {
    icon: Apple,
    title: 'Nutrition Guidance',
    description: 'Evidence-based dietary recommendations from registered dietitians for lasting health.',
  },
  {
    icon: FlaskConical,
    title: 'Lab Results',
    description: 'Instant access to your lab reports with plain-language explanations from our care team.',
  },
]

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Consultation',
    description: 'Schedule a session with one of our specialists. We listen carefully to understand your health goals and history.',
  },
  {
    number: '02',
    title: 'Diagnosis',
    description: 'Our team conducts a thorough assessment using the latest diagnostic tools and clinical guidelines.',
  },
  {
    number: '03',
    title: 'Treatment Plan',
    description: 'Receive a personalised, evidence-based treatment plan with clear steps and measurable milestones.',
  },
  {
    number: '04',
    title: 'Ongoing Support',
    description: 'We stay with you through recovery and beyond, adjusting care plans as your health evolves.',
  },
]

const WORKS = [
  {
    tag: 'Cardiac Care',
    title: 'Remote Heart Monitoring Program',
    description: 'A 12-week program reducing hospital readmissions by 40% for post-cardiac patients.',
    stat: '40% fewer readmissions',
  },
  {
    tag: 'Diabetes Management',
    title: 'Personalised Glucose Control',
    description: 'AI-assisted nutrition and medication adherence program for type-2 diabetes patients.',
    stat: '28% HbA1c reduction',
  },
  {
    tag: 'Mental Wellness',
    title: 'Workplace Mental Health Initiative',
    description: 'Corporate wellness program serving 500+ employees with measurable burnout reduction.',
    stat: '500+ employees supported',
  },
]

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="bg-[#080C14] text-white min-h-screen font-sans antialiased">

      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#080C14]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#00A693] flex items-center justify-center shadow-[0_0_16px_#00A69355] group-hover:shadow-[0_0_24px_#00A69380] transition-shadow">
              <span className="text-white font-bold text-sm">TH</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Toca Health</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200 tracking-wide"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#contact"
              className="hidden md:inline-flex items-center gap-2 bg-[#00A693] hover:bg-[#008576] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200"
            >
              Book a Consultation
              <ArrowRight size={14} />
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white/70 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-[#0D1220] border-t border-white/10 px-6 py-6 flex flex-col gap-5"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white text-sm tracking-wide transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-[#00A693] text-white text-sm font-medium px-5 py-2.5 rounded-full w-fit mt-2"
            >
              Book a Consultation <ArrowRight size={14} />
            </a>
          </motion.div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#00A693]/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00A693]/6 blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#00A693]/10 border border-[#00A693]/30 text-[#00A693] text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A693] animate-pulse" />
            Healthcare reimagined for you
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            Taking on complex{' '}
            <span className="text-[#00A693]">health challenges</span>{' '}
            and turning them into better outcomes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Toca Health brings together world-class physicians, cutting-edge technology,
            and compassionate care — all in one seamless platform designed around you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-[#00A693] hover:bg-[#008576] text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 shadow-[0_0_24px_#00A69340]"
            >
              Request a Consultation <ArrowRight size={16} />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Explore our services <ChevronRight size={16} />
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-16 text-white/35 text-xs tracking-wide"
          >
            {['HIPAA Compliant', 'Board-Certified Physicians', '24/7 Support', '50,000+ Patients Served'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={12} className="text-[#00A693]" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <FadeIn className="mb-4">
          <p className="text-[#00A693] text-sm font-semibold tracking-widest uppercase">Our Services</p>
        </FadeIn>
        <FadeIn delay={0.05} className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">
            We are a team of passionate clinicians working closely with patients so they can thrive.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(({ icon: Icon, title, description }, i) => (
            <FadeIn key={title} delay={i * 0.07}>
              <div className="group bg-[#0D1220] hover:bg-[#111827] border border-white/8 hover:border-[#00A693]/40 rounded-2xl p-7 transition-all duration-300 cursor-pointer">
                <div className="w-11 h-11 bg-[#00A693]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#00A693]/20 transition-colors">
                  <Icon size={20} className="text-[#00A693]" />
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Featured Work ── */}
      <section id="work" className="py-24 px-6 bg-[#0A0F1A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <FadeIn>
              <p className="text-[#00A693] text-sm font-semibold tracking-widest uppercase mb-3">Patient Outcomes</p>
              <h2 className="text-3xl md:text-4xl font-bold">Selected success stories</h2>
              <p className="text-white/45 text-sm mt-2">Real results from real patients.</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <a href="#" className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                View All <ChevronRight size={14} />
              </a>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKS.map(({ tag, title, description, stat }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <div className="group relative bg-[#0D1220] border border-white/8 hover:border-[#00A693]/40 rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-[#00A693]/20 to-[#080C14] relative flex items-end p-6">
                    <span className="text-[#00A693] text-xs font-semibold tracking-widest uppercase bg-[#00A693]/10 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-semibold text-base mb-2">{title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4 flex-1">{description}</p>
                    <div className="text-[#00A693] font-bold text-sm border-t border-white/8 pt-4">
                      {stat}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="py-24 px-6 max-w-7xl mx-auto">
        <FadeIn className="mb-4">
          <p className="text-[#00A693] text-sm font-semibold tracking-widest uppercase">Our Process</p>
        </FadeIn>
        <FadeIn delay={0.05} className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold max-w-xl leading-tight">
            What does your care journey look like?
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROCESS_STEPS.map(({ number, title, description }, i) => (
            <FadeIn key={number} delay={i * 0.08}>
              <div className="relative">
                <div className="text-5xl font-bold text-white/8 mb-4 leading-none">{number}</div>
                <div className="w-2 h-2 rounded-full bg-[#00A693] mb-4" />
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center bg-[#0D1220] border border-[#00A693]/25 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00A693]/10 blur-[80px]" />
            </div>
            <div className="relative">
              <p className="text-[#00A693] text-sm font-semibold tracking-widest uppercase mb-4">Get Started</p>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
                Your health journey starts with one conversation
              </h2>
              <p className="text-white/50 text-base mb-8 max-w-xl mx-auto leading-relaxed">
                Book a free 20-minute consultation with one of our care coordinators. No commitment required.
              </p>
              <a
                href="mailto:care@tocahealth.com"
                className="inline-flex items-center gap-2 bg-[#00A693] hover:bg-[#008576] text-white font-semibold px-8 py-4 rounded-full transition-colors duration-200 shadow-[0_0_30px_#00A69340] text-base"
              >
                Book a Free Consultation <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00A693] flex items-center justify-center">
              <span className="text-white font-bold text-xs">TH</span>
            </div>
            <span className="font-bold text-sm tracking-tight">Toca Health</span>
          </div>
          <p className="text-white/30 text-xs text-center">
            © {new Date().getFullYear()} Toca Health. All rights reserved. HIPAA compliant platform.
          </p>
          <div className="flex gap-5 text-white/35 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
