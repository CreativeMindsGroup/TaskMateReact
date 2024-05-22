
import React, { useEffect, useRef, useState } from "react";
import Styles from './Header.module.css'
import { Card, Image, Navbar } from "react-bootstrap";
import { Menu, MenuButton, MenuDivider, MenuList, Stack, AlertIcon, useDisclosure, Img } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import WorkSpace from "../WorkSpace/WorkSpace";
import UserImage from '../../Images/126083012.jpg'
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useFormik } from "formik";
import { CreateWorkSpace, GetAllWorkspaces } from "../../Service/WorkSpaceService";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { CreateBoard } from "../../Service/BoardService";
import { GetUserById } from "../../Service/UserService";
import image1 from '../../Images/1.jpg'
import image2 from '../../Images/2.jpg'
import image3 from '../../Images/3.jpg'
import image4 from '../../Images/4.jpg'
import image5 from '../../Images/5.jpg'
import image6 from '../../Images/6.jpg'
import { logoutAction } from "../../Redux/Slices/AuthSlice";
import {
  setData,
} from "../../Redux/Slices/WorkspaceAndBorderSlice";
import * as Yup from "yup";

export default function Header() {
  const images = [image1, image2, image3, image4, image5, image6]
  const [isClicked, setIsClicked] = useState()
  const searchContainerRef = useRef(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalShow2, setWorkspaceModal1] = useState(true);
  const [modalShow3, setWorkspaceModal2] = useState(false);
  const {
    isOpen: isWorkspacesOpen,
    onOpen: onWorkspacesOpen,
    onClose: onWorkspacesClose,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isBoardOpen,
    onOpen: onBoardOpen,
    onClose: onBoardClose,
  } = useDisclosure();
  const {
    isOpen: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure();


  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();
  const toggleSearch = () => {
    setIsClicked(!isClicked);
    isSearchOpen ? onSearchClose() : onSearchOpen();
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsClicked(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);


  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { token, email, username } = useSelector((x) => x.auth);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [inputResult, setInputResult] = useState(false);
  const [createBoardSlide2, setCreateBoardSlide2] = useState(false);
  const { workspaceId } = useSelector((x) => x.Data)
  useEffect(() => {
    setSelectedWorkspaceId(workspaceId)
  }, [workspaceId])
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
    onSubmit: (values) => {
      if (values.Title === null || values.Title === "") {
      } else {
        CreateWorkSpaceMutate(values);
        setShowAlert(true);
        const timer = setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["GetBoartsInWorkspace"]);
    },
  });

  const { mutate: CreateWorkSpaceMutate, isLoading: Loginloading } =
    useMutation((values) => CreateWorkSpace(values), {
      onSuccess: () => {
        queryClient.invalidateQueries("GetAllworkspaces");
      },
    });

  const CreateBoardFormik = useFormik({
    initialValues: {
      title: "",
      workspaceId: "",
      appUserId: userId,
      theme: ""
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Required").max(200),
      workspaceId: Yup.string().required("Required"),
      appUserId: Yup.string().required("Required"),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      if (values.title && values.workspaceId) {
        CreateBoardMutation(values);
        setSubmitting(false);
        resetForm();
        onBoardClose();
        onCreateClose();
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("GetBoartsInWorkspace");
    },
  });
  const handleImageClick = (index) => {
    const themeNumber = index + 1;
    CreateBoardFormik.setFieldValue('theme', themeNumber.toString());
    setSelectedImageIndex(themeNumber - 1)
  };
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const { mutate: CreateBoardMutation } = useMutation(
    (values) => CreateBoard(values),
    {
      onSuccess: (values) => {
        queryClient.invalidateQueries("Boards");
        queryClient.invalidateQueries("GetBoartsInWorkspace");
        setShowAlert2(true);
        const timer = setTimeout(() => {
          setShowAlert2(false);
        }, 2000);
      },
      onError: (err) => {
      },
    }
  );


  const handeCreateBoard = () => {
    setCreateBoardSlide2(!createBoardSlide2);
    queryClient.invalidateQueries("GetAllworkspaces");
  };
  const { data: ALlworkspaces } = useQuery(["GetAllworkspaces", userId], () =>
    GetAllWorkspaces(userId)
  );
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const handleWorkspaceAction = (workspaceId) => {
    if (workspaceId) {
      setSelectedWorkspaceId(workspaceId);
      dispatch(setData({ workspaceId: workspaceId }));
    }
    onWorkspacesClose();
  };
  return (
    <div className={Styles.Main}>
      {/* <ChakraProvider>
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
      </ChakraProvider> */}
      <div className={Styles.leftsideContainer}>
        {/* BrandLogo */}
        <Navbar.Brand
          className="d-flex align-items-center "
          style={{ color: "#b6c2cf", fontSize: "22px", margin: "0", fontWeight: "500", marginBottom: "2px" }}
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
          <p style={{ margin: "0" }}>
            TaskMate
          </p>
        </Navbar.Brand>
        {/* workspace Sellection */}
        <Menu isOpen={isWorkspacesOpen} onOpen={onWorkspacesOpen} onClose={onWorkspacesClose}>
          <MenuButton
            className={Styles.SelectTitle}
            bg={"none"}
            color={"#9FADBC"}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            _hover={{ bg: 'gray.400' }}
            _expanded={{ backgroundColor: '#A6C5E229', color: "#579dff" }}
          >
            Workspaces <ChevronDownIcon />
          </MenuButton>
          <MenuList zIndex={"3"} className={Styles.MenuContainer} border={"1px solid #dfe1e61c"} padding={"14px 10px"} borderRadius={"10px"} minW={"300px"} backgroundColor={"#282e33"}>
            <div className={Styles.AllWorkspaceContainer}>
              {selectedWorkspaceId &&
                <div>
                  <p className={Styles.WorkSpaceTitle}>
                    Current workspace
                  </p>
                  <WorkSpace
                    WorkspaceTitle={ALlworkspaces?.data?.find(ws => ws.id === selectedWorkspaceId)?.title}
                  />
                  <MenuDivider margin={"10px 0"} color={"#9fadbc"} />
                </div>
              }
              <p className={Styles.WorkSpaceTitle} style={{ paddingBottom: "5px" }}>Your workspaces</p>
              {ALlworkspaces?.data?.length > 0 ? (
                ALlworkspaces.data.map((workspace) => (
                  <WorkSpace
                    key={workspace.id}
                    WorkspaceTitle={workspace.title}
                    Click={() => handleWorkspaceAction(workspace.id)}
                  />
                ))
              ) : (
                <p className={Styles.WorkSpaceTitle}>No workspaces available</p>
              )}
            </div>
          </MenuList>
        </Menu>
        {/* Create menu */}
        <Menu isOpen={isCreateOpen} onOpen={onCreateOpen} onClose={onCreateClose} >
          <MenuButton
            className={Styles.CreateButton}
            _hover={{ bg: '#84b6fb' }}
            _expanded={{ backgroundColor: '#1c2b41', color: "#579dff" }}
          >Create
          </MenuButton>
          <MenuList zIndex={2} border={"1px solid #dfe1e61c"} borderRadius={"10px"} minW={"300px"} backgroundColor={"#282e33"}>
            <div className={Styles.CreateContainer}>
              <Menu isOpen={isBoardOpen} onOpen={onBoardOpen} onClose={onBoardClose} >
                <div className={Styles.MenuOption} onClick={() => { onBoardOpen(); }}>
                  <div className={Styles.MenuTitle}>
                    <span style={{ fontSize: "18px" }} className="material-symbols-outlined">
                      add
                    </span>
                    <h1>Create Board</h1>
                  </div>
                  <p className={Styles.SelectOptionContainer}>
                    A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything.
                  </p>
                </div>

                <MenuList border={"1px solid #dfe1e61c"} borderRadius={"4px"} minW={"300px"} backgroundColor={"#282e33"}>
                  {/* CREATE BROARD  */}
                  <div className={Styles.CreateBoardContainer}>
                    <div className={Styles.CreateboardHeader}>
                      <span onClick={onBoardClose} style={{ fontSize: '14px', cursor: "pointer" }} className="material-symbols-outlined">
                        arrow_back_ios
                      </span>
                      <p>
                        Create board
                      </p>
                      <span onClick={() => { onBoardClose(); onCreateClose() }} style={{ fontSize: '18px', cursor: "pointer" }} className="material-symbols-outlined">
                        close
                      </span>
                    </div>
                    <div className={Styles.CreateBoardBody}>
                      <div>
                        <label className={Styles.BoardTitle} htmlFor="BoardTitle">Background</label>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", cursor: "pointer" }}>
                          {images.map((value, index) => (
                            <img
                              onClick={() => handleImageClick(index)}
                              style={{
                                borderRadius: "4px",
                                width: "41px",
                                height: "31px",
                                border: selectedImageIndex === index ? '2px solid #579dff' : '2px solid transparent' // Conditional border color
                              }}
                              src={value}
                              alt={`image-${index}`}
                              key={index}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={Styles.BoardTitle} htmlFor="title">Board title*</label>
                        <input
                          className={Styles.BoardInput}
                          style={{ border: CreateBoardFormik.touched.title && CreateBoardFormik.errors.title ? '1px solid red ' : 'none' }}
                          placeholder="Enter board title"
                          name="title"
                          onChange={CreateBoardFormik.handleChange}
                          onBlur={CreateBoardFormik.handleBlur}
                          value={CreateBoardFormik.values.title}
                        />
                      </div>
                      <label className={Styles.BoardTitle} htmlFor="workspaceId">Select workspace</label>
                      <Form.Select
                        onChange={CreateBoardFormik.handleChange}
                        onBlur={CreateBoardFormik.handleBlur}
                        name="workspaceId"
                        value={CreateBoardFormik.values.workspaceId}
                        style={{ border: CreateBoardFormik.touched.workspaceId && CreateBoardFormik.errors.workspaceId ? '1px solid red' : 'none', color: '#b6c2cf' }}
                        className={Styles.SelectInput}
                      >
                        <option value="">Select a Workspace</option>
                        {ALlworkspaces?.data?.map((workspace, index) => (
                          <option key={index} value={workspace.id}>
                            {workspace.title}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        type="submit"
                        style={{
                          marginTop: "10px",
                          backgroundColor: (CreateBoardFormik.isSubmitting || !CreateBoardFormik.isValid) ? "#2D343A" : "#579dff", // Disabled color is dark gray, normal color is light blue
                          color: (CreateBoardFormik.isSubmitting || !CreateBoardFormik.isValid) ? "#ffffff" : "#ffffff", // Text color white for both states for visibility
                          borderColor: (CreateBoardFormik.isSubmitting || !CreateBoardFormik.isValid) ? "#2D343A" : "#579dff", // Border color matches the background
                          cursor: (CreateBoardFormik.isSubmitting || !CreateBoardFormik.isValid) ? "not-allowed" : "pointer" // Cursor indicates if the button is clickable
                        }}
                        disabled={CreateBoardFormik.isSubmitting || !CreateBoardFormik.isValid}
                        onClick={CreateBoardFormik.handleSubmit}
                        className={Styles.CreateBoard}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </MenuList>
              </Menu>

              <div className={Styles.MenuOption} onClick={() => { setModalShow(true); onCreateClose(); }}>
                <div className={Styles.MenuTitle}>
                  <span style={{ fontSize: "18px" }} className="material-symbols-outlined">
                    group
                  </span>
                  <h1>Create Workspace</h1>
                </div>
                <p className={Styles.SelectOptionContainer}>
                  A Workspace is a group of boards and people. Use it to organize your company, side hustle, family, or friends.
                </p>
              </div>
            </div>
          </MenuList>
        </Menu>
      </div>
      {/* Search and userProfile */}
      <div style={{ position: 'relative', width: isClicked ? "100%" : "max-content" }} className={Styles.rightsideContainer}>
        <Menu isOpen={isSearchOpen} onClose={onSearchClose}>
          <div ref={searchContainerRef} style={{ width: "100%" }} onClick={toggleSearch} className={!isClicked ? Styles.SearchContainer : Styles.SearchContainerOpened}>
            <span style={{ fontSize: "18px", color: "#9fadbcd1", padding: "0 0 0 10px" }} className="material-symbols-outlined">
              search
            </span>
            <input className={Styles.SearchInput} placeholder="Search " type="text" />
          </div>
          <MenuList style={{ display: !isClicked ? "none" : "flex" }} className={Styles.menuList} border={"1px solid #dfe1e61c"} borderRadius={"10px"} minW={"300px"} backgroundColor={"#282e33"}>
            hello
          </MenuList>
        </Menu>
        <Menu isOpen={isProfileOpen} onOpen={onProfileOpen} onClose={onProfileClose}>
          <MenuButton
            className={Styles.userImageContainer}
            bg={"none"}
            border={"none"}
            borderRadius={"50%"}
            color={"#9FADBC"}
            transition='all 0.2s'
            borderWidth='1px'
            _hover={{ bg: 'gray.400' }}
            _expanded={{ backgroundColor: '#A6C5E229', color: "#579dff" }}
          >
            <Image style={{ width: "60px", borderRadius: "5px" }} className={Styles.userImage} src={`https://placehold.co/512x512/d9e3da/1d2125?text=${username?.toUpperCase().slice(
                0,
                1
              )}`}  />
          </MenuButton>
          <MenuList style={{ display: isProfileOpen ? "block" : 'none' }} className={Styles.userProfile} border={"1px solid #dfe1e61c"} backgroundColor={"#282e33"}>
            <p className={Styles.ProfileDetails}>Account</p>
            <div className={Styles.UserDetailsContainer}>
              <Image style={{ width: "60px", borderRadius: "5px" }} className={Styles.ProfileDetailsImage} src={`https://placehold.co/512x512/d9e3da/1d2125?text=${username?.toUpperCase().slice(
                0,
                1
              )}`}  />
              <div className={Styles.UserDetails}>
                <p>{username}</p>
                <p>{email}</p>
              </div>
            </div>
            <MenuDivider margin={"10px 0"} color={"#9fadbc"} />
            <p onClick={() => { onProfileClose(); dispatch(logoutAction()) }} className={Styles.logout}>log out</p>
          </MenuList>
        </Menu>
      </div>
      {/* CREATE WORKSPACE  */}
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
        centered
      >
        <Modal.Body
          style={{ backgroundColor: "#22272B", color: '#b6c2cf' }}
          className="p-0 position-relative"
          id="contained-modal-title-vcenter"
        >
          <Button
            className={`${Styles.ExitButton} create-workspace-close btn-close position-absolute top-0 end-0 mt-5 me-4`}
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
                      <Form.Label className={Styles.WorkspaceCreateTitle}>
                        Workspace Name
                      </Form.Label>
                      <Form.Control
                        style={{ height: "55px", backgroundColor: "#22272B", color: '#b6c2cf !important' }}
                        className={Styles.placeholder}
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
                      <Form.Label className={Styles.WorkspaceCreateTitle}>
                        Workspace Description (optional)
                      </Form.Label>
                      <Form.Control
                        style={{ backgroundColor: "#22272B", color: '#b6c2cf !important' }}
                        className={Styles.placeholder}
                        onChange={CreateWorkSpaceFormik.handleChange}
                        name="Description"
                        as="textarea"
                        placeholder="Our team organizes everything here."
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
                      style={{ fontWeight: "600", border: "none", backgroundColor: !CreateWorkSpaceFormik.values.Title ? "#282D32" : "", color: !CreateWorkSpaceFormik.values.Title ? "#515D68" : "" }}
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
                        <Form.Label className={Styles.WorkspaceCreateTitle}>
                          Workspace members
                        </Form.Label>
                        <a className="text-decoration-none" href="/">
                          <FontAwesomeIcon className="me-2" icon={faLink} />
                          Invite with link
                        </a>
                      </div>
                      <div className="w-100 position-relative">
                        <Form.Control
                          style={{ backgroundColor: "#22272B", color: '#b6c2cf !important', height: "55PX" }}
                          className={Styles.placeholder}
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
              className={`${Styles.BackgoundImage} create-workspace-right-wrapper d-flex justify-content-center align-items-center`}
            >
              <img
                src="https://trello.com/assets/d1f066971350650d3346.svg"
                alt=""
              />

            </Col>
          </Row>
        </Modal.Body>
      </Modal>



    </div >
  );
}