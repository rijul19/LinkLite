import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/original.css'
import './styles/generator.css'
import './styles/history.css'

const HISTORY_KEY = 'linklite_history'
const readHistory = () => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] }
}
const saveHistory = (items) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('linklite-history-change'))
}
const validateURL = (value) => {
  const raw = value.trim()
  if (!raw) return 'Please enter a URL.'
  let parsed
  try { parsed = new URL(raw) } catch { return 'Please enter a valid URL, including https:// or http://.' }
  if (!['http:', 'https:'].includes(parsed.protocol)) return 'Only HTTP and HTTPS URLs are allowed.'
  if (!parsed.hostname.includes('.') || parsed.hostname.startsWith('.') || parsed.hostname.endsWith('.') || parsed.hostname.includes('..')) return 'Please enter a valid domain, such as example.com.'
  return parsed.href
}
const makeLink = (originalURL) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const shortCode = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return { id: Date.now(), originalURL, shortCode, shortURL: `${window.location.origin}/#demo-${shortCode}`, clicks: 0, createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
}

function Navbar() {
  const path = window.location.pathname
  return <header className="site-header">
    <a href="/" className="site-logo" aria-label="LinkLite home"><img src="/icon.png" alt=""/><span>LINKLITE<span className="logo-period" /></span></a>
    <nav className="site-nav" aria-label="Main navigation"><a className={path === '/' ? 'active' : ''} href="/">Home</a><a className={path === '/history' ? 'active' : ''} href="/history">History</a></nav>
    <a className="header-cta" href="/generator">Get started <span>↗</span></a>
  </header>
}
function HeroArt() {
  return <div className="hero-art" aria-label="Illustration of a short link"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-label label-top">LESS LINK. MORE ROOM.</div><div className="link-paper paper-back"><span className="paper-dot"/><span className="paper-line line-long"/><span className="paper-line line-mid"/></div><div className="link-paper paper-front"><div className="paper-heading"><span className="mini-link-icon">↗</span><span>YOUR NEW LINK</span><span className="paper-status">READY</span></div><div className="short-demo">linklite<span>.local</span>/<b>abc123</b></div><div className="paper-bottom"><span><i/> Demo link created</span><span className="copy-glyph">▢</span></div></div><div className="art-stamp"><span>GOOD LINKS</span><strong>GOOD<br/>THINGS</strong><span>START SMALL</span></div><div className="art-label label-bottom">MADE TO KEEP THINGS SIMPLE <span>✳</span></div></div>
}
function Footer() { return <footer className="site-footer section-wrap"><a href="/" className="footer-brand">LINKLITE<span>.</span></a><p>Make your links lighter.</p><span>FRONT-END DEMO · 2026</span></footer> }
function Home({ history }) {
  const clicks = history.reduce((sum, link) => sum + (Number(link.clicks) || 0), 0)
  return <><main>
    <section className="hero section-wrap"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot"/> A SMALL TOOL FOR BIG LINKS</p><h1>Make your links<br/><em>lighter.</em></h1><p className="hero-description">Long URLs, meet a simpler life. Create neat demo short links and keep your saved links together in one calm, clutter-free space.</p><div className="hero-actions"><a className="hero-try-button" href="/generator">Try Generator <span>↗</span></a></div><p className="hero-note"><span>✳</span> Free to try · Saved in this browser · No account needed</p></div><HeroArt/></section>
    <section className="feature-strip section-wrap" aria-label="LinkLite features"><article className="feature-item"><span className="feature-symbol">01</span><div><h3>Simple by design</h3><p>Paste a URL and create a demo short link.</p></div></article><article className="feature-item"><span className="feature-symbol">02</span><div><h3>Your links, together</h3><p>Keep your saved links in one convenient place.</p></div></article><article className="feature-item"><span className="feature-symbol">03</span><div><h3>Saved locally</h3><p>Your browser remembers your demo history.</p></div></article></section>
    <section className="stats-section section-wrap"><div className="section-heading"><div><p className="eyebrow">YOUR LITTLE LINK LIBRARY</p><h2>Everything, <em>at a glance.</em></h2></div><a href="/history" className="text-link">Explore history <span>↗</span></a></div><div className="stats-grid"><article className="stat-card"><span className="stat-label">LINKS CREATED</span><strong>{history.length}</strong><span className="stat-foot">Demo links saved here</span><span className="stat-decoration">↗</span></article><article className="stat-card stat-card-olive"><span className="stat-label">LINKS SAVED</span><strong>{history.length}</strong><span className="stat-foot">In your browser history</span><span className="stat-decoration">▤</span></article><article className="stat-card stat-card-russet"><span className="stat-label">DEMO CLICKS</span><strong>{clicks}</strong><span className="stat-foot">Clicks from history list</span><span className="stat-decoration">⌁</span></article></div></section>
    <section className="recent-section section-wrap"><div className="section-heading"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Your recent <em>links.</em></h2></div><a href="/history" className="text-link">View all links <span>↗</span></a></div><div className="recent-links">{history.length === 0 ? <p className="empty-recent">Your next useful link belongs here.</p> : history.slice(0,3).map(link => <article className="recent-link-card" key={link.id}><div className="recent-link-details"><strong>{link.shortURL}</strong><p>{link.originalURL}</p><span>{link.createdAt}</span></div><a className="recent-open" href="/history">View</a></article>)}</div></section>
    <section id="about" className="about-section section-wrap"><div className="about-mark">L<span>.</span></div><div><p className="eyebrow">A NOTE ABOUT THIS PROJECT</p><h2>Small, useful, <em>and intentionally simple.</em></h2><p>LinkLite is a front-end demonstration project. It validates URLs and stores demo link records in your browser. Real public short links and server-side redirects require a backend service; demo links work only in this browser while their saved records remain available.</p></div><a className="about-cta" href="/generator">Try the generator <span>↗</span></a></section>
  </main><Footer/></>
}
function Generator({ onCreate }) {
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState(null)
  const [result, setResult] = useState(null)
  const submit = (event) => { event.preventDefault(); const checked = validateURL(url); if (checked !== true && typeof checked === 'string' && checked.startsWith('http')) { const item = makeLink(checked); onCreate(item); setResult(item); setMessage({ text: 'Demo short link generated successfully!', type: 'success' }); setUrl(checked); return } if (typeof checked === 'string') { setMessage({ text: checked, type: 'error' }); return } }
  return <main className="generator-container"><section className="generator-card"><p className="eyebrow">A SMALL TOOL FOR BIG LINKS</p><h1>Make your links <em>lighter.</em></h1><p className="description">Paste a long URL below. LinkLite will validate it and create a demo short link saved in this browser.</p><form onSubmit={submit}><label htmlFor="originalUrl">Your long URL</label><input id="originalUrl" type="text" value={url} onChange={e => { setUrl(e.target.value); setResult(null); setMessage(null) }} placeholder="https://example.com/your/very/long/link"/><button type="submit">Create short link <span>↗</span></button>{message && <p className={`form-message ${message.type}`}>{message.text}</p>}</form>{result && <div className="short-url-result"><h2>Your demo short link is ready!</h2><p className="generated-link"><a href={result.shortURL}>{result.shortURL}</a></p><p className="original-label">Original URL: {result.originalURL}</p><button className="copy-link-button" type="button" onClick={() => navigator.clipboard.writeText(result.shortURL).then(() => setMessage({ text: 'Link copied!', type: 'success' })).catch(() => setMessage({ text: 'Please copy the link manually.', type: 'error' }))}>Copy Link</button><p className="demo-explanation">This is a browser-only demo link. It works in this browser where the link is saved.</p></div>}<a className="history-link" href="/history">View your saved links ↗</a></section></main>
}
function History({ history, onDelete, onClick }) {
  return <main className="history-container"><section className="history-card"><a href="/" className="back-link">← Back to LinkLite</a><p className="eyebrow">YOUR LITTLE LINK LIBRARY</p><h1>Your saved links.</h1><p className="description">All your demo links, saved locally in this browser.</p>{history.length === 0 ? <p className="empty-message" >No links saved yet. Create your first demo short link to see it here.</p> : <ul className="history-list">{history.map(link => <li className="history-item" key={link.id}><div><a href={link.shortURL} onClick={() => onClick(link.id)}>{link.shortURL}</a><div className="original">{link.originalURL}</div><div className="meta">Clicks: {link.clicks || 0} | {link.createdAt}</div></div><button className="delete-btn" onClick={() => onDelete(link.id)}>Delete</button></li>)}</ul>}</section></main>
}
export default function App() {
  const [history, setHistory] = useState(readHistory)
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const update = (next) => { setHistory(next); saveHistory(next) }
  useEffect(() => {
    const match = window.location.hash.match(/^#demo-([A-Za-z0-9]+)$/)
    if (match) { const item = readHistory().find(link => link.shortCode === match[1]); if (item?.originalURL) window.location.replace(item.originalURL) }
    const refresh = () => setHistory(readHistory())
    window.addEventListener('storage', refresh)
    window.addEventListener('linklite-history-change', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('linklite-history-change', refresh) }
  }, [])
  const create = (item) => update([item, ...readHistory().filter(link => link.shortCode !== item.shortCode)])
  const remove = (id) => update(readHistory().filter(link => link.id !== id))
  const countClick = (id) => { const next = readHistory().map(link => link.id === id ? { ...link, clicks: (Number(link.clicks) || 0) + 1 } : link); update(next) }
  return <><Navbar/>{path === '/generator' ? <Generator onCreate={create}/> : path === '/history' ? <History history={history} onDelete={remove} onClick={countClick}/> : <Home history={history}/>}</>
}
