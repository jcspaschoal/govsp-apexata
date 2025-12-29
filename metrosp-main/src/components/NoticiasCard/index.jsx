import { Link } from "react-router-dom";
import { formatDate } from "../../utils/format";

const NoticiasCard = ({ news, infinitScrollHandle }) => {
  return (
    <div className="">
      {" "}
      <h3 className="text-xl mb-8 font-bold border-b pb-1 text-blue-warm-vivid-70">
        Notícias
      </h3>
      {news.map((item, index) => (
        <div key={item.title} className="block pb-3 mb-1">
          <p className="truncate ">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-warm-vivid-70 text-lg font-semibold no-underline"
            >
              {item.title}
            </a>
          </p>
          <p className="line-clamp-3 text-sm">{item.description}</p>
          <p className="text-slate-400 text-opacity-80 text-sm">
            {formatDate(item.publish_date)}
          </p>
        </div>
      ))}
      <div className="grid justify-items-center">
        <button
          type="button"
          onClick={() => infinitScrollHandle("noticias")}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Ver mais
        </button>
      </div>
    </div>
  );
};

export default NoticiasCard;
