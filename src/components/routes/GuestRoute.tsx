import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { Role } from "../../models/user";

const GuestRoute = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!token) {
    return <Outlet />;
  }

  if (isLoading && !user) {
    return null;
  }

  if (user?.role === Role.CLIENT) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default GuestRoute;
