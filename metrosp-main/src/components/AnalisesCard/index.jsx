import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import "./AnalisesCard.module.css";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ReactHtmlParser from "react-html-parser";
import DOMPurify from "dompurify";
import { deleteReview } from "../../service/review";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/format";

const AnalisesCard = ({ review, title }) => {
  const navigate = useNavigate();
  const hanldeDeleteReview = async (id) => {
    const response = await deleteReview(id);
    if (response?.status == 200) {
      toast.success("Analise excluída com sucesso!", {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 1000,
        onClose() {
          navigate(0);
        },
      });
    } else {
      toast.error("Ocorreu um error na exclusão da análise!", {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8 px-4">
      <div className="">
        {review ? (
          <>
            <div className="flex justify-between">
              <h2 className="font-bold text-up-03 pb-0">{title}</h2>
              <div>
                {Cookies.get("roles").includes("ANALYST" || "ADMIN") ? (
                  <>
                    <div className="relative inline-block">
                      <button>
                        <Link to={`/editar/${review.id}`}>
                          <PencilSquareIcon className="h-5 w-5 text-blue-warm-vivid-70 mr-4" />
                        </Link>
                      </button>
                      <div className="tooltip bg-blue-800 text-white text-sm p-2 rounded absolute bottom-full left-0 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                        Editar
                      </div>
                    </div>
                    <div className="relative inline-block">
                      <button onClick={() => hanldeDeleteReview(review.id)}>
                        <TrashIcon className="h-5 w-5 text-blue-warm-vivid-70" />
                      </button>
                      <div className="tooltip bg-blue-800 text-white text-sm p-2 rounded absolute bottom-full left-0 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                        Excluir
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            {/*
            <div className="pb-4 pt-1 text-xs text-gray-400">
              {new Date().toISOString().slice(0, 10)}
            </div>
            */}
            <div className="pb-3 break-words pt-4">
              {ReactHtmlParser(DOMPurify.sanitize(review.text))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AnalisesCard;
