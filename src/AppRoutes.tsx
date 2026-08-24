import { Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthGate } from './features/auth/AuthGate';
import { LoginPage } from './features/auth/LoginPage';
import { GuestPage } from './features/convite/GuestPage';

/**
 * Roteamento de nível superior:
 * - `/login` e `/c/:slug` são públicos, sem sessão.
 * - Tudo o mais (Início, Comida, Convidados, Gastos…) fica atrás do `AuthGate`
 *   — a navegação interna entre essas abas continua sendo por estado
 *   (Zustand `tab`), não por URL; só a borda externa é protegida por rota.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/c/:slug" element={<GuestPage />} />
      <Route
        path="/*"
        element={
          <AuthGate>
            <App />
          </AuthGate>
        }
      />
    </Routes>
  );
}
