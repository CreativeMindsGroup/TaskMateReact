import React, { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import NavDropdown from "react-bootstrap/NavDropdown";
import Style from '../../../Components/HomePageSideBarMenu/HomePageSideBarMenu.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser, faBoxArchive } from '@fortawesome/free-solid-svg-icons';
import CustomModal from '../../../Components/CustomModal/CustomModal';
import { useQuery, useQueryClient } from 'react-query';
import { GetWorkSpaceById, GetAllWorkspaces } from '../../../Service/WorkSpaceService';
import { useSelector } from 'react-redux';
import { getbyWokrspaceInBoard } from '../../../Service/BoardService';
import { useNavigate } from 'react-router';
import { Container, Form } from 'react-bootstrap';
import jwtDecode from "jwt-decode";
import { Flex } from '@chakra-ui/react';
import { checkIsAdmin } from "../../../Service/AuthService";

export default function Content() {
    const [modalShow, setModalShow] = useState(false);
    const [Data, setData] = useState()
    const [Render, setRender] = useState();
    const { workspaceId, userId, refresh, BoardId } = useSelector((x) => x.Data)
    const { token } = useSelector((x) => x.auth);
    const decodedToken = token ? jwtDecode(token) : null;
    const userId2 = decodedToken
        ? decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]
        : null;
    useEffect(() => {
        setRender(refresh);
    }, [refresh]);
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

    const { data: byBoard, isSuccess, refetch } = useQuery(
        ["GetBoartsInWorkspace", workspaceId ? workspaceId : undefined, userId2 ? userId2 : undefined],
        () => getbyWokrspaceInBoard(userId2, workspaceId),
        { enabled: !!workspaceId && !!userId2 }
    );
    // const { mutate: GetBoardsById } = useMutation((values) =>
    //     getbyWokrspaceInBoard(values), {
    //     onSuccess: async (response) => {
    //         await setBoards(response.data)
    //     },
    //     onError: (error) => {
    //         console.log(error);
    //     }
    // })
    const { data: GetWorkspaceById } = useQuery(
        ["GetWorkspaceById", workspaceId],
        () => GetWorkSpaceById(workspaceId)
    );

    const { data: userWorkspace } = useQuery(
        ["UserWorkspace", userId2 ? userId2 : undefined],
        () => GetAllWorkspaces(userId2),
        { enabled: !!userId2 }
    );

    useEffect(() => {
        queryClient.invalidateQueries("Boards");
        queryClient.invalidateQueries("GetWorkspaceById");
    }, [Render, workspaceId]);

    const { data: isAdmin } = useQuery(["IsAdmin", userId], () =>
        checkIsAdmin(userId)
    );


    return (
        <div className='w-100' style={{ overflowY: 'hidden', minHeight: '95vh' }}>
            {userWorkspace && userWorkspace.data.length > 0 ? (
                GetWorkspaceById?.data && (
                    <div style={{ color: '#b6c2cf' }} className={Style.contentWrapper}>
                        <div className={Style.contentTopNavBar}>
                            <Flex flexDir={'column'}>
                                <div className='d-flex align-items-center'>
                                    <Image className='workspace-pic' src={`https://placehold.co/512x512/d9e3da/1d2125?text=${GetWorkspaceById?.data?.title.slice(
                                        0,
                                        1
                                    )}`} rounded />
                                    <span className='ms-3'>
                                        <h2 className='m-0'>{GetWorkspaceById?.data?.title}</h2>
                                        <p className="small m-0"><FontAwesomeIcon className='me-1' icon={faLock} /> Private</p>
                                    </span>
                                </div>
                                <p style={{ padding: '0', margin: '0' }}>{GetWorkspaceById?.data?.description}</p>
                            </Flex>
                        </div>
                        <div className={Style.contentMain}>
                            <h5 className="m-0 mb-3"><FontAwesomeIcon className='me-1' icon={faUser} /> Your Boards</h5>
                            <div className='d-flex flex-wrap col-12'>
                                {Array.isArray(byBoard?.data) && byBoard.data.length ? (
                                    byBoard.data.map((board, index) => {
                                        return (
                                            <Card onClick={() => Navigate(`/Boards/${board.id}`)} key={index} style={{ height: "110px" }} className="bg-dark text-white col-2 rounded me-2 mb-2 board-overlay-card">
                                                <Card.Img src="https://picsum.photos/id/46/1920/1080.jpg" style={{ height: "110px" }} className='rounded board-overlay-image' alt="Card image" />
                                                <Card.ImgOverlay className='board-overlay-title'>
                                                    <Card.Title className='fw-bold'>{board.title}</Card.Title>
                                                </Card.ImgOverlay>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <NavDropdown.Item>No boards available</NavDropdown.Item>
                                )}
                                {/* Yuxari hissede boards eger 1 den coxsursa map edir */}
                                {/* css  deyisliklik */}
                                {/* <Card style={{ height: "110px" }} className=" bg-dark text-white col-2 rounded me-3 board-overlay">
                                <Card.ImgOverlay className='board-overlay-title d-flex justify-content-center align-items-center'>
                                    <Card.Title className='fw-bold m-0 fs-6'>Create new board</Card.Title>
                                </Card.ImgOverlay>
                            </Card> */}
                            </div>
                        </div>
                        {/* <Dropdown.Item
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
                                                        <option value={ALlworkspaces?.data?.[0]?.id}>
                                                            {ALlworkspaces?.data?.[0]?.title}
                                                        </option>
                                                        {ALlworkspaces?.data?.slice(1).map((workspace, index) => (
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
                                                    <Form.Select aria-label="Default select example">
                                                        <option value="1">Workspace</option>
                                                        <option value="2">Private</option>
                                                        <option value="3">Public</option>
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
                                </Card.Body>
                            </div>
                        </Card>
                    </Dropdown.Item> */}
                    </div>
                )
            ) : (
                <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <NavDropdown.Item style={{ fontSize: '20px', color: 'white', padding: '30px', paddingLeft: '44%', paddingTop: '15%' }}>Board not found.</NavDropdown.Item>
                    <NavDropdown.Item style={{ fontSize: '20px', color: 'white', width: 'auto' }}>This board may be private. If someone gave you this link, they may need to</NavDropdown.Item>
                    <NavDropdown.Item style={{ fontSize: '20px', color: 'white', width: 'auto' }}>share the board with you or invite you to their Workspace.</NavDropdown.Item>
                    <p style={{ fontSize: '20px', color: 'white', paddingTop: '60px' }}>Not Brinsley Blackwood? Switch accounts</p>
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
