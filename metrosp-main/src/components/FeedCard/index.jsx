import { useState, useEffect } from "react";
import { DoubleLineNews, DoubleLineTweets } from "../Charts";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const FeedChartCard = ({ news, tweets, isReviewed, withDate, onDateChange }) => {
    const [inicio, setInicio] = useState("");
    const [currentNews, setCurrentNews] = useState(news);
    const [currentTweets, setCurrentTweets] = useState(tweets);

    const [tabs, setTabs] = useState([
        { name: "Tweets", href: "#", current: true, chart: tweets },
        { name: "Notícias", href: "#", current: false, chart: news },
    ]);

    useEffect(() => {
        const storedDate = sessionStorage.getItem("selectedDate");
        const today = storedDate ? storedDate : new Date().toISOString().split('T')[0];
        setInicio(today);
    }, []);

    const handleClickTab = (index) => {
        const newTabs = [...tabs];
        newTabs.forEach((tab, i) => {
            tab.current = i === index;
        });
        setTabs(newTabs);
    };

    const handleDateChange = async (e) => {
        const newDate = e.target.value;
        if (newDate !== inicio) { // Verifique se a data mudou
            setInicio(newDate);
            sessionStorage.setItem("selectedDate", newDate);
            if (onDateChange) {
                const newData = await onDateChange(newDate);
                if (newData) {
                    setCurrentTweets(newData || []);
                    setTabs((prevTabs) => [
                        { name: "Tweets", href: "#", current: true, chart: newData|| [] },
                        { name: "Notícias", href: "#", current: false, chart: currentNews }, // Keep the initial articles data
                    ]);
                }
            }
        }
    };

    return (
        <>
            <div className="bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8">
                <div className="block mx-3">
                    <div className="border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                {tabs.map((tab, index) => (
                                    <span
                                        key={tab.name}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleClickTab(index)}
                                        className={classNames(
                                            tab.current
                                                ? "border-indigo-500 text-indigo-600"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                                            "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                                        )}
                                        aria-current={tab.current ? "page" : undefined}
                                    >
                                        {tab.name}
                                    </span>
                                ))}
                            </nav>

                            <div className="flex items-center space-x-4">
                                {withDate ? (
                                    <div className="space-y-2 w-32 mt-0.5 ml-3">
                                        <input
                                            type="date"
                                            value={inicio}
                                            onChange={handleDateChange}
                                            className="block w-full rounded-md py-1 px-2 text-sm border-[#1351b4] border-2"
                                        />
                                    </div>
                                ) : null}
                                {Cookies.get("roles").includes("ANALYST") || Cookies.get("roles").includes("ADMIN") && !isReviewed ? (
                                    <div className="relative inline-block">
                                        <button>
                                            <Link
                                                to={`/analise/${tabs.find((tab) => tab.current).chart?.id}`}
                                            >
                                                <PlusCircleIcon className="mt-2 h-7 w-7 text-blue-warm-vivid-70" />
                                            </Link>
                                        </button>
                                        <div
                                            className="tooltip bg-blue-800 text-white text-sm p-2 rounded absolute bottom-full left-0 mt-2 opacity-0 hover:opacity-100 transition-opacity"
                                        >
                                            Criar nova análise
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
                {tabs.find((tab) => tab.current).name === "Tweets" ? (
                    <DoubleLineTweets title={tabs[0].name} analise={tabs[0].chart} />
                ) : (
                    <DoubleLineNews title={tabs[1].name} analise={tabs[1].chart} />
                )}
            </div>
            <div className="bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8"></div>
        </>
    );
};

export default FeedChartCard;
