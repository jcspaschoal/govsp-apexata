import styles from "./SearchNavBar.module.css";
import logo from "../../assets/logo.jpg";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import bg_login from "../../assets/images/bg_login.jpg";
import { UserCircleIcon } from "@heroicons/react/20/solid";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../service/auth";
import { useState } from "react";
import { toast } from "react-toastify";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const SearchNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("news");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const handleChangeInput = (e) => {
    setSearch(e.target.value);
  };

  const handleNavigateToResults = () => {
    if (!(search.length > 0) || !type || !inicio || !fim) {
      toast.error("Todos os campos são obrigatórios!");
    } else {
      navigate(
        `/results/${type}?page=1&size=5&query="${search}"&datainicio=${inicio}&datafim=${fim}`
      );
    }
  };
  return (
    <div>
      <Disclosure
        as="nav"
        className={`pt-24 ${styles["header-background"]} ${
          location.pathname.includes("/results")
            ? "min-h-[50vh]"
            : "min-h-[82vh]"
        }`}
      >
        {({ open }) => (
          <div className="container-lg flex justify-between items-center bg-white shadow-lg rounded-xl py-6">
            {open ? null : (
              <div
                className={`container-lg d-flex flex-column justify-content-center ${styles["search-container"]}`}
              >
                <div className="col-span-full">
                  <div className="flex flex-col flex-sm-row items-baseline">
                    <span
                      htmlFor="street-address"
                      className="block text-3xl font-medium leading-6 text-[#1351B4] text-[36px] mr-6 mb-sm-0 mb-3"
                    >
                      Buscar
                    </span>
                    <fieldset>
                      <div className="flex space-x-6">
                        <div className="flex items-center gap-x-3">
                          <input
                            id="noticias"
                            name="search-type"
                            value="news"
                            onChange={(e) => setType(e.target.value)}
                            type="radio"
                            defaultChecked
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label
                            htmlFor="noticias"
                            className="block text-sm font-medium leading-6 text-[#1351B4]"
                          >
                            Notícias
                          </label>
                        </div>
                        <div className="flex items-center gap-x-3">
                          <input
                            id="tweets"
                            value="twitter"
                            onChange={(e) => setType(e.target.value)}
                            name="search-type"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label
                            htmlFor="tweets"
                            className="block text-sm font-medium leading-6 text-[#1351B4]"
                          >
                            Tweets
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                  <div className="mt-2 relative">
                    <input
                      type="text"
                      name="Buscar"
                      value={search}
                      onChange={(e) => handleChangeInput(e)}
                      id="Buscar"
                      autoComplete="Buscar"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />

                    <button
                      onClick={() => handleNavigateToResults()}
                      className="absolute top-[5px] right-2 hover:outline rounded-2xl outline-blue-500/50 outline-4 hover:bg-blue-500/50 "
                    >
                      <MagnifyingGlassIcon color="#005081" width={25} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-md-row flex-col items-md-center items-start gap-x-20 mt-3">
                  <div className="space-y-2 w-64">
                    <label className="text-[#1351B4]">Início</label>
                    <input
                      type="date"
                      onChange={(e) => setInicio(e.target.value)}
                      className="block w-full rounded-md py-1.5 px-1.5 border-[#1351b4] border-2"
                    />
                  </div>
                  <div className="space-y-2 w-64">
                    <label className="text-[#1351B4]">Fim</label>
                    <input
                      type="date"
                      onChange={(e) => setFim(e.target.value)}
                      className="block w-full rounded-md py-1.5 px-1.5 border-[#1351b4] border-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Disclosure>
    </div>
  );
};

export default SearchNavBar;
