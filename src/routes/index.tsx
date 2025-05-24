import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/index" replace />,
  },
  {
    path: '/index',
    lazy: async () => {
      const { default: IndexPage } = await import('../pages/IndexPage');
      return {
        Component: IndexPage
      }
    }
  },
  {
    path: '/login',
    lazy: async () => {
      const { default: LoginPage } = await import('../pages/Loginpage');
      return {
        Component: LoginPage
      }
    }
  },
  {
    path: '/home',
    lazy: async () => {
      const { default: HomePage } = await import('../pages/HomePage');
      return {
        Component: HomePage
      }
    }
  },
  {
    path: '/chess',
    lazy: async () => {
      const { default: ChessPage } = await import('../pages/ChessPage');
      return {
        Component: ChessPage,
      }
    }
  },
]);

export default router;