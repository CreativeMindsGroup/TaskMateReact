import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Style from "./InviteBoard.module.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getByToken } from "../../Service/TokenService";
import { useQuery } from "react-query";
import { useFormik } from "formik";

export default function InviteBoard() {
  const [loginAccess, setLoginAccess] = useState(false);
  const navigate = useNavigate();
  const { generateGuidId, linkSelectedWorkspaceId, linkBoardId, userId } =
    useParams();
  const [tokenIsActive, setTokenIsActive] = useState(false);

  const { data: ByToken } = useQuery(["ByToken", generateGuidId], () =>
    getByToken(generateGuidId)
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 240000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ByToken && ByToken.data) {
      setTokenIsActive(ByToken.data);
    }
  }, [ByToken]);

  const [error, setError] = useState(null);
  const Formik = useFormik({
    initialValues: {
      AdminId: userId ? userId : "",
      BoardId: linkBoardId ? linkBoardId : "",
      WorkspaceId: linkSelectedWorkspaceId ? linkSelectedWorkspaceId : "",
      UsernameOrEmail: "",
      Password: "",
    },
    onSubmit: async (values) => {
      const formData = new FormData();

      formData.append("AdminId", values.AdminId);
      formData.append("WorkspaceId", values.WorkspaceId);
      formData.append("BoardId", values.BoardId);
      formData.append("UsernameOrEmail", values.UsernameOrEmail);
      formData.append("Password", values.Password);

      try {
        const response = await axios.post(
          "https://localhost:7101/api/Boards/ShareLinkBoardUser",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 201) {
          navigate("/SignIn");
        }
      } catch (error) {
        setError("Invalid Login!");
      }
    },
  });

  return (
    <div className={Style.mainWrapper}>
      {tokenIsActive ? (
        <Col
          sm={6}
          className="d-flex align-items-center justify-content-center flex-column"
        >
          <div className="d-flex justify-content-center">
            <h5 className="fw-bold">Nurlan Nuruzade</h5>
            <h5 className="fw-normal mx-2">invited you to</h5>
            <h5 className="fw-bold">qweezSwe!</h5>
          </div>
          <p className="mt-1">
            Looks like you need to be logged into your TaskMate account to join
            this workspace.
          </p>
          <div className="col-6 d-flex justify-content-center mt-0">
            <Button
              onClick={() => setLoginAccess((prev) => !prev)}
              className="default-submit w-75 ms-2 fw-bold mt-1"
            >
              {loginAccess ? "To Reject" : "Log in"}
            </Button>
          </div>
          <a className="mt-1 btn-anchor" href="/">
            Learn more about TaskMate
          </a>
          {loginAccess && (
            <Col
              sm={6}
              className="d-flex align-items-center justify-content-center flex-column"
            >
              <form onSubmit={Formik.handleSubmit} className={Style.formLogin}>
                <h3>Login Here</h3>

                <label htmlFor="username">Username</label>

                <input
                  type="text"
                  name="UsernameOrEmail"
                  value={Formik.values.UsernameOrEmail}
                  onChange={Formik.handleChange}
                  placeholder="Email or Username"
                  id="username"
                />

                <label htmlFor="password">Password</label>
                <input
                  name="Password"
                  value={Formik.values.Password}
                  onChange={Formik.handleChange}
                  type="password"
                  placeholder="Password"
                  id="password"
                />
                <p
                  style={{
                    display: error !== null ? "block" : "none",
                    fontSize: "16px",
                    color: "red",
                  }}
                >
                  {error}
                </p>
                <button>Log In</button>
              </form>
            </Col>
          )}
        </Col>
      ) : (
        <div
          style={{ color: "red", fontSize: "34px", fontFamily: "monospace" }}
        >
          Token has expired
        </div>
      )}
    </div>
  );
}
