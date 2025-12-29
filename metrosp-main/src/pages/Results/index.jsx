import { useLocation, useParams } from "react-router-dom";
import styles from "./Results.module.css";
import { useEffect, useState } from "react";
import { getFeed } from "../../service/feed";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/format";
import { PlusIcon } from "@heroicons/react/24/outline";
import { SearchNavBar } from "../../components";

const Results = () => {
  const { type } = useParams();
  const location = useLocation();
  const [articles, setArticles] = useState(null);
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    async function getFeedNewsApi() {
      const response = await getFeed(`${type}${location.search}`);
      if (response?.status == 200) {
        if (type == "news") {
          setArticles(response.data.articles);
        } else if (type == "twitter") {
          setArticles(response.data.tweets);
        }
      } else {
        toast.error("Nenhum resultado foi encontrado!");
      }
    }
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page");
    setPage(Number(page));

    getFeedNewsApi();
  }, [location, type]);

  useEffect(() => {
    setError(false);
  }, [location, type]);

  const handleInfinitScroll = async () => {
    const searchParams = new URLSearchParams(location.search);

    const query = searchParams.get("query");
    const dataInicio = searchParams.get("datainicio");
    const dataFim = searchParams.get("datafim");
    setIsLoading(true);

    const response = await getFeed(
      `${type}?page=${
        page + 1
      }&size=5&query="${query}"&datainicio=${dataInicio}&datafim=${dataFim}`
    );

    if (response?.status == 200) {
      setPage((prev) => prev + 1);
      type == "news"
        ? setArticles((prev) => [...prev, ...response.data.articles.data])
        : setArticles((prev) => [...prev, ...response.data.tweets.data]);
    } else {
      toast.warning("Último resultado atingido!");
    }
    setIsLoading(false);
  };

  return (
    <>
      <SearchNavBar />
      <div className={`container-lg ${styles["results-text-wrap"]}`}>
        {articles ? (
          type == "news" ? (
            articles.map((article, index) => (
              <div key={index} className="my-6">
                <h2 className="mb-2 truncate text-2xl font-bold">
                  <a href={article.url} rel="noreferrer" target="_blank">
                    {article.title}
                  </a>
                </h2>
                <p>{article.description}</p>
                <span className="text-slate-400 text-opacity-80 text-sm">
                  {formatDate(article.publish_date)}
                </span>
              </div>
            ))
          ) : (
            articles.map((article, index) => (
              <div key={index} className="my-6">
                <h2 className="mb-2 truncate font-sans text-2xl font-bold">
                  <span>@{article.username}</span>
                </h2>
                <p>{article.text}</p>
                <span className="text-slate-400 text-opacity-80 text-sm">
                  {formatDate(article.tweet_date)}
                </span>
              </div>
            ))
          )
        ) : (
          <h1 className="mt-2 mb-60 text-2xl font-bold text-red-500">
            Nenhuma informção foi encontrada com os parâmetros solicitados.
            Tente novamente com outros parâmetros.
          </h1>
        )}
        <div className="flex justify-center mb-5">
          {isLoading ? (
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-12 w-12"></div>
          ) : (
            <>
              {" "}
              <button
                onClick={() => handleInfinitScroll()}
                type="button"
                className="flex items-center gap-2 rounded-full bg-indigo-600 py-2 px-2.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon className="h-5 w-5" aria-hidden="true" />{" "}
                <span className="font-semibold">Carregar mais notícias</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Results;
