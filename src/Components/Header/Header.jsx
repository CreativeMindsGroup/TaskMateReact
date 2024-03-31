import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBarsProgress,
  faUserGroup,
  faLink,
  faEllipsis,
  faChartLine,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  CreateWorkSpace,
  GetAllWorkspaces,
} from "../../Service/WorkSpaceService";
import { CreateBoard } from "../../Service/BoardService";
import { checkIsAdmin } from "../../Service/AuthService";
import SliderBarMenu from "../SideBarMenu/SideBarMenu";
import { logoutAction } from "../../Redux/Slices/AuthSlice";
import { faChevronDown, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuList, MenuItem, Flex } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";
import Styles from "./Header.module.css";
import {
  incrementRefresh,
  setData,
} from "../../Redux/Slices/WorkspaceAndBorderSlice";
import {
  AlertIcon,
  FormLabel,
  Stack,
  useDisclosure,
  Alert,
} from "@chakra-ui/react";
import { GetUserById } from "../../Service/UserService";
import { getUserAllNotifications } from "../../Service/NotificationService";
import axios from "axios";

export default function Header() {
  const dispatch = useDispatch();
  const [createBoardSlide2, setCreateBoardSlide2] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [notificationModalShow, setNotificationModalShow] = useState(false);
  const [modalShow2, setWorkspaceModal1] = useState(true);
  const [modalShow3, setWorkspaceModal2] = useState(false);
  const [inputResult, setInputResult] = useState(false);
  const { token, email } = useSelector((x) => x.auth);
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken
    ? decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ]
    : null;
  const doNotClose = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };
  const validationSchema = yup.object({
    Title: yup.string().required("Title is required").min(3).max(64),
    Description: yup.string().max(256),
  });
  dispatch(setData({ userId: userId }));
  const resetFormValues = () => {
    CreateWorkSpaceFormik.resetForm();
  };

  //--------Notification---------//
  const { data: AllNotification } = useQuery(
    ["GetAllNotifications", userId],
    () => getUserAllNotifications(userId)
  );

  const handleNotification = () => {
    setNotificationModalShow(!notificationModalShow);
    if (AllNotification?.data?.length > 0) {
      axios
        .put(
          `https://localhost:7101/api/Notifactions/SeenUserNotifaction?AppUserId=${userId}`
        )
        .then((response) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["GetAllNotifications"]);
          }, 30000);
        })
        .catch((error) => {});
    }
  };
  // queryClient.invalidateQueries(["GetAllNotifications"]);
  //--------Notification---------//

  const handleContinue = () => {
    setWorkspaceModal1(false);
    setWorkspaceModal2(true);
  };

  const CreateWorkSpaceFormik = useFormik({
    initialValues: {
      Title: "",
      AppUserId: userId,
      Description: "",
    },
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      if (values.Title === null || values.Title === "") {
      } else {
        CreateWorkSpaceMutate(values);
        dispatch(incrementRefresh());
        setShowAlert(true);
        const timer = setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["GetAllworkspaces"]);
      queryClient.invalidateQueries(["GetBoartsInWorkspace"]);
    },
  });

  const { mutate: CreateWorkSpaceMutate, isLoading: Loginloading } =
    useMutation((values) => CreateWorkSpace(values), {
      onSuccess: () => {
        queryClient.invalidateQueries("GetAllworkspaces");
      },
    });

  const { data: ALlworkspaces } = useQuery(["GetAllworkspaces", userId], () =>
    GetAllWorkspaces(userId)
  );
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries("GetAllworkspaces");
  }, [userId]);

  useEffect(() => {
    if (modalShow) {
      resetFormValues();
    }
  }, [modalShow]);

  const [selectedValue, setSelectedValue] = useState(0);

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const CreateBoardFomik = useFormik({
    //Bunu duzelt anca public yaranir.
    initialValues: {
      title: "",
      workspaceId: "",
      appUserId: userId,
      BoardAccessibility: selectedValue,
    },
    onSubmit: (values) => {
      if (values.workspaceId === "" || values.title === "") {
      } else {
        CreateBoardMutation(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("GetBoartsInWorkspace");
    },
  });
  const { mutate: CreateBoardMutation } = useMutation(
    (values) => CreateBoard(values),
    {
      onSuccess: (values) => {
        dispatch(incrementRefresh());
        queryClient.invalidateQueries("Boards");
        queryClient.invalidateQueries("GetBoartsInWorkspace");
        setShowAlert2(true);
        const timer = setTimeout(() => {
          setShowAlert2(false);
        }, 2000);
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );
  const handeCreateBoard = () => {
    setCreateBoardSlide2(!createBoardSlide2);
    queryClient.invalidateQueries("GetAllworkspaces");
  };

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  const handleWorkspaceSelect = (Id) => {
    setSelectedWorkspaceId(Id);
    dispatch(setData({ workspaceId: Id }));
  };
  const { data: Data } = useQuery(["UserData", userId], () =>
    GetUserById(userId)
  );
  const { data: UserData } = useQuery(["UserData", userId], () =>
    GetUserById(userId)
  );
  const [showAlert, setShowAlert] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);

  const { data: isAdmin } = useQuery(
    ["CheckIsAdmin", userId ? userId : undefined],
    () => checkIsAdmin(userId),
    { enabled: !!userId }
  );

  return (
    <Navbar className="navbar-custom" bg="dark" expand="sm">
      <ChakraProvider>
        <Stack zIndex={1} top={0} right={0} position={"absolute"} spacing={3}>
          {showAlert && (
            <Alert status="success" variant="top-accent">
              <AlertIcon />
              Workspace is Succesfully Created!
            </Alert>
          )}
        </Stack>
        <Stack zIndex={1} top={0} right={0} position={"absolute"} spacing={3}>
          {showAlert2 && (
            <Alert status="success" variant="top-accent">
              <AlertIcon />
              Board is Succesfully Created!
            </Alert>
          )}
        </Stack>
      </ChakraProvider>
      {token ? (
        <Container fluid>
          <Navbar.Brand
            className="d-flex align-items-center"
            style={{ color: "white" }}
            href="/"
          >
            <svg
              className="me-2"
              width="24"
              height="24"
              role="presentation"
              focusable="false"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 5C4 4.44772 4.44772 4 5 4H7C7.55228 4 8 4.44772 8 5V7C8 7.55228 7.55228 8 7 8H5C4.44772 8 4 7.55228 4 7V5ZM4 11C4 10.4477 4.44772 10 5 10H7C7.55228 10 8 10.4477 8 11V13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13V11ZM11 4C10.4477 4 10 4.44772 10 5V7C10 7.55228 10.4477 8 11 8H13C13.5523 8 14 7.55228 14 7V5C14 4.44772 13.5523 4 13 4H11ZM10 11C10 10.4477 10.4477 10 11 10H13C13.5523 10 14 10.4477 14 11V13C14 13.5523 13.5523 14 13 14H11C10.4477 14 10 13.5523 10 13V11ZM17 4C16.4477 4 16 4.44772 16 5V7C16 7.55228 16.4477 8 17 8H19C19.5523 8 20 7.55228 20 7V5C20 4.44772 19.5523 4 19 4H17ZM16 11C16 10.4477 16.4477 10 17 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H17C16.4477 14 16 13.5523 16 13V11ZM5 16C4.44772 16 4 16.4477 4 17V19C4 19.5523 4.44772 20 5 20H7C7.55228 20 8 19.5523 8 19V17C8 16.4477 7.55228 16 7 16H5ZM10 17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V19C14 19.5523 13.5523 20 13 20H11C10.4477 20 10 19.5523 10 19V17ZM17 16C16.4477 16 16 16.4477 16 17V19C16 19.5523 16.4477 20 17 20H19C19.5523 20 20 19.5523 20 19V17C20 16.4477 19.5523 16 19 16H17Z"
                fill="currentColor"
              ></path>
            </svg>{" "}
            TaskMate
          </Navbar.Brand>
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <NavDropdown
              className="navbar-workspaces"
              title="Workspaces"
              id="navbarScrollingDropdown"
            >
              <Card.Text className="ms-3 my-2 container-fluid">
                {" "}
                Your Workspaces{" "}
              </Card.Text>
              {ALlworkspaces?.data?.map((workspace, index) => (
                <NavDropdown.Item
                  key={index}
                  onClick={() => handleWorkspaceSelect(workspace.id)}
                >
                  <Container className="navbar-workspace-link">
                    <Row className="px-1 py-3 d-flex align-items-center">
                      <Col lg={3}>
                        <Image
                          className="workspace-pic"
                          src={`https://placehold.co/512x512/d9e3da/1d2125?text=${workspace.title.slice(
                            0,
                            1
                          )}`}
                          rounded
                        />
                      </Col>
                      <Col className="p-0">{workspace.title}</Col>
                    </Row>
                  </Container>
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <DropdownButton
              className="create-dropdown ms-3"
              id="dropdown-basic-button"
              title="Create"
            >
              {createBoardSlide2 ? (
                <div>
                  <Dropdown.Item
                    className="create-dropdown-item"
                    onClick={doNotClose}
                  >
                    <Card
                      bg={"dark"}
                      text={"white"}
                      style={{
                        width: "20rem",
                        border: "none",
                        textWrap: "wrap",
                      }}
                      className="mb-2"
                    >
                      <div className="container-fluid position-relative mt-2">
                        <Card.Body className="create-button-option p-0 py-3 px-1 position-relative">
                          <Card.Subtitle className="mb-4 d-flex align-items-center justify-content-between">
                            {" "}
                            Create Board{" "}
                            <Button
                              className="btn-close"
                              onClick={() => setCreateBoardSlide2(false)}
                            ></Button>
                          </Card.Subtitle>
                          <Card.Text>
                            <Form>
                              <Form.Group
                                className="mb-3"
                                controlId="create-workspace-name"
                              >
                                <Form.Label className="fw-bold">
                                  Board Title{" "}
                                  <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                  autoFocus
                                  type="text"
                                  placeholder="Task Mate"
                                  onChange={CreateBoardFomik.handleChange}
                                  name="title"
                                />
                                <p className="small mt-2">
                                  👋 Board title is required.
                                </p>
                              </Form.Group>
                              <div className="mt-3">
                                <Form.Group
                                  className="mb-3"
                                  controlId="create-workspace-type"
                                >
                                  <Form.Label className="fw-bold">
                                    Workspace
                                  </Form.Label>
                                  <Form.Select
                                    onChange={CreateBoardFomik.handleChange}
                                    name="workspaceId"
                                    aria-label="Default select example"
                                  >
                                    <option value="">Select a Workspace</option>
                                    <option
                                      value={ALlworkspaces?.data?.[0]?.id}
                                    >
                                      {ALlworkspaces?.data?.[0]?.title}
                                    </option>
                                    {ALlworkspaces?.data
                                      ?.slice(1)
                                      .map((workspace, index) => (
                                        <option
                                          key={index}
                                          value={workspace.id}
                                        >
                                          {workspace.title}
                                        </option>
                                      ))}
                                  </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="create-workspace-type">
                                  <Form.Label className="fw-bold">
                                    Visibility
                                  </Form.Label>
                                  <Form.Select
                                    value={selectedValue}
                                    onChange={handleSelectChange}
                                    aria-label="Default select example"
                                  >
                                    <option value="0">Public</option>
                                    <option value="1">Private</option>
                                  </Form.Select>
                                  <Button
                                    type="submit"
                                    onClick={() => {
                                      CreateBoardFomik.handleSubmit();
                                      setCreateBoardSlide2(false);
                                    }}
                                    className="mt-4 mb=0"
                                  >
                                    Done
                                  </Button>
                                </Form.Group>
                              </div>
                            </Form>
                          </Card.Text>
                        </Card.Body>
                      </div>
                    </Card>
                  </Dropdown.Item>
                </div>
              ) : (
                <div>
                  <Dropdown.Item onClick={doNotClose} className="p-0">
                    <Card
                      bg={"dark"}
                      text={"white"}
                      style={{
                        width: "20rem",
                        border: "none",
                        textWrap: "wrap",
                      }}
                      className="mb-2"
                    >
                      <div className="container-fluid position-relative create-button-option-wrapper mt-2">
                        <Card.Body
                          onClick={handeCreateBoard}
                          className="create-button-option p-0 py-3 px-1 position-relative"
                        >
                          <Card.Subtitle className="mb-2">
                            <FontAwesomeIcon
                              className="me-1"
                              icon={faBarsProgress}
                            />{" "}
                            Create Board{" "}
                          </Card.Subtitle>
                          <Card.Text>
                            A board is made up of cards ordered on lists. Use it
                            to manage projects, track information, or organize
                            anything.
                          </Card.Text>
                        </Card.Body>
                      </div>
                    </Card>
                  </Dropdown.Item>
                  {Data?.data?.role === "GlobalAdmin" ||
                  Data?.data?.role === "Admin" ? (
                    <>
                      <Dropdown.Item className="p-0">
                        <Card
                          bg={"dark"}
                          text={"white"}
                          style={{
                            width: "20rem",
                            border: "none",
                            textWrap: "wrap",
                          }}
                          className="mb-2"
                        >
                          <div className="container-fluid create-button-option-wrapper">
                            <Card.Body
                              onClick={() => setModalShow(true)}
                              className="create-button-option p-0 py-3 px-1"
                            >
                              <Card.Subtitle className="mb-2">
                                <FontAwesomeIcon
                                  className="me-1"
                                  icon={faUserGroup}
                                />{" "}
                                Create Workspace{" "}
                              </Card.Subtitle>
                              <Card.Text>
                                A Workspace is a group of boards and people. Use
                                it to organize your company, side hustle,
                                family, or friends.
                              </Card.Text>
                            </Card.Body>
                          </div>
                        </Card>
                      </Dropdown.Item>
                    </>
                  ) : null}
                </div>
              )}
            </DropdownButton>
          </Nav>
          {isAdmin?.data && isAdmin.data === true && (
            <p
              style={{
                color: "whitesmoke",
                padding: "10px",
                paddingTop: "24px",
                paddingRight: "23px",
                fontFamily: "sans-serif",
              }}
            >
              <a href="/members">Share Workspace</a>
            </p>
          )}
          <Form className="d-flex input-custom">
            <Form.Control
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
          </Form>
          <Row className="ms-1 d-flex align-items-center">
            <Col className="col-2">
              <Button
                onClick={() => handleNotification()}
                className="custom-notification"
              >
                <span
                  style={{
                    display:
                      AllNotification?.data?.length > 0 ? "flex" : "none",
                    position: "absolute",
                    marginTop: "0px",
                    zIndex: 2,
                    color: "white",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "red",
                  }}
                >
                  {AllNotification?.data && AllNotification.data.length}
                </span>
                <FontAwesomeIcon
                  icon={faBell}
                  fontSize={"30px"}
                  style={{
                    color: "#cacaca",
                    marginTop: "5px",
                    transform: "rotate(45deg)",
                  }}
                />{" "}
              </Button>
            </Col>
            <Col>
              <FontAwesomeIcon icon={faEllipsis} />
              {/* <Image
                className="profile-pic"
                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQcBR70-dRGg6OCJSvZ2xUzxQRN9F97n2CX2iekuDPjThLQQkt6"
                roundedCircle
              /> */}
              {email && (
                <ChakraProvider>
                  <Menu>
                    <MenuButton
                      as={Button}
                      righticon={<FontAwesomeIcon icon={faChevronDown} />}
                      className={Styles.shareButton}
                    >
                      <Flex alignItems={"center "}>
                        <Image
                          className="profile-pic me-2"
                          src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQcBR70-dRGg6OCJSvZ2xUzxQRN9F97n2CX2iekuDPjThLQQkt6"
                          rounded
                        />
                        <p className="m-0" style={{ fontSize: "15px" }}>
                          {email}
                        </p>
                      </Flex>
                    </MenuButton>
                    <MenuList zIndex={10} className={Styles.userAccount}>
                      <MenuItem
                        className="btn btn-primary default-submit mx-2"
                        onClick={() => dispatch(logoutAction())}
                      >
                        {" "}
                        <FontAwesomeIcon
                          className="me-2"
                          icon={faSignOut}
                        />{" "}
                        Sign out
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </ChakraProvider>
              )}
            </Col>
          </Row>
        </Container>
      ) : (
        <Container fluid>
          <Navbar.Brand
            className="d-flex align-items-center"
            style={{ color: "white" }}
            href="/"
          >
            <svg
              className="me-2"
              width="24"
              height="24"
              role="presentation"
              focusable="false"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 5C4 4.44772 4.44772 4 5 4H7C7.55228 4 8 4.44772 8 5V7C8 7.55228 7.55228 8 7 8H5C4.44772 8 4 7.55228 4 7V5ZM4 11C4 10.4477 4.44772 10 5 10H7C7.55228 10 8 10.4477 8 11V13C8 13.5523 7.55228 14 7 14H5C4.44772 14 4 13.5523 4 13V11ZM11 4C10.4477 4 10 4.44772 10 5V7C10 7.55228 10.4477 8 11 8H13C13.5523 8 14 7.55228 14 7V5C14 4.44772 13.5523 4 13 4H11ZM10 11C10 10.4477 10.4477 10 11 10H13C13.5523 10 14 10.4477 14 11V13C14 13.5523 13.5523 14 13 14H11C10.4477 14 10 13.5523 10 13V11ZM17 4C16.4477 4 16 4.44772 16 5V7C16 7.55228 16.4477 8 17 8H19C19.5523 8 20 7.55228 20 7V5C20 4.44772 19.5523 4 19 4H17ZM16 11C16 10.4477 16.4477 10 17 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H17C16.4477 14 16 13.5523 16 13V11ZM5 16C4.44772 16 4 16.4477 4 17V19C4 19.5523 4.44772 20 5 20H7C7.55228 20 8 19.5523 8 19V17C8 16.4477 7.55228 16 7 16H5ZM10 17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V19C14 19.5523 13.5523 20 13 20H11C10.4477 20 10 19.5523 10 19V17ZM17 16C16.4477 16 16 16.4477 16 17V19C16 19.5523 16.4477 20 17 20H19C19.5523 20 20 19.5523 20 19V17C20 16.4477 19.5523 16 19 16H17Z"
                fill="currentColor"
              ></path>
            </svg>{" "}
            TaskMate
          </Navbar.Brand>
        </Container>
      )}

      <div>
        <Modal
          show={modalShow}
          onHide={() => {
            setModalShow(false);
            setTimeout(() => {
              setWorkspaceModal2(false);
              setWorkspaceModal1(true);
            }, 500);
          }}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          className="create-workspace-modal"
          centered
        >
          <Modal.Body
            className="p-0 position-relative"
            id="contained-modal-title-vcenter"
          >
            <Button
              className="create-workspace-close btn-close position-absolute top-0 end-0 mt-5 me-4"
              onClick={() => {
                setModalShow(false);
                setTimeout(() => {
                  setWorkspaceModal2(false);
                  setWorkspaceModal1(true);
                }, 500);
              }}
            ></Button>
            <Row className="p-0 d-flex flex-nowrap">
              {modalShow2 ? (
                <Col lg={6}>
                  <div className="p-5">
                    <Modal.Title
                      className="fw-bold"
                      id="contained-modal-title-vcenter"
                    >
                      Let's build a Workspace
                    </Modal.Title>
                    <p>
                      Boost your productivity by making it easier for everyone
                      to access boards in one location.
                    </p>
                    <Form>
                      <Form.Group
                        className="mb-3"
                        controlId="create-workspace-name"
                      >
                        <Form.Label className="fw-bold">
                          Workspace Name
                        </Form.Label>
                        <Form.Control
                          onChange={CreateWorkSpaceFormik.handleChange}
                          name="Title"
                          type="text"
                          placeholder="Taco's Co."
                        />
                        <p className="small mt-2">
                          This is the name of your company, team or
                          organization.
                        </p>
                      </Form.Group>
                      <Form.Group
                        className="my-3"
                        controlId="create-workspace-desc"
                      >
                        <Form.Label className="fw-bold">
                          Workspace Description
                        </Form.Label>
                        <Form.Control
                          onChange={CreateWorkSpaceFormik.handleChange}
                          name="Description"
                          as="textarea"
                          rows={5}
                        />
                      </Form.Group>
                      {CreateWorkSpaceFormik.errors.Description &&
                        CreateWorkSpaceFormik.touched.Description && (
                          <div className="text-danger">
                            {CreateWorkSpaceFormik.errors.Description}
                          </div>
                        )}
                      <p className="small mt-2">
                        Get your members on board with a few words about your
                        Workspace.
                      </p>
                      <Button
                        onClick={handleContinue}
                        disabled={!CreateWorkSpaceFormik.values.Title}
                        className="container create-workspace-submit"
                        variant="primary"
                        size="lg"
                      >
                        Continue
                      </Button>
                    </Form>
                  </div>
                </Col>
              ) : (
                ""
              )}

              {modalShow3 ? (
                <Col lg={6}>
                  <div className="p-5">
                    <Modal.Title
                      className="fw-bold"
                      id="contained-modal-title-vcenter"
                    >
                      Invite your team
                    </Modal.Title>
                    <p>
                      Trello makes teamwork your best work. Invite your new team
                      members to get going!
                    </p>
                    <Form>
                      <Form.Group
                        className="mb-1"
                        controlId="create-workspace-name"
                      >
                        <div className="d-flex justify-content-between">
                          <Form.Label className="fw-bold">
                            Workspace members
                          </Form.Label>
                          <a className="text-decoration-none" href="/">
                            <FontAwesomeIcon className="me-2" icon={faLink} />
                            Invite with link
                          </a>
                        </div>
                        <div className="w-100 position-relative">
                          <Form.Control
                            type="text"
                            placeholder="e.g. calrissian@cloud.ci"
                            onFocus={() => {
                              setInputResult(true);
                            }}
                            onBlur={() => setInputResult(false)}
                          />

                          {inputResult ? (
                            <Card className="custom-card p-3 mt-1 position-absolute w-100">
                              <div className="d-flex align-items-center search-result">
                                <img
                                  className="rounded-circle me-2"
                                  style={{ width: "36px", height: "36px" }}
                                  src="https://picsum.photos/200/300.jpg"
                                  alt=""
                                />
                                <div>
                                  <p className="m-0 small">Sanan Dalbik</p>
                                  <p className="m-0 small">
                                    Hasn't logged in recently
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ) : (
                            ""
                          )}
                        </div>
                      </Form.Group>
                    </Form>
                    <p className="small">
                      <span className="fw-bold">Pro tip!</span> Add multiple
                      emails, or invite them with one click.
                    </p>
                    <div className="d-flex flex-column align-items-center">
                      <Button
                        type="Submit"
                        onClick={() => {
                          CreateWorkSpaceFormik.handleSubmit();
                          setModalShow(false);
                          setWorkspaceModal2(false);
                          setWorkspaceModal1(true);
                        }}
                        className="container create-workspace-submit mb-1"
                        variant="primary"
                        size="lg"
                      >
                        Invite to Workspace
                      </Button>
                      <a
                        className="btn btn-link text-default"
                        onClick={() => {
                          CreateWorkSpaceFormik.handleSubmit();
                          setModalShow(false);
                          setWorkspaceModal2(false);
                          setWorkspaceModal1(true);
                        }}
                      >
                        I'll do this later
                      </a>
                    </div>
                  </div>
                </Col>
              ) : (
                ""
              )}

              <Col
                lg={6}
                className="create-workspace-right-wrapper d-flex justify-content-center align-items-center"
              >
                <img
                  src="https://trello.com/assets/d1f066971350650d3346.svg"
                  alt=""
                />
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </div>
      <div style={{ display: "none" }}>
        <SliderBarMenu workspaceId={selectedWorkspaceId} />
      </div>
      <Modal
        show={notificationModalShow}
        onHide={() => {
          setNotificationModalShow(false);
        }}
        size="sm"
        className="create-workspace-modal"
        id={Styles.NotificationModal}
      >
        <Modal.Body>
          <div className={Styles.mainnotifaction}>
            <p>
              <h1>Notifications</h1>
              <span
                style={{
                  display: AllNotification?.data?.length > 0 ? "" : "none",
                }}
              >
                You have {AllNotification?.data && AllNotification.data.length}{" "}
                unread messages
              </span>
            </p>
            <div>
              {AllNotification?.data &&
                AllNotification.data.map((notification, index) => {
                  return (
                    <div>
                      <div className={Styles.workAndBoardImage}>B</div>
                      <div className={Styles.notificationMessage}>
                        {notification.text}
                      </div>
                      <div className={Styles.goToWorkspaceAndBoard}>
                        <button className={Styles.ntcBtnGotoB}>
                          <a
                            href={
                              notification.boardId !== null
                                ? "/Boards/72cc096e-d9b4-4def-462e-08dc4e977386"
                                : ""
                            }
                          >
                            Go To{" "}
                            {notification.boardId !== null
                              ? "Board"
                              : "Workspace"}
                          </a>
                          <div className={Styles.arrowWrapper}>
                            <div className={Styles.arrow}></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Navbar>
  );
}
