import { useEffect, useState } from "react";
import NoticiasCard from "../NoticiasCard";
import { TweetsCard } from "..";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const TabCard = ({ feed, infinitScrollHandle }) => {
  const [tabs, setTabs] = useState([
    {
      name: "Tweets",
      href: "#",
      current: true,
    },
    {
      name: "Notícias",
      href: "#",
      current: false,
    },
  ]);

  const handleClickTab = (index) => {
    // Cria uma cópia do array de tabs
    const newTabs = [...tabs];

    // Atualiza o estado 'current' da tab clicada
    newTabs.forEach((tab, i) => {
      tab.current = i === index;
    });

    // Define o novo estado das tabs
    setTabs(newTabs);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 mb-8 pb-12">
      <div className="block">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {tabs.map((tab, tabIdx) => (
            <span
              key={tab.name}
              onClick={() => handleClickTab(tabIdx)}
              className={classNames(
                tab.current
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                tabIdx === 0 ? "rounded-l-lg" : "",
                tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.current ? "bg-indigo-500" : "bg-transparent",
                  "absolute inset-x-0 bottom-0 h-0.5"
                )}
              />
            </span>
          ))}
        </nav>
        {tabs.map(
          (tab, index) =>
            tab.current && (
              <div key={index} className="mt-5">
                {index == 0 ? (
                  <TweetsCard
                    tweets={feed.tweets}
                    infinitScrollHandle={infinitScrollHandle}
                  />
                ) : (
                  <NoticiasCard
                    news={feed.articles}
                    infinitScrollHandle={infinitScrollHandle}
                  />
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default TabCard;
