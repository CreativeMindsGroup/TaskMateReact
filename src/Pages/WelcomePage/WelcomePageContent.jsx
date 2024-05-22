import React, { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import NavDropdown from "react-bootstrap/NavDropdown";
import Styles from './WelcomePageContent.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import CustomModal from '../../Components/CustomModal/CustomModal';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { GetWorkSpaceById, GetAllWorkspaces } from '../../Service/WorkSpaceService';
import { useSelector } from 'react-redux';
import { CreateBoard, getbyWokrspaceInBoard } from '../../Service/BoardService';
import { useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import jwtDecode from "jwt-decode";
import { ChakraProvider, Divider, Flex, Menu, MenuButton, MenuList, useDisclosure } from '@chakra-ui/react';
import Dvider from '../../Components/Dvider';
import { Container } from '@chakra-ui/react'
import * as Yup from 'yup'
import { useFormik } from 'formik';
import Button from "react-bootstrap/Button";
import image1 from '../../Images/1.jpg'
import image2 from '../../Images/2.jpg'
import image3 from '../../Images/3.jpg'
import image4 from '../../Images/4.jpg'
import image5 from '../../Images/5.jpg'
import image6 from '../../Images/6.jpg'

export default function WelcomePageContent() {
    const [modalShow, setModalShow] = useState(false);
    const [Data, setData] = useState()
    const [Render, setRender] = useState();
    const { workspaceId, BoardId } = useSelector((x) => x.Data)
    const { userId } = useSelector((x) => x.auth)
    const [showAlert, setShowAlert] = useState(false);
    const [showAlert2, setShowAlert2] = useState(false);
    const images = [image1, image2, image3, image4, image5, image6]
    const { token } = useSelector((x) => x.auth);
    const decodedToken = token ? jwtDecode(token) : null;
    const userId2 = decodedToken
        ? decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]
        : null;
    const queryClient = useQueryClient();
    const Navigate = useNavigate()
    const cleanURL = () => {
        const cleanURL = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanURL);
    };
    useEffect(() => {
        cleanURL();
    }, []);
    const updateParentState = (modalShow) => {
        setModalShow(modalShow);
    };

    const {
        isOpen: isBoardOpen,
        onOpen: onBoardOpen,
        onClose: onBoardClose,
    } = useDisclosure();

    const { data: BoardData, isSuccess, refetch } = useQuery(
        ["GetBoartsInWorkspace", workspaceId ? workspaceId : undefined, userId2 ? userId2 : undefined],
        () => getbyWokrspaceInBoard(userId2, workspaceId),
        { enabled: !!workspaceId && !!userId2 }
    );
    const { data: GetWorkspaceById } = useQuery(
        ["GetWorkspaceById", workspaceId],
        () => GetWorkSpaceById(workspaceId)
    );

    const { data: userWorkspace } = useQuery(
        ["GetAllworkspaces", userId2 ? userId2 : undefined],
        () => GetAllWorkspaces(userId2),
        { enabled: !!userId2 }
    );

    useEffect(() => {
        queryClient.invalidateQueries("Boards");
        queryClient.invalidateQueries("GetWorkspaceById");
    }, [Render, workspaceId]);

    const CreateBoardFormik = useFormik({
        initialValues: {
            title: "",
            workspaceId: "",
            appUserId: userId2,
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

    return (
        // <div className={Styles.Main} >
        //     {BoardData ? "" :
        //     <div className={Styles.notFound}>
        //         <p >No boards aviable</p>
        //     </div>
        //     }
        // </div>
        <div style={{ overflowY: 'hidden', minHeight: '95vh', width: "100%", padding: "20px", }}>
            {userWorkspace && userWorkspace?.data?.length > 0 ? (
                GetWorkspaceById?.data && (
                    <div style={{ color: '#b6c2cf' }} className={Styles.contentWrapper}>
                        <div className={Styles.contentTopNavBar}>
                            <Flex maxW={1200} margin={"auto"} align={'top'} justify={'space-between'}>
                                <Flex flexDir={'column'}>
                                    <div className='d-flex align-items-center'>
                                        <Image style={{ width: "60px", borderRadius: "5px" }} className='workspace-pic' src={`https://placehold.co/512x512/d9e3da/1d2125?text=${GetWorkspaceById?.data?.title?.toUpperCase().slice(
                                            0,
                                            1
                                        )}`} rounded />
                                        <span className='ms-3'>
                                            <h3 className='m-0'>{GetWorkspaceById?.data?.title}</h3>
                                        </span>
                                    </div>
                                    <p style={{ padding: '7px 0', margin: '0' }}>{GetWorkspaceById?.data?.description}</p>
                                </Flex>
                                <button className={Styles.InviteButton} >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 -960 960 960" width="24px" fill="#ffff"><path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-360-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z" /></svg>
                                    Invite Workspace members</button>
                            </Flex>
                        </div>
                        <Dvider color="rgb(159 173 188 / 24%)" m={"32px 0"} />
                        <Container maxW={1200} margin={"auto"} className={Styles.contentMain}>
                            <h4 style={{ fontWeight: 600 }} className="m-0 mb-3 "><FontAwesomeIcon className='me-1' icon={faUser} /> Your Boards</h4>
                            <Flex flexWrap={"wrap"} maxW={1200} margin={"auto"} gap={20}>

                                <Menu isOpen={isBoardOpen} onOpen={onBoardOpen} onClose={onBoardClose}>
                                    <MenuButton>
                                        <Card style={{ height: "110px" }} className={Styles.BoardCardCreate}>
                                            <Card.Title className={Styles.BoardTitleCreate}>Create new board</Card.Title>
                                        </Card>
                                    </MenuButton>
                                    <MenuList zIndex={2} border={"1px solid #dfe1e61c"} borderRadius={"4px"} minW={"300px"} backgroundColor={"#282e33"}>
                                        <div className={Styles.CreateBoardContainer}>
                                            <div className={Styles.CreateboardHeader}>
                                                <span onClick={onBoardClose} style={{ fontSize: '14px', cursor: "pointer" }} className="material-symbols-outlined">arrow_back_ios</span>
                                                <p>Create board</p>
                                                <span onClick={() => { onBoardClose(); }} style={{ fontSize: '18px', cursor: "pointer" }} className="material-symbols-outlined">close</span>
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
                                                    {userWorkspace?.data?.map((workspace, index) => (
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

                                {Array.isArray(BoardData?.data) && BoardData?.data?.length ? (
                                    BoardData.data.map((board, index) => {
                                        return (
                                            <Card
                                                onClick={() => Navigate(`/Boards/${board.id}`)}
                                                key={index}
                                                style={{
                                                    backgroundImage: `url(/Images/${board.theme}.jpg)`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center', 
                                                    backgroundRepeat: 'no-repeat',
                                                    height:"110px"
                                                }}
                                                className={Styles.BoardCard}>
                                                <Card.Title className={Styles.BoardCardTitle}>{board.title}</Card.Title>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <NavDropdown.Item>No boards available</NavDropdown.Item>
                                )}
                            </Flex>
                        </Container>
                    </div>
                )
            ) : (
                <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <NavDropdown.Item style={{ fontSize: '20px', color: 'white', padding: '30px', paddingLeft: '44%', paddingTop: '15%' }}>Board not found.</NavDropdown.Item>
                </Container>
            )
            }
            <CustomModal
                type={'delete'}
                object={'workspace'}
                message={'Are you sure you want to delete this workspace?'}
                title={'Delete Workspace'}
                show={modalShow}
                updateParentState={updateParentState}
            />
        </div >
    )
}
