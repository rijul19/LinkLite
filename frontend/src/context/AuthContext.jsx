
import {
    createContext,
    useContext,
    useEffect,
    useReducer,
} from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const initialState = {
    user: null,
    token: localStorage.getItem('linklite_token'),
    isLoading: true,
}

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                user: action.payload.user,
                token: action.payload.token,
                isLoading: false,
            }

        case 'LOGOUT':
            return {
                user: null,
                token: null,
                isLoading: false,
            }

        case 'READY':
            return {
                ...state,
                isLoading: false,
            }

        default:
            return state
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState)

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('linklite_token')

            if (!token) {
                dispatch({ type: 'READY' })
                return
            }

            try {
                const response = await api.get('/auth/me')
                dispatch({
                    type: 'LOGIN',
                    payload: { user: response.data.data, token },
                })
            } catch {
                localStorage.removeItem('linklite_token')
                dispatch({ type: 'LOGOUT' })
            }
        }

        verifyUser()
    }, [])

    const login = async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password,
        })

        const { user, token } = response.data.data
        localStorage.setItem('linklite_token', token)
        dispatch({ type: 'LOGIN', payload: { user, token } })

        return user
    }

    const signup = async (name, email, password) => {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
        })

        const { user, token } = response.data.data
        localStorage.setItem('linklite_token', token)
        dispatch({ type: 'LOGIN', payload: { user, token } })

        return user
    }

    const logout = () => {
        localStorage.removeItem('linklite_token')
        dispatch({ type: 'LOGOUT' })
    }

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                token: state.token,
                isLoading: state.isLoading,
                isAuthenticated: Boolean(state.token && state.user),
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}
