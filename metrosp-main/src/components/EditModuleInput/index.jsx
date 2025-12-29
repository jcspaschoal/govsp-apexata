import "@toast-ui/editor/dist/toastui-editor.css";
import styles from "./EditModuleInput.module.css";
import { Editor } from "@toast-ui/react-editor";
import { useRef, useMemo, useEffect } from "react";
import "./OverrideToastStyles.css";

// eslint-disable-next-line react/prop-types
const EditModuleInput = ({
  onSubmit,
  initialValue,
  plainValue,
  submitTitle,
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const contentHTML = plainValue;
    const editor = editorRef.current.getInstance();
    editor.setHTML(contentHTML);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainValue]);

  const saveProgress = useMemo(() => {
    const getEditorContent = () => {
      const editor = editorRef.current.getInstance();
      const contentAsHTML = editor.getHTML();

      return {
        content: contentAsHTML,
      };
    };

    const button = document.createElement("button");
    button.innerHTML = submitTitle;
    button.classList.add(styles["save-progress"]);
    button.addEventListener("click", () => onSubmit(getEditorContent()));
    return {
      name: "save",
      tooltip: submitTitle,
      el: button,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customToolbarItems = useMemo(
    () => [
      [saveProgress],
      ["bold", "italic", "link", "table"],
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    []
  );

  return (
    <div className={styles["editar-modulo"]}>
      <Editor
        id="toast-editor-component-identifier"
        height="800px"
        initialEditType="wysiwyg"
        usageStatistics={false}
        hideModeSwitch={true}
        ref={editorRef}
        toolbarItems={customToolbarItems}
      />
    </div>
  );
};

export default EditModuleInput;
