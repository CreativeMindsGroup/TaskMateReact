import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Style from "./Members.module.css";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLink, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import jwtDecode from "jwt-decode";
import NavDropdown from "react-bootstrap/NavDropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery } from "react-query";
import {
  CreateWorkSpace,
  GetAllWorkspaces,
} from "../../Service/WorkSpaceService";
import axios from "axios";
import { useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { getbyWokrspaceInBoard } from "../../Service/BoardService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQueryClient } from "react-query";

export default function Members() {
  const dispatch = useDispatch();
  const [modalShow, setModalShow] = useState(false);
  const [workspaceInviteLink, setWorkspaceInviteLink] = useState(false);
  const [boardInviteLink, setBoardInviteLink] = useState(false);

  const { token, email } = useSelector((x) => x.auth);

  const decodedToken = token ? jwtDecode(token) : null;

  const userId = decodedToken
    ? decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ]
    : null;

  const [inviteUrl, setInviteUrl] = useState(null);
  const [linkSelectedWorkspaceId, setLinkSelectedWorkspaceId] = useState(null);
  const handleLinkWorkspaceSelect = (Id) => {
    setLinkSelectedWorkspaceId(Id);
  };

  const queryClient = useQueryClient();

  const generateLink = () => {
    axios
      .post("https://localhost:7101/api/Token")
      .then((response) => {
        setInviteUrl(
          `http://localhost:3000/Invite/${response?.data.token}/${linkSelectedWorkspaceId}/${userId}`
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleWorkspaceCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const [inviteBoardUrl, setInviteBoardUrl] = useState(null);
  const [linkSelectedBoardId, setLinkSelectedBoardId] = useState(null);
  const [linkBoardWorkpaceId, setLinkBoardWorkpaceId] = useState(null);
  const handleBoardLinkWorkspaceSelect = (Id) => {
    setLinkBoardWorkpaceId(Id);
  };
  const handleLinkBoardSelect = (boardId) => {
    setLinkSelectedBoardId(boardId);
  };

  const { data: workspaceInBoards } = useQuery(
    ["workspaceInBoards", userId, linkBoardWorkpaceId],
    () => {
      if (linkBoardWorkpaceId !== null) {
        return getbyWokrspaceInBoard(userId, linkBoardWorkpaceId);
      }
    }
  );

  const generateBoardLink = () => {
    axios
      .post("https://localhost:7101/api/Token")
      .then((response) => {
        setInviteBoardUrl(
          `http://localhost:3000/InviteBoard/${response?.data.token}/${linkBoardWorkpaceId}/${linkSelectedBoardId}/${userId}`
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleBoardCopyLink = () => {
    if (inviteBoardUrl) {
      navigator.clipboard.writeText(inviteBoardUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const [inputResult, setInputResult] = useState(true);
  const [Workspaces, setWorkspaces] = useState();
  const { mutate: GetUsersAllWorkSpaces } = useMutation(
    (userId) => GetAllWorkspaces(userId),
    {
      onSuccess: (values) => {
        setWorkspaces(values.data);
      },
      onError: (err) => {},
    }
  );

  useEffect(() => {
    GetUsersAllWorkSpaces(userId);
  }, [userId]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  const handleWorkspaceSelect = (Id) => {
    setSelectedWorkspaceId(Id);
  };

  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7101/api/AppUser/SearchUserByEmailorUsername?value=${searchValue}`
        );
        setSearchResult(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const timerId = setTimeout(() => {
      if (searchValue.trim() !== "") {
        // Eğer arama değeri boş değilse
        fetchData();
      } else {
        setSearchResult(null);
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchValue]);

  const handleInputChange = (event) => {
    setInputResult(true);
    setSearchValue(event.target.value);
  };

  const [addUserId, setAddUserId] = useState(null);
  const handleCardClick = (userId, username) => {
    setAddUserId(userId);
    setSearchValue(username);
    setInputResult(false);
  };

  const [suucesMessage, setSuccesMessage] = useState(false);
  const workspaceAddUser = useFormik({
    initialValues: {
      AdminId: userId,
      WorkspaceId: selectedWorkspaceId,
      AppUserId: addUserId,
    },
    onSubmit: async (values) => {
      const formData = new FormData();

      formData.append("AdminId", userId);
      formData.append("WorkspaceId", selectedWorkspaceId);
      formData.append("AppUserId", addUserId);

      try {
        const response = await axios.post(
          "https://localhost:7101/api/Workspaces/AddWorkspace",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 201) {
          setSuccesMessage(true);
          queryClient.invalidateQueries("GetAllNotifications");
        }
      } catch (error) {}
    },
    // validationSchema: reservationScheme,
  });

  return (
    <>
      <div>
        <Modal
          show={suucesMessage}
          onHide={() => {
            setSuccesMessage(false);
          }}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          className="create-share-link-modal"
        >
          <Modal.Body
            className="p-0 position-relative"
            id="contained-modal-title-vcenter"
          >
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Workspace Added
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Thanks for submitting your application. Our team will get back
                to you soon.
              </AlertDescription>
            </Alert>
          </Modal.Body>
        </Modal>
      </div>
      <div className="w-100" style={{ overflowY: "hidden", minHeight: "95vh" }}>
        <div className={Style.contentWrapper}>
          <Col sm={10} className={Style.contentTopNavBar}>
            <div className="d-flex align-items-center">
              <Image
                className="workspace-pic"
                src="https://placehold.co/512x512/d9e3da/1d2125?text=S"
                rounded
              />
              <span className="ms-3">
                <h2 className="m-0">Sanan's Workspace</h2>
                <p className="small m-0">
                  <FontAwesomeIcon className="me-1" icon={faLock} /> Private
                </p>
              </span>
            </div>
            <Button
              onClick={() => setModalShow(true)}
              className={Style.shareButton}
            >
              <FontAwesomeIcon icon={faUserPlus} /> Invite workspace members
            </Button>
          </Col>
          <div className="col-11">
            <h4 className="fw-bold mb-3">Collaborators (1)</h4>
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <div className="d-flex justify-content-between">
                <Col className="me-3" sm={3}>
                  <Nav variant="pills" className="flex-column col-10">
                    <Nav.Item>
                      <Nav.Link
                        className="fw-bold fs-6 default-outline-dark-submit"
                        eventKey="first"
                      >
                        Workspace Members (1)
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="my-2">
                      <Nav.Link
                        className="fw-bold default-outline-dark-submit"
                        eventKey="second"
                      >
                        Guests (0)
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        className="fw-bold default-outline-dark-submit"
                        eventKey="third"
                      >
                        Join request (0)
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col sm={9}>
                  <Tab.Content>
                    <Tab.Pane eventKey="first">
                      <div>
                        <h3>Workspace members (1)</h3>
                        <p>
                          Workspace members can view and join all Workspace
                          visible boards and create new boards in the Workspace.
                        </p>
                      </div>
                      <div className="mt-5 mb-3 tab-footer">
                        <h5>Invite members to join you</h5>
                        <span className="d-flex justify-content-between mb-2">
                          <p className="col-6">
                            Anyone with an invite link can join this free
                            Workspace. You can also disable and create a new
                            invite link for this Workspace at any time. Pending
                            invitations count toward the 10 collaborator limit.
                          </p>
                          <span className="col-5">
                            <Button
                              onClick={() =>
                                setWorkspaceInviteLink((prev) => !prev)
                              }
                              className="btn fw-bold w-100 mb-2 default-submit me-3"
                            >
                              Workspace Invite with link
                            </Button>
                            <Button
                              onClick={() =>
                                setBoardInviteLink((prev) => !prev)
                              }
                              className="btn fw-bold w-100 default-outline-submit"
                            >
                              Board invite with link
                            </Button>
                          </span>
                        </span>
                      </div>
                      <div>
                        {/* <Form>
                                                    <Form.Group className="mb-1" controlId="create-workspace-name">
                                                        <div className='d-flex align-items-center'>
                                                            <div className='w-100 position-relative me-2'>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="e.g. calrissian@cloud.ci"
                                                                    value={searchValue}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Form.Group>
                                                </Form> */}
                        <div className="tab-footer mt-3">Salam</div>
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="second">
                      <div>
                        <h3>Guests (0)</h3>
                        <p>
                          Guests can only view and edit the boards to which
                          they've been added.
                        </p>
                      </div>
                      <div className="mt-5 tab-footer">
                        <p className="m-0 py-3 fst-italic text-center">
                          There are no guests in this Workspace.
                        </p>
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">
                      <div>
                        <h3>Join requests (0)</h3>
                        <p>
                          These people have requested to join this Workspace.
                          All Workspace members are admins and can edit
                          Workspace settings.
                        </p>
                      </div>
                      <div className="mt-5 tab-footer">
                        <p className="fst-italic text-center">
                          There are no join requests.
                        </p>
                        <Form>
                          <Form.Group
                            className="mb-1"
                            controlId="create-workspace-name"
                          >
                            <div className="d-flex align-items-center">
                              <div className="w-100 position-relative me-2">
                                <Form.Control
                                  type="text"
                                  placeholder="e.g. calrissian@cloud.ci"
                                  onFocus={() => {
                                    setInputResult(true);
                                  }}
                                  onBlur={() => setInputResult(false)}
                                />
                                {inputResult
                                  ? searchResult &&
                                    searchResult?.length > 0 && (
                                      <div>
                                        {searchResult.map((result) => (
                                          <Card
                                            key={result.id}
                                            className="custom-card p-3 mt-1 position-absolute w-100"
                                          >
                                            <div className="d-flex align-items-center search-result">
                                              <img
                                                className="rounded-circle me-2"
                                                style={{
                                                  width: "36px",
                                                  height: "36px",
                                                }}
                                                src={result.imageUrl}
                                                alt=""
                                              />
                                              <div>
                                                <p className="m-0 small">
                                                  {result.name}
                                                </p>
                                                <p className="m-0 small">
                                                  {result.lastLogin
                                                    ? "Has logged in recently"
                                                    : "Hasn't logged in recently"}
                                                </p>
                                              </div>
                                            </div>
                                          </Card>
                                        ))}
                                      </div>
                                    )
                                  : ""}
                              </div>
                            </div>
                          </Form.Group>
                        </Form>
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </div>
            </Tab.Container>
          </div>
        </div>
      </div>
      <Modal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="create-share-link-modal"
      >
        <Modal.Body
          className="p-0 position-relative"
          id="contained-modal-title-vcenter"
        >
          <Row className="p-0 d-flex flex-nowrap">
            <div className="py-4 px-5">
              <Modal.Title
                className="fw-bold mb-4 d-flex justify-content-between align-items-center"
                id="contained-modal-title-vcenter"
              >
                <span>Share Board</span>
                <Button
                  className="create-workspace-close btn-close"
                  onClick={() => setModalShow(false)}
                ></Button>
              </Modal.Title>
              <NavDropdown
                className="navbar-workspaces"
                title="Workspaces"
                id="navbarScrollingDropdown"
              >
                <Card.Text className="ms-3 my-2 container-fluid">
                  {" "}
                  Your Workspaces{" "}
                </Card.Text>
                {Workspaces?.map((workspace, index) => (
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
              <Form>
                <Form.Group className="mb-1" controlId="create-workspace-name">
                  <div className="d-flex align-items-center">
                    <div className="w-100 position-relative me-2">
                      <Form.Control
                        type="text"
                        placeholder="e.g. calrissian@cloud.ci"
                        value={searchValue}
                        onChange={handleInputChange}
                      />
                      {inputResult
                        ? searchResult &&
                          searchResult?.length > 0 && (
                            <div>
                              {searchResult.map((result) => (
                                <Card
                                  onClick={() =>
                                    handleCardClick(result.id, result.username)
                                  }
                                  key={result.id}
                                  className="custom-card p-3 mt-1 position-absolute w-100"
                                >
                                  <div className="d-flex align-items-center search-result">
                                    <img
                                      className="rounded-circle me-2"
                                      style={{ width: "36px", height: "36px" }}
                                      src={result.imageUrl}
                                      alt=""
                                    />
                                    <div>
                                      <p className="m-0 small">
                                        {result.username}
                                      </p>
                                      <p className="m-0 small">
                                        {result.email}
                                      </p>
                                      <p className="m-0 small">
                                        {result.lastLogin
                                          ? "Has logged in recently"
                                          : "Hasn't logged in recently"}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )
                        : ""}
                    </div>
                    <div className="d-flex align-items-center">
                      <Dropdown>
                        <Dropdown.Toggle
                          className="defaultDropdown fw-bold"
                          variant="primary"
                          id="dropdown-basic"
                        >
                          Member
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            className="defaultDropdown-link px-3 py-2"
                            href="#"
                          >
                            Member
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="defaultDropdown-link px-3 py-2"
                            href="#"
                          >
                            Observer
                            <br />
                            <span className="small">
                              Add people with limited permissions <br /> to this
                              board
                            </span>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Button
                        onClick={workspaceAddUser.handleSubmit}
                        className={Style.modalShareButton}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Form.Group>
              </Form>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center">
                  <span className="p-2 rounded btn-outline-default me-2">
                    <FontAwesomeIcon icon={faLink} />
                  </span>
                  <span>
                    <p className="m-0">Anyone with the board share link</p>
                    <a className="btn-anchor" href="">
                      Copy Link
                    </a>
                  </span>
                </div>
                <Dropdown>
                  <Dropdown.Toggle
                    className="defaultDropdown fw-bold"
                    variant="primary"
                    id="dropdown-basic"
                  >
                    Can join as member
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      className="defaultDropdown-link px-3 py-2"
                      href="#"
                    >
                      Can join as member
                      <br />
                      <span className="small">
                        Board members can view and edit cards, <br />
                        lists, and some board settings.
                      </span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="defaultDropdown-link px-3 py-2"
                      href="#"
                    >
                      Can join as observer
                      <br />
                      <span className="small">
                        Board observers can view and comment.
                      </span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="defaultDropdown-link px-3 py-2"
                      href="#"
                    >
                      Delete Link
                      <br />
                      <span className="small">
                        The existing board share link will no longer work.
                      </span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex">
                  <Image
                    className="profile-pic me-2"
                    src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQcBR70-dRGg6OCJSvZ2xUzxQRN9F97n2CX2iekuDPjThLQQkt6"
                    roundedCircle
                  />
                  <span className="ms-1">
                    <h6 className="m-0">Hasbulla Gasimov (you)</h6>
                    <p className="m-0">@hasbullagasim • Workspace admin</p>
                  </span>
                </div>
                <Dropdown>
                  <Dropdown.Toggle
                    className="defaultDropdown fw-bold"
                    variant="primary"
                    id="dropdown-basic"
                  >
                    Admin
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      className="defaultDropdown-link px-3 py-2"
                      href="#"
                    >
                      Admin
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="defaultDropdown-link px-3 py-2"
                      href="#"
                    >
                      Member
                      <br />
                      <span className="small">
                        Boards must have at least one admin.
                      </span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="defaultDropdown-link px-3 py-2"
                      href="#"
                    >
                      Observer
                      <br />
                      <span className="small">
                        Add people with limited permissions to this board.
                      </span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </Row>
        </Modal.Body>
      </Modal>
      <Modal
        show={workspaceInviteLink}
        onHide={() => {
          setWorkspaceInviteLink(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="create-share-link-modal"
      >
        <Modal.Body
          className="p-0 position-relative"
          id="contained-modal-title-vcenter"
        >
          <div className={Style.workspaceLink}>
            <div>
              <div>
                <NavDropdown
                  className="navbar-workspaces"
                  fontSize={"20px"}
                  title="Workspaces"
                  id={Style.navbarScrollingDropdown}
                >
                  <Card.Text className="ms-3 my-2 container-fluid">
                    {" "}
                    All Workspaces{" "}
                  </Card.Text>
                  {Workspaces?.map((workspace, index) => (
                    <NavDropdown.Item
                      key={index}
                      onClick={() => handleLinkWorkspaceSelect(workspace.id)}
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
              </div>
              <div>
                <button onClick={() => generateLink()} id={Style.GenerateLink}>
                  Generate Link
                </button>
              </div>
            </div>
            <div className={Style.ThisGenerateLinkUrl}>
              <textarea
                value={linkSelectedWorkspaceId !== null ? inviteUrl : ""}
                className={Style.LinkTextarea}
                name=""
                id=""
                cols="68"
                rows="4"
              ></textarea>
              <button
                className={Style.copyinkgenerator}
                onClick={() => handleWorkspaceCopyLink()}
              >
                Copy Link{" "}
                <FontAwesomeIcon
                  icon="fa-solid fa-link"
                  style={{ color: "#63E6BE" }}
                />
              </button>
              <ToastContainer />
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={boardInviteLink}
        onHide={() => {
          setBoardInviteLink(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="create-share-link-modal"
      >
        <Modal.Body
          className="p-0 position-relative"
          id="contained-modal-title-vcenter"
        >
          <div className={Style.workspaceLink}>
            <div>
              <div>
                <NavDropdown
                  className="navbar-workspaces"
                  fontSize={"20px"}
                  title="Workspaces"
                  id={Style.navbarScrollingDropdown}
                >
                  <Card.Text className="ms-3 my-2 container-fluid">
                    {" "}
                    All Workspaces{" "}
                  </Card.Text>
                  {Workspaces?.map((workspace, index) => (
                    <NavDropdown.Item
                      key={index}
                      onClick={() =>
                        handleBoardLinkWorkspaceSelect(workspace.id)
                      }
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
                <NavDropdown
                  className="navbar-workspaces"
                  fontSize={"20px"}
                  title="Boards"
                  id={Style.navbarScrollingDropdown}
                >
                  <Card.Text className="ms-3 my-2 container-fluid">
                    {" "}
                    All Boards{" "}
                  </Card.Text>
                  {workspaceInBoards?.data?.map((board, index) => (
                    <NavDropdown.Item
                      key={index}
                      onClick={() => handleLinkBoardSelect(board.id)}
                    >
                      <Container className="navbar-workspace-link">
                        <Row className="px-1 py-3 d-flex align-items-center">
                          <Col lg={3}>
                            <Image
                              className="workspace-pic"
                              src={`https://placehold.co/512x512/d9e3da/1d2125?text=${board.title.slice(
                                0,
                                1
                              )}`}
                              rounded
                            />
                          </Col>
                          <Col className="p-0">{board.title}</Col>
                        </Row>
                      </Container>
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              </div>
              <div>
                <button
                  onClick={() => generateBoardLink()}
                  id={Style.GenerateLink}
                >
                  Generate Link
                </button>
              </div>
            </div>
            <div className={Style.ThisGenerateLinkUrl}>
              <textarea
                value={linkSelectedBoardId !== null ? inviteBoardUrl : ""}
                className={Style.LinkTextarea}
                name=""
                id=""
                cols="68"
                rows="4"
              ></textarea>
              <button
                className={Style.copyinkgenerator}
                onClick={handleBoardCopyLink}
              >
                Copy Link{" "}
                <FontAwesomeIcon
                  icon="fa-solid fa-link"
                  style={{ color: "#63E6BE" }}
                />
              </button>
              <ToastContainer />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
