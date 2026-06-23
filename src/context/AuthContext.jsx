import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar sesión desde localStorage al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    if (token && usuario) {
      dispatch({
        type: 'SET_USER',
        payload: { user: JSON.parse(usuario), token },
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    dispatch({ type: 'SET_USER', payload: { user: data.usuario, token: data.token } });
    return data;
  };

  const register = async (nombre, email, password) => {
    const { data } = await api.post('/auth/register', { nombre, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    dispatch({ type: 'LOGOUT' });
  };

  // Actualiza el estado del usuario (p.ej. tras crear negocio)
  const actualizarUsuario = (usuario, token) => {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    if (token) localStorage.setItem('token', token);
    dispatch({ type: 'SET_USER', payload: { user: usuario, token: token || state.token } });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
