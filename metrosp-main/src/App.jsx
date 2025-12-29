import { Routes, Route } from "react-router-dom";
import { Layout } from "./components";
import {
  Cob,
  CreateAnalysis,
  EditAnalysis,
  ForgotPass,
  Imprensa,
  Login,
  NotFound,
  Profile,
  Results,
  Search,
} from "./pages";
import { ToastContainer } from "react-toastify";
import RequireAuth from "./auth/RequireAuth";
import Esportes from "./pages/Esportes";
import Olimpiadas from "./pages/Olimpiadas";
import Comites from "./pages/Comites";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/metro"
          element={
            <RequireAuth>
              <Cob />
            </RequireAuth>
          }
        />
        <Route
          path="/publicas"
          element={
            <RequireAuth>
              <Esportes />
            </RequireAuth>
          }
        />
        <Route
          path="/privadas"
          element={
            <RequireAuth>
              <Olimpiadas />
            </RequireAuth>
          }
        />
        <Route
          path="/geral"
          element={
            <RequireAuth>
              <Comites />
            </RequireAuth>
          }
        />
        <Route
          path="/impressa"
          element={
            <RequireAuth>
              <Imprensa />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/search"
          element={
            <RequireAuth>
              <Search />
            </RequireAuth>
          }
        />
        <Route
          path="/results/:type"
          element={
            <RequireAuth>
              <Results />
            </RequireAuth>
          }
        />
        <Route
          path="/analise/:analiseId"
          element={
            <RequireAuth>
              <CreateAnalysis />
            </RequireAuth>
          }
        />
        <Route
          path="/editar/:analiseId"
          element={
            <RequireAuth>
              <EditAnalysis />
            </RequireAuth>
          }
        />
        <Route path="/forgot-pass" element={<ForgotPass />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={6000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        progress={undefined}
      />
    </Layout>
  );
}

export default App;
