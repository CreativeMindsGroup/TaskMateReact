import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Styles from "./Members.module.css";
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
  AddUserToWorkspace,
  ChangeUserRoleInWorkspace,
  CreateWorkSpace,
  DeleteUserFromWorkspace,
  GenerateLinkToJoinWorkspace,
  GetAllUsersOfWorkspace,
  GetAllWorkspaces,
  GetWorkSpaceById,
  getAllUsersCount,
} from "../../Service/WorkSpaceService";
import axios from "axios";
import { ErrorMessage, useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  ChakraProvider,
  Flex,
  Select,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { getbyWokrspaceInBoard } from "../../Service/BoardService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQueryClient } from "react-query";
import Dvider from "../Dvider";
import { useParams } from "react-router";
import { Pagination } from "react-bootstrap";
import { SeachUsers } from "../../Service/AuthService";
import * as Yup from 'yup';

export default function Members() {
  const dispatch = useDispatch();
  const [modalShow, setModalShow] = useState(false);
  const [workspaceInviteLink, setWorkspaceInviteLink] = useState(false);
  const { userId } = useSelector((x) => x.userCredentials)
  const [adminCount, setTotalAdminCount] = useState(0);
  const [MemberCount, setTotalMemberCount] = useState(0);
  const [GuestCount, setTotalGuestCount] = useState(0);
  const apiUrl = process.env.REACT_APP_API_HOST;


  const [inviteUrl, setInviteUrl] = useState(null);
  const [linkSelectedWorkspaceId, setLinkSelectedWorkspaceId] = useState(null);
  const handleLinkWorkspaceSelect = (Id) => {
    setLinkSelectedWorkspaceId(Id);
  };
  const { id } = useParams();

  const queryClient = useQueryClient();

  const generateLink = () => {
    axios
      .post(`${apiUrl}/api/Token`)
      .then((response) => {
        setInviteUrl(
          `${apiUrl}/Invite/${response?.data?.token}/${linkSelectedWorkspaceId}/${userId}`

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
          `http://localhost:3000/InviteBoard/${response?.data?.token}/${linkBoardWorkpaceId}/${linkSelectedBoardId}/${userId}`
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
        setWorkspaces(values?.data);
      },
      onError: (err) => { },
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
          `${apiUrl}/api/AppUser/SearchUserByEmailorUsername?value=${searchValue}`
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

  // add user
  const [suucesMessage, setSuccesMessage] = useState(false);
  const workspaceAddUserFormik = useFormik({
    initialValues: {
      adminId: userId,
      userId: '',
      email: '',
      role: "0",
      workspaceId: id,
    },
    validationSchema: Yup.object({
      adminId: Yup.string().required('Admin ID is required'), // Assuming adminId should also be validated
      // email: Yup.string().email('Invalid email address').required('Email is required'),
      role: Yup.string().required('Role is required'),
      workspaceId: Yup.string().required('Workspace ID is required'),
    }),
    onSubmit: async (values) => {
      AddUserToWorkspaceMutation(values)
    }
  });
  const { mutate: AddUserToWorkspaceMutation, isLoading: AdduserLoading } =
    useMutation((values) => AddUserToWorkspace(values), {
      onSuccess: () => {
        queryClient.invalidateQueries("getAllusersOfWorkspce");
        queryClient.invalidateQueries("UsersCount");
        toast.success("User Added!");
      },
      onError: () => {
        toast.error("no Access!");
      },
    });

  // Directly use useQuery at the top level of your component
  const { data: workspaceData, isSuccess, error } = useQuery(
    ["GetWorkspaceById", id],
    () => GetWorkSpaceById(id),
    {
      onSuccess: (data) => {
      },
      onError: (error) => {
        console.error('Error fetching workspace data:', error);
      }
    }
  );

  // Optionally, log the workspace data if needed
  useEffect(() => {
  }, [isSuccess, workspaceData]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // You can adjust the default page size

  const { data: Users, isLoading: isLoadingUsers, error: getUserError } = useQuery(
    ["getAllusersOfWorkspce", id, page, pageSize],
    () => GetAllUsersOfWorkspace(id, page, pageSize),
    {
      onSuccess: (data) => {
        const admins = data?.data?.filter(user => user.role === 'Admin').length;
        const globalAdmins = data?.data?.filter(user => user.role === 'GlobalAdmin').length;
        setTotalAdminCount(admins + globalAdmins);
      },
      onError: (error) => {
        console.error('Error fetching workspace data:', error);
      },
      keepPreviousData: true, // Prevents the UI from flashing when fetching new data
    }
  );
  const { data: UsersCount } = useQuery(
    ["UsersCount", id],
    () => getAllUsersCount(id),
    {
      onSuccess: (data) => {
        setTotalAdminCount(data?.data?.adminCount);
        setTotalGuestCount(data?.data?.guestCount)
        setTotalMemberCount(data?.data?.memberCount)
      },
      onError: (error) => {
        console.error('Error fetching workspace data:', error);
      },
      keepPreviousData: true, // Prevents the UI from flashing when fetching new data
    }
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(Users?.data || []);
    } else {
      const filtered = Users?.data?.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, Users]);

  const [searchTerm2, setSearchTerm2] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = async (e) => {
    const { value } = e.target;
    setSearchTerm2(value);
    if (value.length > 2) { // Only search if the term is longer than 2 characters
      try {
        const response = await SeachUsers(value);
        setSearchResults(response.data); // Assuming the data comes in response.data
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  const handleSelectUser = (user) => {
    setSearchTerm2(user.email);  // Set the input field to show the selected user's email
    workspaceAddUserFormik.setFieldValue('email', user.email);
    setSearchResults([]); // Clear results after selection
  };

  //Change user Role mutation 
  const UpdateUserRoleFormik = useFormik({
    initialValues: {
      adminId: userId,
      userId: '',
      role: "0",
      WorkspaceId: id,
    },
    validationSchema: Yup.object({
      // adminId: Yup.string().required('Admin ID is required'),
      // role: Yup.string().required('Role is required'),
      // workspaceId: Yup.string().required('Workspace ID is required'),
    }),
    onSubmit: async (values) => {
      UpdateUserRoleMutation(values)
    },
    onError: () => {
      toast.error("no Access!");
    }, onSuccess: (value) => {

      toast.success("RoleChanged !");
      queryClient.invalidateQueries("getAllusersOfWorkspce");

    },
  });
  const { mutate: UpdateUserRoleMutation, isLoading: RoleChangeLoading } =
    useMutation((values) => ChangeUserRoleInWorkspace(values), {
      onSuccess: () => {
        toast.success("Role Changed!");
        queryClient.invalidateQueries("getAllusersOfWorkspce");
      },
      onError: () => {
        toast.error("You cant change user role!");
      }
    });
  const [ShowRoleChange, SetShowRole] = useState(true)
  const handleDone = () => {
    UpdateUserRoleFormik.handleSubmit()
    SetShowRole(!ShowRoleChange)
  }

  const [userRole, setUserRole] = useState("0")
  const CreateUrlFormik = useFormik({
    initialValues: {
      adminId: userId,
      userId: '',
      email: searchTerm2,
      role: userRole,
      workspaceId: id,
    },
    validationSchema: Yup.object({
      // adminId: Yup.string().required('Admin ID is required'),
      // email: Yup.string().email('Invalid email address').required('Email is required'),
      // role: Yup.string().required('Role is required'),
      // workspaceId: Yup.string().required('Workspace ID is required'),
    }),
    onSubmit: async (values) => {
      values.email = searchTerm2
      GenerateCodeMutatiom(values)
    }
  });
  const { mutate: GenerateCodeMutatiom, isLoading } =
    useMutation((values) => GenerateLinkToJoinWorkspace(values), {
      onSuccess: (value) => {
        navigator.clipboard.writeText(value.inviteLink)
        toast.success("Code Generated");
      },
      onError: () => {
        toast.error("no Access!");
      }
    });
  const handleRoleChange = (value) => {
    workspaceAddUserFormik.setFieldValue('role', value)
    CreateUrlFormik.setFieldValue('role', value)
  }





  const handleRemoveUser = (Id) => {
    RemoveUserFormik.handleSubmit()
    RemoveUserFormik.setFieldValue("userId", Id)
  }
  const RemoveUserFormik = useFormik({
    initialValues: {
      adminId: userId,
      userId: '',
      workspaceId: id,
    },
    validationSchema: Yup.object({
      // adminId: Yup.string().required('Admin ID is required'),
      // email: Yup.string().email('Invalid email address').required('Email is required'),
      // role: Yup.string().required('Role is required'),
      // workspaceId: Yup.string().required('Workspace ID is required'),
    }),
    onSubmit: async (values) => {
      RemoveUserMutate(values)
    }
  });
  const { mutate: RemoveUserMutate } =
    useMutation((values) => DeleteUserFromWorkspace(values), {
      onSuccess: (value) => {
        navigator.clipboard.writeText(value.inviteLink)
        toast.success("User removed !");
        queryClient.invalidateQueries("getAllusersOfWorkspce");
      },
      onError: () => {
        toast.error("no Access!");
      }
    });



  return (
    <>
      <ToastContainer></ToastContainer>
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
      <div className="w-100 " Styles={{ overflowY: "hidden", minHeight: "95vh" }}>
        <div className={Styles.contentWrapper}>
          <Col sm={10} className={Styles.contentTopNavBar}>
            <div className="d-flex align-items-center">
              <Image
                className={Styles.WokspaceImage}
                src={`https://placehold.co/512x512/d9e3da/1d2125?text=${workspaceData?.data?.title?.toUpperCase().slice(
                  0,
                  1
                )}`} rounded />
              <span className="ms-3">
                <h2 className="m-0">{workspaceData?.data?.title}</h2>
                <p className="small m-0">
                  <FontAwesomeIcon className="me-1" icon={faLock} />
                  {workspaceData?.data?.description}
                </p>
              </span>
            </div>
            <Button
              onClick={() =>
                setWorkspaceInviteLink((prev) => !prev)
              }
              className={Styles.shareButton}
            >
              <FontAwesomeIcon icon={faUserPlus} /> Invite workspace members
            </Button>
          </Col>
          <Dvider color={'rgb(159 173 188 / 24%)'} m={"30px"} ></Dvider>

          <div className="col-11">
            <h4 className="fw-bold mb-3">Collaborators ({adminCount})</h4>
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <div className="d-flex justify-content-between">
                <Col className={Styles.SellectContainer} sm={3}>
                  <Nav variant="pills" className={Styles.SellectWrapper}>
                    <Nav.Item className={Styles.SelectOption}>
                      <Nav.Link
                        className={Styles.SelectOption}
                        eventKey="first"
                      >
                        Workspace Members ({MemberCount})
                      </Nav.Link>
                    </Nav.Item>
                    <Dvider color={'rgb(159 173 188 / 24%)'} m={"15px 0px"} ></Dvider>
                    <Nav.Item className={Styles.SelectOption} >
                      <Nav.Link
                        className={Styles.SelectOption}
                        eventKey="second"
                      >
                        Guests ({GuestCount})
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>

                <Col sm={9}>
                  <Tab.Content>
                    <Tab.Pane eventKey="first">
                      <div>
                        <h3>Workspace members ({MemberCount})</h3>
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
                            Workspace.
                          </p>
                          <span className="col-5">
                          </span>
                        </span>
                      </div>
                      <>
                        <label
                          style={{ color: "white", fontSize: "15px", }}
                          htmlFor="filter">Filter members</label>
                        <Form.Control
                          name="filter"
                          type="text"
                          placeholder="Search member ..."
                          className={Styles.searchInput}
                          style={{ backgroundColor: "#22272b", color: "#b6c2cf", border: "1px solid #b6c2cf", fontSize: "15px", padding: "2px 10px" }}
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Dvider color={'rgb(159 173 188 / 24%)'} m={"30px 0"} />
                        {!isLoadingUsers ? (
                          <div>
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((data, index) => (
                                <div key={index}>
                                  <Dvider color={'rgb(159 173 188 / 24%)'} m={"13px 0"} />
                                  <Flex align={'center'} justifyContent={'space-between'}>
                                    <div className={Styles.MemberContainer}>
                                      <Image
                                        className={Styles.UserImage}
                                        src={`https://placehold.co/512x512/d9e3da/1d2125?text=${data?.email.toUpperCase().slice(0, 1)}`}
                                        rounded
                                      />
                                      <span className="ms-3">
                                        <h2 className={Styles.UserDetailsEmail}>{data?.email}</h2>
                                        <h2 className={Styles.UserDetails}>{data?.role}</h2>
                                        <p className={Styles.UserDetails}>
                                          Description here
                                        </p>
                                      </span>
                                    </div>
                                    <div>
                                      <Flex gap={20} alignItems={'center'}>

                                        {ShowRoleChange &&
                                          <Button onClick={() => SetShowRole(!ShowRoleChange)} type="submit" className={Styles.Button}>
                                            {AdduserLoading ? (
                                              <Spinner
                                                thickness="3px"
                                                size="md"
                                                speed="0.65s"
                                                emptyColor="gray.200"
                                                color="blue.500"
                                              />
                                            ) : (
                                              "Change Role"
                                            )}
                                          </Button>
                                        }
                                        {!ShowRoleChange && (
                                          <Flex gap={10}>
                                            <ChakraProvider>
                                              <Select
                                                onChange={UpdateUserRoleFormik.handleChange}
                                                onBlur={UpdateUserRoleFormik.handleBlur}
                                                name="role"
                                                color={'#b6c2cf'}
                                                w={100}
                                                p="14px 0"
                                                defaultValue={UpdateUserRoleFormik.values.role}
                                                sx={{
                                                  'select:focus + [data-reach-listbox-popover]': {
                                                    backgroundColor: 'red', // Custom background color for the opened menu
                                                  }
                                                }}
                                              >
                                                <option value="0">Guest</option>
                                                <option value="1">Member</option>
                                                <option value="2">Admin</option>
                                                <option value="3">GlobalAdmin</option>

                                              </Select>
                                            </ChakraProvider>
                                            <button onClick={() => { UpdateUserRoleFormik.setFieldValue("userId", data?.id); handleDone() }} type="submit" disabled={UpdateUserRoleFormik.isSubmitting || RoleChangeLoading}>
                                              Done
                                            </button>
                                          </Flex>
                                        )}
                                        <Button style={{ maxHeight: "" }} onClick={() => handleRemoveUser(data?.id)} type="submit" className={Styles.Button}>
                                          Remove user
                                        </Button>
                                      </Flex>
                                    </div>
                                  </Flex>
                                  <Dvider color={'rgb(159 173 188 / 24%)'} m={"13px 0"} />
                                </div>
                              ))
                            ) : (
                              <Container className="text-center">
                                <p>No members found.</p>
                              </Container>
                            )}
                            <Pagination >
                              <Pagination.Prev onClick={() => setPage(old => Math.max(old - 1, 1))} disabled={page === 1} />
                              <Pagination.Item >{page}</Pagination.Item>
                              <Pagination.Next onClick={() => setPage(old => old + 1)} />
                            </Pagination>
                          </div>
                        ) : (
                          <ChakraProvider>
                            <Flex justifyContent={'center'} w={'100%'}>
                              <CircularProgress isIndeterminate color='blue.300' />
                            </Flex>
                          </ChakraProvider>
                        )}
                      </>

                    </Tab.Pane>
                    <Tab.Pane eventKey="second">
                      <div>
                        1234
                      </div>
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">
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
                                              Styles={{
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
          className={Styles.InviteLinkGenerateContainer}
          id="contained-modal-title-vcenter"
        >
          <div className={Styles.HeaderGenerateLink} >
            <h1>
              invite to workspace
            </h1>
            <div style={{ cursor: 'pointer' }}>
              <span
                onClick={() => setWorkspaceInviteLink(false)}
                style={{ color: '#e5e9ee' }} className="material-symbols-outlined">
                close
              </span>
            </div>
          </div>
          <ChakraProvider>
            <Select
              onChange={(e) => { handleRoleChange(e.target.value); }}
              name="role"
              color={'#b6c2cf'}
              defaultValue="0"
              w={200}
              p="14px 0"
              sx={{
                'select:focus + [data-reach-listbox-popover]': {
                  backgroundColor: 'red', // Custom background color for the opened menu
                }
              }}
            >
              <option value="0">Guest</option>
              <option value="1">Member</option>
              <option value="2">Admin</option>
            </Select></ChakraProvider>
          <Flex gap={10} flexDir={'column'} >
            <Flex gap={10} alignItems={'center'} >
              <Form.Control
                name="email"
                type="text"
                placeholder="Search member ..."
                value={searchTerm2}
                autoComplete="off"
                onChange={handleSearchChange}
                className={Styles.Inputinvite}
                style={{ backgroundColor: "#22272b", color: "#b6c2cf", fontSize: "15px", maxWidth: '100%' }}
              />
              <Button onClick={workspaceAddUserFormik.handleSubmit} type="submit" className={Styles.Button} style={{ padding: "9px" }}>
                {AdduserLoading ? (
                  <Spinner
                    thickness="3px"
                    size="md"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                  />
                ) : (
                  "Add User"
                )}
              </Button>
            </Flex>
            {searchResults?.length > 0 && (
              <div style={{ color: 'white' }} className={Styles.searchResults}>
                {searchResults?.map((user, index) => (
                  <div key={index} onClick={() => handleSelectUser(user)} className={Styles.searchResultItem}>
                    {user.email}
                  </div>
                ))}
              </div>
            )}
          </Flex>
          <Flex pt={20} alignItems={'center'} justifyContent={'space-between'}>
            <p className={Styles.InviteDesc} style={{ margin: 0 }}>
              Invite someone to this Workspace with a link
            </p>
            <Button
              onClick={CreateUrlFormik.handleSubmit}
              className={Styles.Button} style={{ padding: "9px" }}>
              {AdduserLoading ? (
                <Spinner
                  t hickness="3px"
                  size="md"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                />
              ) : (
                "Create link and copy"
              )}
            </Button>
          </Flex>
        </Modal.Body>
      </Modal>

    </>
  );
}
