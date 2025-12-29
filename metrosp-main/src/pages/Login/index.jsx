import { useNavigate } from "react-router-dom";
import logoAzul from "../../assets/icons/logo_azul.png";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { toast } from "react-toastify";
import imagem0 from "../../assets/imagensLogin/imagens/imagem0.jpg";
import imagem1 from "../../assets/imagensLogin/imagens/imagem1.jpg";
import imagem2 from "../../assets/imagensLogin/imagens/imagem2.jpg";
import imagem3 from "../../assets/imagensLogin/imagens/imagem3.jpg";
import imagem4 from "../../assets/imagensLogin/imagens/imagem4.jpg";
import imagem5 from "../../assets/imagensLogin/imagens/imagem5.jpg";
import imagem6 from "../../assets/imagensLogin/imagens/imagem6.jpg";
import imagem7 from "../../assets/imagensLogin/imagens/imagem7.jpg";

const Login = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    setError(false);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setError(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      const isLogged = await auth.signin({ email, password });
      if (isLogged) {
        navigate("/geral");
      } else {
        setError(true);
        toast.error("As credenciais estão erradas");
      }
    } else {
      setError(true);
      toast.error("E-mail e senha são obrigatórios");
    }
  };

  useEffect(() => {
    const images = [
      imagem0,
      imagem1,
      imagem2,
      imagem3,
      imagem4,
      imagem5,
      imagem6,
      imagem7,
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setImage(randomImage);
  }, []);

  return (
    <>
      <div className="flex min-h-screen flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full bg-white p-4 max-w-sm lg:w-96">
            <div>
              <img className="h-12 w-auto" src={logoAzul} />
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-[#1351B4]">
                Faça login na plataforma
              </h2>
            </div>

            <div className="mt-10">
              <div>
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-medium leading-6 text-gray-500 text-lg"
                    >
                      E-mail
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        value={email}
                        placeholder="Digite seu email"
                        onChange={(e) => handleChangeEmail(e)}
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`block w-full rounded-md border-0  py-1.5 px-2 text-gray-900 shadow-sm ring-inset ${
                          error
                            ? " ring-2 ring-red-600"
                            : " ring-1  ring-gray-300"
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block font-medium leading-6 text-gray-500 text-lg"
                      >
                        Senha
                      </label>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-500 hover:text-[#1351B4] hover:cursor-pointer">
                          Esqueceu a senha?
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        id="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => handleChangePassword(e)}
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        className={`block w-full rounded-md border-0  py-1.5 px-2 text-gray-900 shadow-sm ring-inset ${
                          error
                            ? " ring-2 ring-red-600"
                            : " ring-1  ring-gray-300"
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={(e) => handleLogin(e)}
                      className="flex w-full justify-center rounded-md bg-[#F8C93C] px-3 py-1.5 text-lg font-bold leading-6 text-[#1351B4] shadow-sm hover:bg-[#1351B4]/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full bg-right"
            src={image}
            alt=""
          />
        </div>
        <div className="absolute block lg:hidden -z-10 opacity-30">
          <img src={image} className="min-h-screen" />
        </div>
      </div>
    </>
  );
};

export default Login;
