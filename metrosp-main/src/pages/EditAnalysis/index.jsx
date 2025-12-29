import { useCallback, useEffect, useState } from "react";
import { EditModuleInput } from "../../components/index";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./EditAnalysis.module.css";
import { getReview, updateReview } from "../../service/review";

const EditAnalysis = () => {
  const [value, setValue] = useState(" ");
  const navigate = useNavigate();
  const { analiseId } = useParams();

  useEffect(() => {
    async function getReviewApi() {
      const response = await getReview(analiseId);
      if (response) {
        setValue(response.text);
      }
    }
    getReviewApi();
  }, [analiseId]);

  const handleSubmit = useCallback(
    async (editor) => {
      let analise = null;

      if (editor) {
        const { content } = editor;
        analise = await updateReview({
          reviewId: analiseId,
          text: content,
        });
      }

      if (analise?.status == 200) {
        toast.success("Análise editada com sucesso!", {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 1000,
          onClose() {
            navigate(-1);
          },
        });
      } else {
        toast.error("Ocorreu um error na edição da análise!", {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 3000,
        });
      }
    },
    [analiseId, navigate]
  );

  return (
    <div className={styles["editor-wrap"]}>
      <div>
        <Link to={-1}>
          <button className={`br-button secondary ${styles["sair-button"]}`}>
            <FontAwesomeIcon icon={faArrowLeft} /> Sair da edição
          </button>
        </Link>
      </div>

      <EditModuleInput
        plainValue={value}
        onSubmit={handleSubmit}
        submitTitle="Salvar Análise"
      />
    </div>
  );
};

export default EditAnalysis;
