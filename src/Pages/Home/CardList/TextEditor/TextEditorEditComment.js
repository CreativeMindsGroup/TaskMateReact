import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useFormik } from "formik";
import Styles from "../CardList.module.css";

function TextEditorEditComment(props) {
  const [value, setValue] = useState(props.Message ? props.Message : "");

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
      Id: props.CommentId ? props.CommentId : "",
      Message: props.Message ? props.Message : "",
      AppUserId: props.AppUserId ? props.AppUserId : "",
      CardId: props.CardId ? props.CardId : "",
    },
    onSubmit: async (values) => {
      const formData = new FormData();

      formData.append("Id", props.CommentId ? props.CommentId : "");
      formData.append("Message", value ? value : "");
      formData.append("AppUserId", props.AppUserId ? props.AppUserId : "");
      formData.append("CardId", props.CardId ? props.CardId : "");

      try {
        const response = await axios.put(
          "https://localhost:7101/api/Comments",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          props.onEditCommentSubmitted();
          queryClient.invalidateQueries(["CardInCustomFields"]);
          queryClient.invalidateQueries(["BoardUserActivity"]);
          queryClient.invalidateQueries(["CardInAllComments"]);
          queryClient.invalidateQueries(["CardInActivity"]);
        }
      } catch (error) {
        props.onEditCommentSubmitted();
      }
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
      <button
        style={{ marginLeft: "10px" }}
        onClick={() => props.onEditCommentSubmitted()}
        className={Styles.TextEditorButton}
      >
        Cancel
      </button>
    </div>
  );
}

export default TextEditorEditComment;
