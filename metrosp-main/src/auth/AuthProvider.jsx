import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { login, logout } from "../service/auth";
import Cookies from "js-cookie";
import { jwtDecrypt } from "../utils/jwtDecrypt";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState(null);

  const signin = async (credentials) => {
    const data = await login(credentials);
    if (data.token) {
      setUser(data.token);
      const decodedToken = jwtDecrypt(data.token);
      setRoles(decodedToken.roles);

      Cookies.set("roles", decodedToken.roles, { expires: 6 / 24 });
      Cookies.set("token", data.token, { expires: 6 / 24 });

      return true;
    }
    return false;
  };

  const signout = async () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, roles, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};
