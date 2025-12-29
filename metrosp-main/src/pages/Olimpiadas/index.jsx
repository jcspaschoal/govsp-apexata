import { useEffect, useState } from "react";
import { AnalisesCard, FeedCard, TabCard } from "../../components";
import {
  getAnalysisNewsOlimpiadas,
  getAnalysisTweetsOlimpiadas,
} from "../../service/analysis";
import { getReview } from "../../service/review";
import { getFeedNewsOlimpiadas } from "../../service/feed";
import { toast } from "react-toastify";

const Olimpiadas = () => {
  const [analiseNews, setAnaliseNews] = useState(null);
  const [analiseTweets, setAnaliseTweets] = useState(null);
  const [review, setReview] = useState(null);
  const [feed, setFeed] = useState(null);
  const [page, setPage] = useState({ tweets: 1, articles: 1 });
  useEffect(() => {
    async function getAnaliseOlimpiadasApi() {
      const response = await getAnalysisNewsOlimpiadas();
      if (response) {
        setAnaliseNews(response);
      }
    }

    async function getReviewApi(id) {
      const response = await getReview(id);
      if (response) {
        setReview(response);
      }
    }

    async function getFeedApi() {
      const response = await getFeedNewsOlimpiadas(`?page=${1}`);
      if (response) {
        setFeed({
          articles: response.data.articles.data,
          tweets: response.data.tweets.data,
        });
      }
    }

    async function getFeedNewsOlimpiadasApi() {
      const response = await getAnalysisTweetsOlimpiadas();
      if (response) {
        setAnaliseTweets(response);
        response.reviewID && getReviewApi(response.reviewID);
        getFeedApi();
      }
    }

    getAnaliseOlimpiadasApi();
    getFeedNewsOlimpiadasApi();
  }, []);

  const handleInfinitScroll = async (type) => {
    if (type === "noticias") {
      const response = await getFeedNewsOlimpiadas(
        `?page=${page.articles + 1}`
      );
      if (response.status != 200 || response.data.articles.data.length === 0) {
        toast.warning("última página alcançada.");
        return;
      }
      setFeed((prev) => ({
        articles: [...prev.articles, ...response.data.articles.data],
        tweets: [...prev.tweets],
      }));
      setPage((prev) => ({ ...prev, articles: prev.articles + 1 }));
    } else {
      const response = await getFeedNewsOlimpiadas(`?page=${page.tweets + 1}`);
      if (response.status != 200 || response.data.tweets.data.length === 0) {
        toast.warning("última página alcançada.");
        return;
      }
      setFeed((prev) => ({
        articles: [...prev.articles],
        tweets: [...prev.tweets, ...response.data.tweets.data],
      }));
      setPage((prev) => ({ ...prev, tweets: prev.tweets + 1 }));
    }
  };

  return (
    <div className="container mx-auto px-10 mb-8">
      {feed ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12 gap-3">
          <div className="lg:col-span-8 col-span-1 mt-10">
            {review ? (
              <AnalisesCard review={review} title={"Análise Linhas Privadas"} />
            ) : null}
            {analiseNews && analiseTweets ? (
              <FeedCard
                news={analiseNews}
                tweets={analiseTweets}
                isReviewed={review ? true : false}
              />
            ) : (
              <svg
                className="animate-spin h-5 w-5 mr-3 ..."
                viewBox="0 0 24 24"
              ></svg>
            )}
          </div>
          <div className="lg:col-span-4 col-span-1">
            <div className="lg:sticky relative lg:top-8 lg:mt-10">
              {feed ? (
                  <TabCard
                      feed={feed}
                      infinitScrollHandle={handleInfinitScroll}
                  />
              ) : (
                  <svg
                      className="animate-spin h-5 w-5 mr-3 ..."
                      viewBox="0 0 24 24"
                  ></svg>
              )}{" "}
            </div>
          </div>
        </div>
      ) : (
          <div
              className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-12 w-12 mt-32 mb-128"></div>
      )}
    </div>
  );
};

export default Olimpiadas;
