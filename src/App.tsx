import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { router } from "./router";
import { useAuthStore } from "./stores/auth";

function App() {
  const token = useAuthStore((state) => state.token);
  const getProfile = useAuthStore((state) => state.getProfile);
  const getProfileRef = useRef(getProfile);

  useEffect(() => {
    getProfileRef.current = getProfile;
  }, [getProfile]);

  useEffect(() => {
    if (token) {
      getProfileRef.current();
    }
  }, [token]);

  return (
    <Theme>
      <RouterProvider router={router} />
    </Theme>
  )
}

export default App;
