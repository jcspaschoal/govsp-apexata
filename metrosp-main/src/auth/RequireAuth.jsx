import { useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Login } from "../pages";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const RequireAuth = ({ children }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!Cookies.get("token")) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  return Cookies.get("token") ? children : null;
};

export default RequireAuth;
