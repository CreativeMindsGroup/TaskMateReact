import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Styles from "./SideBarMenu.module.css";
import NavDropdown from "react-bootstrap/NavDropdown";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { UpdateBoard, getDeletebyId, getbyWokrspaceInBoard } from "../../Service/BoardService.js";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router";
import { setData } from "../../Redux/Slices/WorkspaceAndBorderSlice.js";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ChakraProvider,
  Alert,
  AlertIcon,
  FormLabel,
  Input,
  FormControl,
  Flex
} from '@chakra-ui/react'
import { Button, Stack } from "react-bootstrap";
import { useFormik } from "formik";
import jwtDecode from "jwt-decode";
import { GetWorkSpaceById } from "../../Service/WorkSpaceService.js";

export default function SideBarMenu({ setImage ,id}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { refresh, workspaceId, BoardId, userId } = useSelector((x) => x.Data);
  const { token } = useSelector((x) => x.auth);
  const [Bid, setBoardid] = useState(BoardId)
  const dispatch = useDispatch();
  const decodedToken = token ? jwtDecode(token) : null;
  const userId2 = decodedToken
    ? decodedToken[
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ]
    : null;

  useEffect(() => {
    setBoardid(BoardId)
  }, [BoardId]);

  const [isMenuOpen, setMenuOpen] = useState(true);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);


  const queryClient = useQueryClient();
  const { data: byBoard } = useQuery(
    ["GetBoartsInWorkspace", workspaceId ? workspaceId : undefined, userId2 ? userId2 : undefined],
    () => getbyWokrspaceInBoard(userId2, workspaceId),
    { enabled: !!workspaceId && !!userId2 }
  );

  const { mutate: deleteBoardMutation } = useMutation(
    (data) => getDeletebyId(data),
    {
      onSuccess: () => {
        // Invalidate the query cache after successful deletion
        queryClient.invalidateQueries("GetBoartsInWorkspace");
        queryClient.invalidateQueries("worspacedata")
      },
    }
  );
  const { mutate: updateBoradMutation } = useMutation(
    () => UpdateBoard(BoardUpdateFomik.values),
    {
      onSuccess: (values) => {
        queryClient.invalidateQueries("GetBoartsInWorkspace");
        queryClient.invalidateQueries("worspacedata")
      },
      onError: (err) => { },
    }
  );
  const onCloseUpdateModal = () => {
    setUpdateModalOpen(false);
  };
  const HandleUpdate = () => {
    if (BoardUpdateFomik.values.title === "") {
    } else {
      updateBoradMutation();
      onCloseUpdateModal();
    }
  };
  const HandleSubmit = () => {
    const data = {
      AppUserId: userId,
      boardId: BoardId
    };
    deleteBoardMutation(data);
    onClose();
  };
  const BoardUpdateFomik = useFormik({
    initialValues: {
      title: "",
      BoardId: '',
      appUserId: userId2,
    },
    onSubmit: (values) => {
      if (values.title === "") {
      } else {
        values.boardId = BoardId
        values.appUserId = userId2
        UpdateBoard(values)

        const timer = setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    },
  });
  const [showAlert, setShowAlert] = useState(false);
  const { data: GetWorkspaceById } = useQuery(
    ["GetWorkspaceById", workspaceId ? workspaceId : undefined],
    () => GetWorkSpaceById(workspaceId),
    { enabled: !!workspaceId }
  );
  useEffect(() => {
    queryClient.invalidateQueries("BoardInCardList");
  }, [BoardId]);
  const currentWorkspace = GetWorkspaceById?.data?.title;
  // function generateLightColor() {
  //   const red = Math.floor(Math.random() * 128) + 128; 
  //   const green = Math.floor(Math.random() * 128) + 128; 
  //   const blue = Math.floor(Math.random() * 128) + 128; 

  //   return  ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
  // }


  const HandeSellect = (data) => {
    dispatch(setData({ BoardId: data }));
    setImage(byBoard.data.find(board => board.id === data)?.theme);
    queryClient.refetchQueries("BoardInCardList");
    queryClient.removeQueries("BoardInCardList")
  }
  useEffect(() => {
    dispatch(setData({ BoardId: id }));
    const selectedBoard = byBoard?.data.find(board => board.id === id);
    if (selectedBoard) {
      setImage(selectedBoard.theme)
    }
  }, [id, byBoard?.data]);
  
  return (
    <>
      <ChakraProvider>
        <Stack zIndex={1} top={0} right={0} position={'absolute'} spacing={3}>
          {showAlert && (
            <Alert status='success' variant='top-accent'>
              <AlertIcon />
              Board is Succesfully Updated!
            </Alert>
          )}
        </Stack>
      </ChakraProvider>
      <Col className={[Styles.sideBarMenuWrapper, isMenuOpen ? "col-2" : ""]}>
        {isMenuOpen ? (
          <Col className={[Styles.sideBarMenu, isMenuOpen ? "col-lg-12" : ""]}>
            <div>
              <Container
                className={[
                  Styles.sideBarMenuWorkspaceName,
                  "justify-content-between px-3 align-items-center",
                ]}
                fluid
              >
                <span className="d-flex align-items-center">
                  <Image
                    className={Styles.workspacePic}
                    src={`https://placehold.co/512x512/d9e3da/1d2125?text=${currentWorkspace?.slice(0, 1)}`}
                    rounded
                  />
                  <p className="m-0 ms-2 fw-bold">{currentWorkspace} </p>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className={"btn btn-primary default-submit"}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              </Container>
              <Container className={[Styles.sideBarMenuWorkspace, "mt-2"]} fluid>
                <div className="ms-1">
                </div>

                <Card.Text className="mx-1 my-1 p-0 container-fluid">
                  {" "}
                  Your Boards{" "}
                </Card.Text>
                {Array.isArray(byBoard?.data) && byBoard?.data?.length ? (
                  byBoard.data.map((board, index) => {
                    return (
                      <NavDropdown.Item key={index}>
                        <Container onClick={() => {setImage(board.theme) ;HandeSellect(board.id)}} className="p-0 m-0 navbar-workspace-link">
                          <Row className="px-0 my-2 d-flex align-items-center rounded-0">
                            <ChakraProvider>
                              <Flex align={'center'} justify={'space-between'} gap={2}>
                                <Flex align={'center'} justify={'flex-start'} gap={2}>
                                  <Col style={{ width: "20px" }} lg={3}>
                                    <Image
                                      className="workspace-pic"
                                      src={`https://placehold.co/512x512/d9e3da/1d2125?text=${board?.title?.toUpperCase().slice(0, 1)}`}
                                    />
                                  </Col>
                                  <Col className="p-0">{board.title}</Col>
                                </Flex>
                                <Menu>
                                  <MenuButton bgColor={'transparent'}>
                                    <FontAwesomeIcon icon={faEllipsis} />
                                  </MenuButton>
                                  <MenuList w={"200px"} border={"#616466 1px solid"} borderRadius={4} pb={2} pt={2} gap={10} bgColor={'#1d2125'}>
                                    <MenuItem backgroundColor={"transparent"} onClick={() => onOpen()} p={"0px 12px"} _hover={{ backgroundColor: "#616466" }}>Delete Board</MenuItem>
                                    <MenuItem backgroundColor={"transparent"} onClick={() => {
                                      setUpdateModalOpen(true);
                                      BoardUpdateFomik.setFieldValue("BoardId", board.id)
                                    }} p={"0px 12px"} _hover={{ backgroundColor: "#616466" }}>Update Board</MenuItem>
                                  </MenuList>
                                </Menu>
                              </Flex>
                            </ChakraProvider>
                          </Row>
                        </Container>
                      </NavDropdown.Item>
                    );
                  })
                ) : (
                  <NavDropdown.Item>No boards available</NavDropdown.Item>
                )}

              </Container>
            </div>
          </Col>
        ) : (
          <Col className={Styles.sideBarMenu}>
            <button
              onClick={() => setMenuOpen(true)}
              className="btn btn-primary default-submit m-2 mt-4"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </Col>
        )}
      </Col >
      <ChakraProvider>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Board</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this board?
            </ModalBody>
            <ModalFooter>
              <Button style={{ backgroundColor: "red", border: "#ffff 1px solid" }} mr={3} onClick={() => HandleSubmit()}>
                Yes
              </Button>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isUpdateModalOpen} onClose={onCloseUpdateModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Board</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Update board content goes here.
              <FormControl>
                <FormLabel>Board Title</FormLabel>
                <Input name="title" onChange={BoardUpdateFomik.handleChange} placeholder={"Board Title"} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={HandleUpdate} >
                Save Changes
              </Button>
              <Button variant='ghost' onClick={onCloseUpdateModal}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>

    </>
  );
}
