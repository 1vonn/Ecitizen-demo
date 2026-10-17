import { useEffect, useMemo, useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiClipboard, FiHome, FiLogOut, FiMapPin, FiPlus, FiSearch, FiShield, FiUser, FiX } from 'react-icons/fi'
import { supabase } from './lib/supabase'
import './App.css'

const categories = ['Streetlight', 'Water & sanitation', 'Garbage collection', 'Roads & transport', 'Other']
const statuses = ['Pending', 'In Progress', 'Resolved']

function App() {
  const [session, setSession] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '' })
  const [authMessage, setAuthMessage] = useState('')
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [requestForm, setRequestForm] = useState({ category: categories[0], location: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session) loadRequests() }, [session])

  async function loadRequests() {
    if (!supabase || !session) return
    const { data } = await supabase.from('service_requests').select('id, category, location, description, status, created_at, updated_at').order('created_at', { ascending: false })
    setRequests(data || [])
  }

  async function handleAuth(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setAuthMessage('')

    if (!supabase) {
      setAuthMessage('Supabase is not configured in this preview.')
      setLoading(false)
      return
    }

    try {
      const result = authMode === 'signin'
        ? await supabase.auth.signInWithPassword({
            email: authForm.email.trim(),
            password: authForm.password,
          })
        : await supabase.auth.signUp({
            email: authForm.email.trim(),
            password: authForm.password,
            options: {
              data: { full_name: authForm.fullName.trim() },
              emailRedirectTo: import.meta.env.VITE_DEV_SUPABASE_REDIRECT_URL
                || import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
                || `${window.location.origin}/auth/callback`,
            },
          })

      if (result.error) {
        const errorMessage = result.error.message.toLowerCase()
        if (authMode === 'signin') {
          setAuthMessage(errorMessage.includes('email not confirmed')
            ? 'Please confirm your email before signing in.'
            : 'Invalid email or password.')
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          setAuthMessage('Too many signup emails were requested. Wait a few minutes, then try again, or sign in if you already created this account.')
        } else if (errorMessage.includes('already') || errorMessage.includes('registered')) {
          setAuthMessage('An account with this email already exists. Try signing in instead.')
          setAuthMode('signin')
        } else if (errorMessage.includes('password')) {
          setAuthMessage('Use a stronger password with at least 6 characters.')
        } else {
          setAuthMessage('We could not create your account. Please try again.')
        }
      } else if (authMode === 'signup') {
        setAuthMessage(result.data.session
          ? 'Account created. You are now signed in.'
          : 'Account created. Check your email to confirm your account, then sign in.')
      }
    } catch {
      setAuthMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submitRequest(event) {
    event.preventDefault(); if (!supabase || !session) return
    setLoading(true)
    const { error } = await supabase.from('service_requests').insert({ ...requestForm, citizen_id: session.user.id })
    if (!error) { setRequestForm({ category: categories[0], location: '', description: '' }); setShowForm(false); await loadRequests() }
    setLoading(false)
  }

  const openCount = requests.filter((item) => item.status !== 'Resolved').length
  const resolvedCount = requests.filter((item) => item.status === 'Resolved').length
  const userName = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Citizen'

  if (!session) return <AuthScreen mode={authMode} setMode={setAuthMode} form={authForm} setForm={setAuthForm} onSubmit={handleAuth} message={authMessage} loading={loading} />

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><FiShield /></span><span>eCitizen <small>PUBLIC SERVICES</small></span></div>
      <nav>{['Overview', 'My requests'].map((item) => <button key={item} className={activeNav === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(item)}><FiHome />{item}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><strong>Need help?</strong><span>We’re here to guide you through your request.</span><button>Contact support <FiArrowRight /></button></div><button className="signout" onClick={() => supabase?.auth.signOut()}><FiLogOut /> Sign out</button></div>
    </aside>
    <main className="content">
      <header className="topbar"><div><span className="eyebrow">CITIZEN PORTAL</span><h1>{activeNav === 'Overview' ? `Good morning, ${userName}` : 'My requests'}</h1><p>Manage your public service requests in one place.</p></div><div className="profile-chip"><span className="avatar"><FiUser /></span><span><strong>{session.user.email}</strong><small>Citizen account</small></span></div></header>
      {activeNav === 'Overview' && <>
        <section className="hero-card"><div><span className="eyebrow light">PUBLIC SERVICE REQUESTS</span><h2>Make your community<br />better, one request at a time.</h2><p>Report an issue, follow its progress, and help us build a better city together.</p><button className="primary-button" onClick={() => setShowForm(true)}><FiPlus /> Submit a request</button></div><div className="hero-art"><FiMapPin /><div className="sun" /></div></section>
        <section className="stats-grid"><Stat icon={<FiClipboard />} label="Total requests" value={requests.length} /><Stat icon={<FiSearch />} label="Open requests" value={openCount} /><Stat icon={<FiCheckCircle />} label="Resolved" value={resolvedCount} /></section>
        <section className="section-heading"><div><span className="eyebrow">ACTIVITY</span><h2>Recent requests</h2></div><button className="text-button" onClick={() => setActiveNav('My requests')}>View all <FiArrowRight /></button></section>
        <RequestList requests={requests.slice(0, 3)} />
      </>}
      {activeNav === 'My requests' && <><div className="section-heading requests-heading"><div><span className="eyebrow">REQUEST HISTORY</span><h2>All requests</h2></div><button className="primary-button compact" onClick={() => setShowForm(true)}><FiPlus /> New request</button></div><RequestList requests={requests} /></>}
    </main>
    {showForm && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}><form className="request-modal" onSubmit={submitRequest}><button type="button" className="close" onClick={() => setShowForm(false)}><FiX /></button><span className="eyebrow">NEW REQUEST</span><h2>Tell us what needs attention</h2><p className="muted">Give us enough detail to route your request to the right team.</p><label>Category<select value={requestForm.category} onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Location<input required placeholder="Street, neighborhood or landmark" value={requestForm.location} onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })} /></label><label>Description<textarea required rows="4" placeholder="Describe the issue..." value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} /></label><button className="primary-button full" disabled={loading}>{loading ? 'Submitting...' : 'Submit request'} <FiArrowRight /></button></form></div>}
  </div>
}

function AuthScreen({ mode, setMode, form, setForm, onSubmit, message, loading }) { return <main className="auth-layout"><section className="auth-visual"><div className="brand brand-light"><span className="brand-mark"><FiShield /></span><span>eCitizen <small>PUBLIC SERVICES</small></span></div><div className="auth-copy"><span className="eyebrow light">YOUR CITY. YOUR VOICE.</span><h1>Better services<br /><i>start with you.</i></h1><p>Report issues, track progress, and help shape a city that works for everyone.</p><div className="trust-row"><FiCheckCircle /> Trusted by citizens across the city</div></div><div className="visual-orb"><FiMapPin /></div></section><section className="auth-panel"><div className="auth-form"><span className="eyebrow">CITIZEN PORTAL</span><h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p className="muted">{mode === 'signin' ? 'Sign in to keep track of your requests.' : 'Join your community and make a difference.'}</p><div className="mode-switch"><button className={mode === 'signin' ? 'selected' : ''} onClick={() => setMode('signin')}>Sign in</button><button className={mode === 'signup' ? 'selected' : ''} onClick={() => setMode('signup')}>Sign up</button></div><form onSubmit={onSubmit}>{mode === 'signup' && <label>Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label>{message && <div className="auth-message">{message}</div>}<button className="primary-button full" disabled={loading}>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'} <FiArrowRight /></button></form><p className="form-note">By continuing, you agree to our Terms of Service and Privacy Policy.</p></div></section></main> }
function Stat({ icon, label, value }) { return <div className="stat-card"><span className="stat-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></div> }
function RequestList({ requests }) { return <div className="request-list">{requests.length ? requests.map((request) => <article className="request-card" key={request.id}><div className="request-icon"><FiMapPin /></div><div className="request-main"><div className="request-top"><h3>{request.category}</h3><Status status={request.status} /></div><p>{request.description}</p><span className="request-meta"><FiMapPin /> {request.location} <b>•</b> {new Date(request.created_at).toLocaleDateString()}</span></div></article>) : <div className="empty-state"><FiClipboard /><h3>No requests yet</h3><p>Your submitted requests will appear here.</p></div>}</div> }
function Status({ status }) { return <span className={`status ${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span> }
export default App
