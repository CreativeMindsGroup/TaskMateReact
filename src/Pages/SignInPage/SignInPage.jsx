import React, { useEffect, useState } from "react";
import Styles from "./SignInPage.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login } from "../../Service/AuthService";
import { loginAction } from "../../Redux/Slices/AuthSlice";
import { useDispatch } from "react-redux";
import { useMutation } from "react-query";
import { useNavigate } from "react-router";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { CircularProgress } from "@chakra-ui/react";
import jwtDecode from "jwt-decode";
import { setUserCreditinals } from "../../Redux/Slices/UserCreditionals";

export default function SignInPage() {
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    usernameOrEmail: Yup.string().required("Required").max(255),
    password: Yup.string().required("Required").max(100),
  });

  const LoginFormik = useFormik({
    initialValues: {
      usernameOrEmail: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      LoginMutate(values);
    },
  });

  const { mutate: LoginMutate, isLoading: Loginloading } = useMutation(
    (values) => login(values),
    {
      onSuccess: (resp) => {
        dispatch(loginAction(resp));

        const decodedToken = jwtDecode(resp.data.token);
        const userId = decodedToken.UserId;
        const email =  decodedToken.Email;
        const emailConfirmed = decodedToken.EmailConfirmed;
        const role = decodedToken.Role;
        dispatch(setUserCreditinals({
          userId,
          email,
          emailConfirmed: emailConfirmed === "True", // Convert to boolean
          role,
        }));

        navigate("/");
      },
      onError: (error) => {
        setLoginError("Invalid Login.");
      },
    }
  );

  const handleInputChange = (e) => {
    LoginFormik.handleChange(e);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => {
        setLoginError(null);
      }, 1500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loginError]);

  return (
    <Modal
      show={true}
      fullscreen="lg-down"
      aria-labelledby="contained-modal-title-vcenter"
      className="sign-in-modal"
      centered
      backdrop="static"
      backdropClassName={Styles.signInModalBackdrop}
    >
      <Modal.Body
        className="p-0 d-flex flex-column align-items-center justify-content-center"
        id="contained-modal-title-vcenter"
        style={{ backgroundColor: "#1d2125" }}
      >
        <div className="py-5 col-9 col-lg-10 d-flex flex-column">
          <Modal.Title className="fw-bold" id="contained-modal-title-vcenter">
            <h1 style={{ color: "#579dff" }} className="text-center">
              <FontAwesomeIcon className={"me-2"} icon={faCircleCheck} />
              Task Mate
            </h1>
          </Modal.Title>
          <p className="text-center my-4 fw-bold">Log in to continue</p>
          <Form className="mt-2" onSubmit={LoginFormik.handleSubmit}>
            <Form.Group className="mb-2 position-relative" controlId="login-usernameOrEmail">
              <Form.Control
                type="text"
                placeholder="username or email"
                name="usernameOrEmail"
                onChange={handleInputChange}
                onBlur={LoginFormik.handleBlur}
                value={LoginFormik.values.usernameOrEmail}
                isInvalid={!!LoginFormik.errors.usernameOrEmail && LoginFormik.touched.usernameOrEmail}
                className={Styles.Input}
              />
              <Form.Control.Feedback type="invalid">
                {LoginFormik.errors.usernameOrEmail}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2 position-relative" controlId="login-password">
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  onChange={handleInputChange}
                  onBlur={LoginFormik.handleBlur}
                  value={LoginFormik.values.password}
                  isInvalid={!!LoginFormik.errors.password && LoginFormik.touched.password}
                  className={Styles.Input}
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={toggleShowPassword}
                  className={Styles.passwordToggleIcon}
                  style={{
                    position: "absolute",
                    inset: LoginFormik.errors.password && LoginFormik.touched.password ? "23% 86%" : "35% 92%",
                    cursor: "pointer",
                    color: "#007bff"
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {LoginFormik.errors.password}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
            <Button
              type="submit"
              className="container create-workspace-submit w-100 m-0"
              variant="primary"
              size="lg"
              disabled={Loginloading}
            >
              {Loginloading ? <CircularProgress isIndeterminate size="24px" color="#579dff" /> : "Log in"}
            </Button>
          </Form>
          {loginError && <p style={{ color: "red" }}>{loginError}</p>}
          <div tyle={{cursor:"pointer",userSelect:"none"}}  onClick={()=>navigate("/Register")}  className="mt-1 text-center">
            <a  className="btn-anchor" >
              Create an account
            </a>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
