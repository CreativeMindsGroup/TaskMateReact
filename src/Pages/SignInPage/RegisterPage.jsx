import React, { useState } from "react";
import Styles from "./RegisterPage.module.css";
import {
  CircularProgress,
  ChakraProvider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Container,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from 'yup'; // Import Yup for validation
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";
import { httpClient } from "../../Utils/HttpClient";

export default function RegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validationSchema = Yup.object({
    Email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    Password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref('Password')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      Email: "",
      Password: "",
      ConfirmPassword: "",
    },
    validationSchema: validationSchema, // Include validation schema here
    onSubmit: async (values) => {
      const { Email, Password } = values; // Extract email and password from form values
      const data = { Email, Password }; // Update the data state with email and password
      try {
        const response = await httpClient.post(
          "/api/Auth/register",
          data,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          formik.resetForm();
          toast.success("Registered!");
          setTimeout(() => {
            navigate('/signin');
          }, 500);
        }
      } catch (error) {
        toast.error("Invalid register!");
        setIsError(true);
      }
    },
  });

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
      <ToastContainer />
      <Modal.Body
        className="p-0 d-flex flex-column align-items-center justify-content-center"
        id="contained-modal-title-vcenter"
        style={{ backgroundColor: "#1d2125" }}
      >
        <div className="py-5 col-8 col-lg-10 d-flex flex-column">
          <Modal.Title className="fw-bold" id="contained-modal-title-vcenter">
            <h1 style={{ color: "#579dff" }} className="text-center">
              <FontAwesomeIcon className={"me-2"} icon={faCircleCheck} />
              Task Arua
            </h1>
          </Modal.Title>
          <p className="text-center my-1 fw-bold">Sign up to continue</p>
          <Form className="mt-3" onSubmit={formik.handleSubmit}>
            <Form.Group className="mb-1" controlId="register-email">
              <Form.Control
                className="mb-2 p-3"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type="text"
                placeholder="Email"
                name="Email"
                value={formik.values.Email}
              />
              {formik.touched.Email && formik.errors.Email ? (
                <div className="error-message">{formik.errors.Email}</div>
              ) : null}
            </Form.Group>
            <Form.Group className="mb-1" controlId="register-password" style={{ position: "relative" }}>
              <Form.Control
                className="mb-2 p-3"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="Password"
                value={formik.values.Password}
                style={{ paddingRight: "2.5rem" }} // Add padding to the right for the icon
              />
              <FontAwesomeIcon
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                icon={showPassword ? faEyeSlash : faEye}
                onClick={toggleShowPassword}
                className="password-toggle-icon"
              />
              {formik.touched.Password && formik.errors.Password ? (
                <div className="error-message">{formik.errors.Password}</div>
              ) : null}
            </Form.Group>
            <Form.Group className="mb-1" controlId="register-confirm-password" style={{ position: "relative" }}>
              <Form.Control
                className="mb-2 p-3"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="ConfirmPassword"
                value={formik.values.ConfirmPassword}
                style={{ paddingRight: "2.5rem" }} // Add padding to the right for the icon
              />
              <FontAwesomeIcon
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                icon={showPassword ? faEyeSlash : faEye}
                onClick={toggleShowPassword}
                className="password-toggle-icon"
              />
              {formik.touched.ConfirmPassword && formik.errors.ConfirmPassword ? (
                <div className="error-message">{formik.errors.ConfirmPassword}</div>
              ) : null}
            </Form.Group>
            <Button
              type="submit"
              className="container create-workspace-submit w-100 m-0"
              variant="primary"
              size="lg"
            >
              Sign Up
            </Button>
          </Form>
          <div style={{ cursor: "pointer", userSelect: "none" }} className="mt-3 text-center">
            <a onClick={() => navigate("/SignIn")} className="btn-anchor">
              Already have an account?
            </a>
          </div>
          <div
            style={{ fontSize: "13px", paddingTop: "5px" }}
            className={Styles.userCreateRules}
          ></div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
