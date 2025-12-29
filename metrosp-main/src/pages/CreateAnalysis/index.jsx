import { useCallback, useEffect } from "react";
import { EditModuleInput } from "../../components/index";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateAnalysis.module.css";
import { postReview } from "../../service/review";

const CreateAnalysis = () => {
  const navigate = useNavigate();
  const { analiseId } = useParams();

  useEffect(() => {}, []);

  const handleSubmit = useCallback(
    async (editor) => {
      let modulo = null;
      let modulo2 = null;

      if (editor) {
        const { content } = editor;
        modulo = await postReview({
          text: content,
          analysisId: analiseId,
        });
      }

      if (modulo) {
        toast.success("Análise criado com sucesso!", {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 1000,
          onClose() {
            navigate(-1);
          },
        });
      } else {
        toast.error("Ocorreu um error na criação da análise!", {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 3000,
        });
      }
    },
    [navigate, analiseId]
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
        initialValue=""
        onSubmit={handleSubmit}
        submitTitle="Criar Análise"
      />
    </div>
  );
};

export default CreateAnalysis;
