import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useEffect } from "react";
import { getUser, updateUser } from "../../service/user";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState(null);
  const [compare, setCompare] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function getUserApi() {
      const response = await getUser();
      setUser(response);
    }

    getUserApi();
  }, []);

  const handleChangeEmail = (e) => {
    setUser({ email: e.target.value });
    setError(false);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setError(false);
  };

  const handleChangeCompare = (e) => {
    setCompare(e.target.value);
    setError(false);
  };

  const handleSubmitUser = async () => {
    if (user && password && compare && error == false) {
      if (password != compare) {
        setError(true);
        toast.error("As senhas devem ser iguais");
      } else {
        const response = await updateUser({
          email: user.email,
          password,
          passwordConfirm: compare,
        });
        if (response?.status == 200) {
          toast.success("Senha alterada com sucesso!", {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: 2000,
            onClose() {
              navigate(-1);
            },
          });
        }
      }
    } else {
      setError(true);
      toast.error("E-mail e senhas são obrigatórios");
    }
  };
  return (
    <div className="container">
      <form>
        <div className="space-y-12">
          <div className="pb-12">
            <h2 className="text-3xl font-semibold leading-7 mt-3 text-blue-700 ">
              Área do usuário
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
              <div className="sm:col-span-3">
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium leading-6 ${
                    error ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  E-mail
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    value={user?.email || ""}
                    onChange={(e) => handleChangeEmail(e)}
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full rounded-md border-0  py-1.5 px-2 text-gray-900 shadow-sm ring-inset ${
                      error ? " ring-2 ring-red-600" : " ring-1  ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="senha"
                  className={`block text-sm font-medium leading-6 ${
                    error ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  Senha
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => handleChangePassword(e)}
                    name="senha"
                    id="senha"
                    className={`block w-full rounded-md border-0  py-1.5 px-2 text-gray-900 shadow-sm ring-inset ${
                      error ? " ring-2 ring-red-600" : " ring-1  ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="confirmarsenha"
                  className={`block text-sm font-medium leading-6 ${
                    error ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  Confirmar senha
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="confirmarsenha"
                    value={compare}
                    onChange={(e) => handleChangeCompare(e)}
                    id="confirmarsenha"
                    autoComplete="confirmarsenha"
                    className={`block w-full rounded-md border-0  py-1.5 px-2 text-gray-900 shadow-sm ring-inset ${
                      error ? " ring-2 ring-red-600" : " ring-1  ring-gray-300"
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={handleSubmitUser}
            className="rounded-md bg-indigo-600 px-3 py-2 mb-128 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
