import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { router } from "./router";
import { useAuthStore } from "./stores/auth";

function App() {
  const { token, getProfile } = useAuthStore((state) => ({
    token: state.token,
    getProfile: state.getProfile,
  }));

  useEffect(() => {
    if (token) {
      getProfile();
    }
  }, [token, getProfile]);

  return (
    <Theme>
      <RouterProvider router={router} />
    </Theme>
  )
}

export default App;
