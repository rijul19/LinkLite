
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { signup } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signup(name, email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="auth-brand">LinkLite</Link>
                <h1>Create your account</h1>
                <p className="auth-subtitle">
                    Join LinkLite and start managing your links.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />

                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        minLength={8}
                        required
                    />

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    )
}
