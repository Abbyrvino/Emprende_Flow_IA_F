import { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

// El carrito agrupa items por id_vendedor
// items: [{ id_vendedor, nombre_vendedor, productos: [{ id_producto, nombre, precio, cantidad, imagen_url }] }]
const initialState = { grupos: [] };

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { id_vendedor, nombre_vendedor, producto } = action.payload;
      const grupos = [...state.grupos];
      let grupoIdx = grupos.findIndex((g) => g.id_vendedor === id_vendedor);

      if (grupoIdx === -1) {
        grupos.push({ id_vendedor, nombre_vendedor, productos: [] });
        grupoIdx = grupos.length - 1;
      }

      const prodIdx = grupos[grupoIdx].productos.findIndex(
        (p) => p.id_producto === producto.id_producto
      );

      if (prodIdx === -1) {
        grupos[grupoIdx].productos.push({ ...producto, cantidad: 1 });
      } else {
        grupos[grupoIdx].productos[prodIdx].cantidad += 1;
      }

      return { grupos };
    }

    case 'REMOVE_ITEM': {
      const { id_vendedor, id_producto } = action.payload;
      const grupos = state.grupos
        .map((g) => {
          if (g.id_vendedor !== id_vendedor) return g;
          return {
            ...g,
            productos: g.productos.filter((p) => p.id_producto !== id_producto),
          };
        })
        .filter((g) => g.productos.length > 0);
      return { grupos };
    }

    case 'UPDATE_CANTIDAD': {
      const { id_vendedor, id_producto, cantidad } = action.payload;
      if (cantidad <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id_vendedor, id_producto } });
      }
      const grupos = state.grupos.map((g) => {
        if (g.id_vendedor !== id_vendedor) return g;
        return {
          ...g,
          productos: g.productos.map((p) =>
            p.id_producto === id_producto ? { ...p, cantidad } : p
          ),
        };
      });
      return { grupos };
    }

    case 'CLEAR_VENDOR': {
      return {
        grupos: state.grupos.filter((g) => g.id_vendedor !== action.payload),
      };
    }

    case 'CLEAR_ALL':
      return initialState;

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const agregarProducto = (id_vendedor, nombre_vendedor, producto) => {
    dispatch({ type: 'ADD_ITEM', payload: { id_vendedor, nombre_vendedor, producto } });
  };

  const quitarProducto = (id_vendedor, id_producto) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id_vendedor, id_producto } });
  };

  const actualizarCantidad = (id_vendedor, id_producto, cantidad) => {
    dispatch({ type: 'UPDATE_CANTIDAD', payload: { id_vendedor, id_producto, cantidad } });
  };

  /**
   * Finalizar pedido con un vendedor específico.
   * REGLA CRÍTICA: window.open(link, '_blank') — nunca location.href
   */
  const finalizarPedido = async (id_vendedor, datos_cliente) => {
    const grupo = state.grupos.find((g) => g.id_vendedor === id_vendedor);
    if (!grupo) throw new Error('Grupo de vendedor no encontrado.');

    const items = grupo.productos.map((p) => ({
      id_producto: p.id_producto,
      cantidad: p.cantidad,
    }));

    const { data } = await api.post('/ventas', { id_vendedor, items, datos_cliente });

    // Abrir WhatsApp en nueva pestaña — nunca con location.href
    window.open(data.link_whatsapp, '_blank');

    // Limpiar el grupo del carrito
    dispatch({ type: 'CLEAR_VENDOR', payload: id_vendedor });

    return data;
  };

  const totalItems = state.grupos.reduce(
    (sum, g) => sum + g.productos.reduce((s, p) => s + p.cantidad, 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        grupos: state.grupos,
        totalItems,
        agregarProducto,
        quitarProducto,
        actualizarCantidad,
        finalizarPedido,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
