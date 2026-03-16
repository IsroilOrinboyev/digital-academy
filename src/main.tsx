import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App'
import { AuthProvider } from './app/store/AuthContext'
import { CartProvider } from './app/store/CartContext'
import { WishlistProvider } from './app/store/WishlistContext'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
          <Toaster position="top-right" richColors />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
