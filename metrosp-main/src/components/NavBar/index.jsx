import styles from "./NavBar.module.css";
import logo from "../../assets/logo.jpg";
import logoAzul from "../../assets/icons/logo_azul.png";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../../service/auth";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const NavBar = () => {
  const { pathname } = useLocation();
  const handleActivePageDesktop = (atual) => {
    if (pathname == atual) {
      return "rounded-md bg-[#1351B4] px-3 py-2 text-sm font-semibold text-white ";
    } else {
      return "br-button rounded-md px-3 py-2 text-sm font-medium text-[#1351B4]";
    }
  };

  const handleActivePageMobile = (atual) => {
    if (pathname == atual) {
      return "block rounded-md bg-[#1351B4] px-3 py-2 text-base font-medium text-white";
    } else {
      return "block br-button rounded-md px-3 py-2 text-base font-medium text-[#1351B4]";
    }
  };
  return (
    <>
      <Disclosure
        as="nav"
        className={`bg-[#F8C93C] ${styles["header-background"]}`}
      >
        {({ open }) => (
          <div className="shadow-md">
            <div className="container">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <Link to="/geral">
                    <div className="flex-shrink-0">
                      <img
                        className="block h-auto w-28 lg:hidden "
                        src={logoAzul}
                        alt="Your Company"
                      />
                      <img
                        className="hidden h-auto w-28 lg:block "
                        src={logoAzul}
                        alt="Your Company"
                      />
                    </div>
                  </Link>
                  <div className="hidden lg:ml-6 lg:block">
                    <div className="flex space-x-4">
                      {/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                      <Link
                        to="/geral"
                        className={handleActivePageDesktop("/geral")}
                      >
                        Geral
                      </Link>
                      <Link
                        to="/publicas"
                        className={handleActivePageDesktop("/publicas")}
                      >
                        Linhas publicas
                      </Link>
                      <Link
                        to="/privadas"
                        className={handleActivePageDesktop("/privadas")}
                      >
                        Linhas privadas
                      </Link>
                      <Link
                        to="/metro"
                        className={handleActivePageDesktop("/metro")}
                      >
                        Metrô SP Perfil Oficial
                      </Link>
                      <Link
                        to="/impressa"
                        className={handleActivePageDesktop("/impressa")}
                      >
                        Imprensa
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:ml-6 lg:block">
                  <div className="flex items-center">
                    <Link to="/search">
                      <button type="button" className="br-button">
                        <span className="sr-only">Buscar</span>
                        <MagnifyingGlassIcon
                          className="h-6 w-6"
                          aria-hidden="true"
                        />
                      </button>
                    </Link>

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full text-sm">
                          <span className="sr-only">Abrir menu do usuário</span>
                          <UserCircleIcon className="h-8 w-8 rounded-full" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Minha conta
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <span
                                onClick={() => logout()}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Sair
                              </span>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="-mr-2 flex items-center lg:hidden">
                  {/* Mobile menu button */}
                  <Link to="/search">
                    <button
                      type="button"
                      className="rounded-full p-1 text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">Buscar</span>
                      <MagnifyingGlassIcon
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </button>
                  </Link>
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Abrir menu princiapl</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="lg:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
                <Disclosure.Button
                  as="span"
                  className={handleActivePageMobile("/geral")}
                >
                  <Link to="/geral">Geral</Link>
                </Disclosure.Button>
                <Disclosure.Button
                  as="span"
                  className={handleActivePageMobile("/publicas")}
                >
                  <Link to="/publicas">Linhas publicas</Link>
                </Disclosure.Button>
                <Disclosure.Button
                  as="span"
                  className={handleActivePageMobile("/privadas")}
                >
                  <Link to="/privadas">Linhas privadas</Link>
                </Disclosure.Button>
                <Disclosure.Button
                  as="span"
                  className={handleActivePageMobile("/metro")}
                >
                  <Link to="/metro">Metrô SP Perfil Oficial</Link>
                </Disclosure.Button>
                <Disclosure.Button
                  as="span"
                  className={handleActivePageMobile("/impressa")}
                >
                  <Link to="/impressa">Imprensa</Link>
                </Disclosure.Button>
              </div>
              <div className="border-t  pb-3">
                <div className=" space-y-1 px-2">
                  <Link to="/profile">
                    <Disclosure.Button
                      as="span"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-700 hover:text-white"
                    >
                      Minha conta
                    </Disclosure.Button>
                  </Link>
                  <Disclosure.Button
                    as="span"
                    className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-700 hover:text-white"
                  >
                    <span onClick={() => logout()}>Sair</span>
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </>
  );
};

export default NavBar;
