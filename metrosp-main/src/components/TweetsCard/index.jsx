import { Link } from "react-router-dom";
import { formatDate } from "../../utils/format.js";

const index = ({ tweets, infinitScrollHandle }) => {
  return (
    <div className="">
      {" "}
      <h3 className="text-xl mb-8 font-bold border-b pb-4 text-blue-warm-vivid-70">
        Tweets
      </h3>
      {tweets.map((tweet, index) => (
        <div key={tweet.idTweet} className="block pb-3 mb-3">
          {tweet.url ? (
            <a
              href={tweet.url}
              rel="noreferrer"
              target="_blank"
              className="text-blue-warm-vivid-70 font-sans font-semibold truncate lowercase"
            >
              &#64;{tweet.username}
            </a>
          ) : (
            <p className="text-blue-warm-vivid-70 font-sans font-semibold truncate lowercase">
              &#64;{tweet.username}
            </p>
          )}
          <p className=" font-sans font-normal ...">{tweet.text}</p>
          <p className="text-slate-400 text-opacity-80 text-sm">
            {formatDate(tweet.tweet_date)}
          </p>
        </div>
      ))}
      <div className="grid justify-items-center">
        <button
          type="button"
          onClick={() => infinitScrollHandle("tweets")}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Ver mais
        </button>
      </div>
    </div>
  );
};

export default index;
