import { Link } from "react-router-dom";

const FormadorCard = () => {
  return (
    <div className="">
      {" "}
      <h3 className="text-xl mb-8 font-bold border-b pb-4 text-blue-warm-vivid-70">
        Formadores de opinião
      </h3>
      <div className="cursor-pointer block pb-3 mb-3">
        <p className="text-blue-warm-vivid-70 font-semibold truncate ...">
          Paulo Figueredo
        </p>
        <p className="truncate ...">
          As últimas evoluções no vôlei de praia mostram como
        </p>
        <p className="text-slate-400 text-opacity-80 text-sm">Hoje</p>
      </div>
      <div className="cursor-pointer block pb-3 mb-3">
        <p className="text-blue-warm-vivid-70 font-semibold truncate ...">
          Roberta Godoy
        </p>
        <p className="truncate ...">
          It is a long established fact that a reader will be distracted by the
          readable content of a page when looking at its layout.
        </p>
        <p className="text-slate-400 text-opacity-80 text-sm">Hoje</p>
      </div>
      <div className="cursor-pointer block pb-3 mb-3">
        <p className="text-blue-warm-vivid-70 font-semibold truncate ...">
          Sandra Guimarães
        </p>
        <p className="truncate ...">
          Ipsum is that it has a more-or-less normal distribution of letters, as
          opposed to using 'Content
        </p>
        <p className="text-slate-400 text-opacity-80 text-sm">Há 1 dia</p>
      </div>
      <div className="grid justify-items-center">
        <Link to="/search">
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ver mais
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FormadorCard;
