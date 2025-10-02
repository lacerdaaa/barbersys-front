import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import BarberDashboard from "../pages/BarberDashboard";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import GuestRoute from "../components/routes/GuestRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/barber", element: <BarberDashboard /> },
    ],
  },
]);
