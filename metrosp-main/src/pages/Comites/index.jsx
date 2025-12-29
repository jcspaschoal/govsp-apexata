import { useEffect, useState } from "react";
import { AnalisesCard, FeedCard, TabCard } from "../../components";
import {
    getAnalysisNewsInternacional,
    getAnalysisTweetsInternacional,
    getAnalysisTweetsByDate,
} from "../../service/analysis";
import { getReview } from "../../service/review";
import { getFeedNewsInternacional } from "../../service/feed";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Comites = () => {
    const [inicio, setInicio] = useState("");
    const [analiseNews, setAnaliseNews] = useState(null);
    const [analiseTweets, setAnaliseTweets] = useState(null);
    const [review, setReview] = useState(null);
    const [feed, setFeed] = useState(null);
    const [page, setPage] = useState({ tweets: 1, articles: 1 });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const todayDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const storedDate = sessionStorage.getItem("selectedDate") || todayDate;
        setInicio(storedDate);
    }, [todayDate]);

    useEffect(() => {
        let isMounted = true;
        const getInitialData = async () => {
            setLoading(true);
            if (isMounted) {
                await getAnaliseInternacionalApi();
                setLoading(false);
            }
        };
        getInitialData();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (inicio) {
            fetchTweetsAnalise(inicio);
        }
    }, [inicio]);

    const fetchTweetsAnalise = async (date) => {
        setLoading(true);
        const adjustedDate = new Date(date) > new Date(todayDate) ? todayDate : date;
        let response;
        if (adjustedDate === todayDate) {
            response = await getTweetsAnaliseCobApi();
        } else {
            response = await getTweetsAnaliseByDate(formatDateForApi(adjustedDate));
            if (!response || response.notFound) {
                response = await getTweetsAnaliseCobApi();
                setInicio(todayDate);
                sessionStorage.setItem("selectedDate", todayDate);
            }
        }
        setLoading(false);
        return response; // Return the response data
    };


    const formatDateForApi = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };

    const getAnaliseInternacionalApi = async () => {
        const response = await getAnalysisNewsInternacional();
        if (response) {
            setAnaliseNews(response);
            if (response.reviewID) {
                await getReviewApi(response.reviewID);
            }
            await getFeedApi();
        }
    };

    const getReviewApi = async (id) => {
        const response = await getReview(id);
        if (response) {
            setReview(response);
        }
    };

    const getFeedApi = async () => {
        const response = await getFeedNewsInternacional(`?page=${1}`);
        if (response) {
            setFeed({
                articles: response.data.articles.data,
                tweets: response.data.tweets.data,
            });
        }
    };

    const getTweetsAnaliseCobApi = async () => {
        const response = await getAnalysisTweetsInternacional();
        if (response) {
            setAnaliseTweets(response);
            if (response.reviewID) {
                await getReviewApi(response.reviewID);
            }
            await getFeedApi();
        }
    };

    const getTweetsAnaliseByDate = async (date) => {
        const response = await getAnalysisTweetsByDate(`?date=${date}`);
        if (response) {
            setAnaliseTweets(response);
            if (response.reviewID) {
                await getReviewApi(response.reviewID);
            }
            await getFeedApi();
        }
        return response;
    };

    const handleInfinitScroll = async (type) => {
        if (type === "noticias") {
            const response = await getFeedNewsInternacional(`?page=${page.articles + 1}`);
            if (response.status !== 200 || response.data.articles.data.length === 0) {
                toast.warning("Última página alcançada.");
                return;
            }
            setFeed((prev) => ({
                articles: [...prev.articles, ...response.data.articles.data],
                tweets: [...prev.tweets],
            }));
            setPage((prev) => ({ ...prev, articles: prev.articles + 1 }));
        } else {
            const response = await getFeedNewsInternacional(`?page=${page.tweets + 1}`);
            if (response.status !== 200 || response.data.tweets.data.length === 0) {
                toast.warning("Última página alcançada.");
                return;
            }
            setFeed((prev) => ({
                articles: [...prev.articles],
                tweets: [...prev.tweets, ...response.data.tweets.data],
            }));
            setPage((prev) => ({ ...prev, tweets: prev.tweets + 1 }));
        }
    };

    const handleDateChange = async (date) => {
        const adjustedDate = new Date(date) > new Date(todayDate) ? todayDate : date;
        setInicio(adjustedDate);
        sessionStorage.setItem("selectedDate", adjustedDate);
        const newTweetsData = await fetchTweetsAnalise(adjustedDate);

        return newTweetsData;
    }


    return (
        <div className="container mx-auto px-10 mb-8">
            {feed ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12 gap-3">
                    <div className="lg:col-span-8 col-span-1 mt-10">
                        {review ? (
                            <AnalisesCard review={review} title={"Análise Geral"} />
                        ) : null}
                        {analiseNews && analiseTweets ? (
                            <FeedCard
                                news={analiseNews}
                                tweets={analiseTweets}
                                isReviewed={review ? true : false}
                                withDate={true}
                                onDateChange={handleDateChange}
                            />
                        ) : (
                            <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24"></svg>
                        )}
                    </div>

                    <div className="lg:col-span-4 col-span-1">
                        <div className="lg:sticky relative lg:top-8 lg:mt-10">
                            {feed ? (
                                <TabCard
                                    feed={feed && feed}
                                    infinitScrollHandle={handleInfinitScroll}
                                />
                            ) : (
                                <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24"></svg>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-12 w-12 mt-32 mb-128"></div>
            )}
        </div>
    );
};

export default Comites;
