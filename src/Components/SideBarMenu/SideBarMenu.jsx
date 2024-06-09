import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Styles from "./SideBarMenu.module.css";
import NavDropdown from "react-bootstrap/NavDropdown";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { UpdateBoard, getDeletebyId, getbyWokrspaceInBoard } from "../../Service/BoardService.js";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router";
import { setData } from "../../Redux/Slices/WorkspaceAndBorderSlice.js";
import { Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, ChakraProvider, Alert, AlertIcon, FormLabel, Input, FormControl, Flex } from '@chakra-ui/react'
import { Button, Stack } from "react-bootstrap";
import { useFormik } from "formik";
import jwtDecode from "jwt-decode";
import { GetWorkSpaceById } from "../../Service/WorkSpaceService.js";
import image1 from '../../Images/1.jpg'
import image2 from '../../Images/2.jpg'
import image3 from '../../Images/3.jpg'
import image4 from '../../Images/4.jpg'
import image5 from '../../Images/5.jpg'
import image6 from '../../Images/6.jpg'
import { ToastContainer, toast } from "react-toastify";

export default function SideBarMenu({ setImage, id }) {
  const images = [image1, image2, image3, image4, image5, image6];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { workspaceId, BoardId } = useSelector((x) => x.workspaceAndBoard);
  const { token } = useSelector((x) => x.auth);
  const [Bid, setBoardid] = useState(BoardId);
  const dispatch = useDispatch();
  const { userId } = useSelector((x) => x.userCredentials);

  useEffect(() => {
    setBoardid(BoardId);
  }, [BoardId]);

  const [isMenuOpen, setMenuOpen] = useState(true);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const queryClient = useQueryClient();
  const { data: byBoard } = useQuery(
    ["GetBoartsInWorkspace", workspaceId ? workspaceId : undefined, userId ? userId : undefined],
    () => getbyWokrspaceInBoard(userId, workspaceId),
    { enabled: !!workspaceId && !!userId }
  );

  const { mutate: deleteBoardMutation } = useMutation(
    (data) => getDeletebyId(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("GetBoartsInWorkspace");
        queryClient.invalidateQueries("worspacedata");
        toast.success("Deleted!")
      },
      onError:() =>{
        toast.error("No Access!")
      }
    }
  );

  const { mutate: updateBoradMutation } = useMutation(
    () => UpdateBoard(BoardUpdateFomik.values),
    {
      onSuccess: (values) => {
        window.location.reload();
        toast.success("Updated!")
      },
      onError:() =>{
        toast.error("No Access!")
      }
    }
  );

  const onCloseUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  const handleUpdate = () => {
    if (BoardUpdateFomik.values.title === "") {
    } else {
      updateBoradMutation();
      onCloseUpdateModal();
    }
  };

  const handleSubmit = () => {
    const data = {
      AppUserId: userId,
      boardId: BoardId,
      workspaceId: workspaceId,
    };
    deleteBoardMutation(data);
    onClose();
  };

  const handleImageClick = (index) => {
    const themeNumber = index + 1;
    BoardUpdateFomik.setFieldValue('theme', themeNumber.toString());
    setSelectedImageIndex(themeNumber - 1);
  };

  const BoardUpdateFomik = useFormik({
    initialValues: {
      title: "",
      BoardId: '',
      appUserId: userId,
      theme: ""
    },
    onSubmit: (values) => {
      if (values.title === "") {
      } else {
        values.boardId = BoardId;
        values.appUserId = userId;
        UpdateBoard(values);

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
const navigate = useNavigate()
  const HandeSellect = (data) => {
    dispatch(setData({ BoardId: data }));
    navigate(`/Boards/${data}`)
    setImage(byBoard.data.find(board => board.id === data)?.theme);
    queryClient.refetchQueries("BoardInCardList");
    queryClient.removeQueries("BoardInCardList");
  };

  useEffect(() => {
    dispatch(setData({ BoardId: id }));
    const selectedBoard = byBoard?.data.find(board => board.id === id);
    if (selectedBoard) {
      setImage(selectedBoard.theme);
    }
  }, [id, byBoard?.data]);

  return (
    <>
    <ToastContainer />
      <Col style={{ minWidth: isMenuOpen && "300px" }} className={[Styles.sideBarMenuWrapper, isMenuOpen ? "col-2" : ""]}>
        {isMenuOpen ? (
          <Col className={[Styles.sideBarMenu, isMenuOpen ? "col-lg-12" : ""]}>
            <div>
              <Container className={[Styles.sideBarMenuWorkspaceName, "justify-content-between px-3 align-items-center"]} fluid>
                <span className="d-flex align-items-center">
                  <Image className={Styles.workspacePic} src={`https://placehold.co/512x512/d9e3da/1d2125?text=${currentWorkspace?.slice(0, 1)}`} rounded />
                  <p className="m-0 ms-2 fw-bold">{currentWorkspace} </p>
                </span>
                <button onClick={() => setMenuOpen(false)} className={"btn btn-primary default-submit"}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              </Container>
              <Container className={[Styles.sideBarMenuWorkspace, "mt-2"]} fluid>
                <div className="ms-1">
                </div>

                <Card.Text className="mx-1 my-1 p-0 container-fluid"> Your Boards </Card.Text>
                {Array.isArray(byBoard?.data) && byBoard?.data?.length ? (
                  byBoard.data.map((board, index) => {
                    return (
                      <NavDropdown.Item key={index}>
                        <Container onClick={() => { setImage(board.theme); HandeSellect(board.id); }} className="p-0 m-0 navbar-workspace-link">
                          <Row className="px-0 my-2 d-flex align-items-center rounded-0">
                            <ChakraProvider>
                              <Flex  align={'center'} justify={'space-between'} gap={2}>
                                <Flex align={'center'} justify={'flex-start'} gap={2}>
                                  <Col style={{ width: "20px" }} lg={3}>
                                    <Image className="workspace-pic" src={`https://placehold.co/512x512/d9e3da/1d2125?text=${board?.title?.toUpperCase().slice(0, 1)}`} />
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
                                      BoardUpdateFomik.setFieldValue("BoardId", board.id);
                                      BoardUpdateFomik.setFieldValue("workspaceId", workspaceId);
                                      setSelectedImageIndex(images.indexOf(board.theme)); // Set the selected image index for the update modal
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
            <button onClick={() => setMenuOpen(true)} className="btn btn-primary default-submit m-2 mt-4">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </Col>
        )}
      </Col >
      <ChakraProvider>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent className={Styles.DeleteModal}>
            <ModalHeader>Delete Board</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this board?
            </ModalBody>
            <ModalFooter gap={2}>
              <Button style={{ backgroundColor: "red", border: "transparent 1px solid" }} mr={3} onClick={() => handleSubmit()}>
                Yes
              </Button>
              <Button className={Styles.DeleteButton} variant='ghost' onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isUpdateModalOpen} onClose={onCloseUpdateModal}>
          <ModalOverlay />
          <ModalContent className={Styles.DeleteModal}>
            <ModalHeader>Update Board</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Board Title</FormLabel>
                <Input name="title" onChange={BoardUpdateFomik.handleChange} placeholder={"Board Title"} />
              </FormControl>
              <FormLabel className={Styles.BoardTitle} htmlFor="BoardTitle">Background</FormLabel>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", cursor: "pointer" }}>
                {images.map((value, index) => (
                  <img
                    onClick={() => handleImageClick(index)}
                    style={{
                      borderRadius: "4px",
                      width: "41px",
                      height: "31px",
                      border: selectedImageIndex === index ? '2px solid #579dff' : '2px solid transparent'
                    }}
                    src={value}
                    alt={`image-${index}`}
                    key={index}
                  />
                ))}
              </div>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
                Save Changes
              </Button>
              <Button variant='ghost' onClick={onCloseUpdateModal} className={Styles.DeleteButton}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>
    </>
  );
}
