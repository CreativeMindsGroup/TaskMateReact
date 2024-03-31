import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useFormik } from "formik";
import Styles from "../CardList.module.css";

function TextEditorComment(props) {
  const [value, setValue] = useState();

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
    ["link", "image", "video", "formula"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];
  const module = {
    toolbar: toolbarOptions,
  };

  const queryClient = useQueryClient();

  const commentFormik = useFormik({
    initialValues: {
      Message: value ? value : "",
      AppUserId: props.AppUserId ? props.AppUserId : "",
      CardId: props.CardId ? props.CardId : "",
    },
    onSubmit: async (values) => {
      const formData = new FormData();

      formData.append("Message", value ? value : "");
      formData.append("AppUserId", props.AppUserId ? props.AppUserId : "");
      formData.append("CardId", props.CardId ? props.CardId : "");

      try {
        const response = await axios.post(
          "https://localhost:7101/api/Comments",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 201) {
          props.onCommentSubmitted();
          queryClient.invalidateQueries(["CardInCustomFields"]);
          queryClient.invalidateQueries(["BoardUserActivity"]);
          queryClient.invalidateQueries(["CardInAllComments"]);
        }
      } catch (error) {}
    },
  });

  return (
    <div>
      <ReactQuill
        style={{ fontSize: "20px", color: "white" }}
        modules={module}
        theme="snow"
        value={value}
        onChange={setValue}
      />
      <button
        onClick={commentFormik.submitForm}
        className={Styles.TextEditorButton}
      >
        Save
      </button>
    </div>
  );
}

export default TextEditorComment;
