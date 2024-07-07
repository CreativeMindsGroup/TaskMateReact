import React, { useEffect, useState } from "react";
import Styles from "./RegisterPage.module.css";
import {
  Grid,
  GridItem,
  CircularProgress,
  ChakraProvider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import AppImage from "../../Images/user-add-icon---shine-set-add-new-user-add-user-30 (1).png";
import { useFormik } from "formik";
import * as Yup from 'yup'; // Import Yup for validation
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("Member");
  const [modalShow, setModalShow] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const apiUrl = process.env.REACT_APP_API_HOST;
  const navigate = useNavigate()
  const validationSchema = Yup.object({
    Email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    Password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
      Password: Yup.string()
      .oneOf([Yup.ref('Password')], 'Passwords must match')
      .required('Confirm Password is required'),
  });
  const [data, setData] = useState({ Email: "", Password: "" });
  const formik = useFormik({
    initialValues: {
      Email: "",
      Password: "",
      ConfirmPassword: "",
    },
    validationSchema: validationSchema, // Include validation schema here
    onSubmit: async (values) => {
        const { Email, Password } = values; // Extract email and password from form values
        setData({ Email, Password }); // Update the data state with email and password

      try {
        const response = await axios.post(
          "https://localhost:7101/api/Auth/register",
          data,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          formik.resetForm()
          toast.success("Registered!")
          setTimeout(() => {
            navigate('/signin')
          }, 500);
        }
      } catch (error) {
        toast.error("Invalid register!")
        setIsError(true);
      }
    },
  }); 
  const RemoveUserFromWorkspaceformik = useFormik({
    initialValues: {
      Email: "",
      Password: "",
      ConfirmPassword: "",
    },
    validationSchema: validationSchema, // Include validation schema here
    onSubmit: async (values) => {
        const { Email, Password } = values; // Extract email and password from form values
        setData({ Email, Password }); // Update the data state with email and password

      try {
        const response = await axios.post(
          `${apiUrl}/api/Auth/register`,
          data,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          formik.resetForm()
          toast.success("Registered!")
          setTimeout(() => {
            navigate('/signin')
          }, 500);
        }
      } catch (error) {
        toast.error("Invalid register!")
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
      <ToastContainer/>
      <Modal.Body
        className="p-0 d-flex flex-column align-items-center justify-content-center"
        id="contained-modal-title-vcenter"
        style={{ backgroundColor: "#1d2125" }}
      >
        <div className="py-5 col-8 col-lg-10 d-flex flex-column">
          <Modal.Title className="fw-bold" id="contained-modal-title-vcenter">
            <h1 style={{ color: "#579dff" }} className="text-center">
              <FontAwesomeIcon className={"me-2"} icon={faCircleCheck} />
              Task Mate
            </h1>
          </Modal.Title>
          <p className="text-center my-1 fw-bold">Sign up to continue</p>
          <Form className="mt-3">
            <Form.Group className="mb-1" controlId="create-workspace-name">
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
            <Form.Group className="mb-1" controlId="create-workspace-name">
              <Form.Control
                className="mb-2 p-3"
                type="password"
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="Password"
                value={formik.values.Password}
              />
              {formik.touched.Password && formik.errors.Password ? (
                <div className="error-message">{formik.errors.Password}</div>
              ) : null}
            </Form.Group>
            <Form.Group className="mb-1" controlId="create-workspace-name">
              <Form.Control
                className="mb-2 p-3"
                type="password"
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="ConfirmPassword"
                value={formik.values.ConfirmPassword}
              />
              {formik.touched.ConfirmPassword && formik.errors.ConfirmPassword ? (
                <div className="error-message">{formik.errors.ConfirmPassword}</div>
              ) : null}
            </Form.Group>
          </Form>
          <span className="w-100">
            <Button
              onClick={formik.handleSubmit}
              type="Submit"
              className="container create-workspace-submit w-100 m-0"
              variant="primary"
              size="lg"
            >
              Sign Up
            </Button>
          </span>
          <div style={{cursor:"pointer",userSelect:"none"}}  className="mt-3 text-center">
            <a onClick={()=>navigate("/SignIn")} className="btn-anchor">
              Already have an account ?
            </a>
          </div>
          <div
            style={{ fontSize: "13px", paddingTop: "5px" }}
            className={Styles.userCreateRules}
          >
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
