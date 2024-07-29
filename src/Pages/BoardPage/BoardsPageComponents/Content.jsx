import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Styles from '../../../Components/SideBarMenu/SideBarMenu.module.css';
import CardList from '../CardList/CardList';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getBoardById } from '../../../Service/BoardService';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router';
import { ArchiveCard, GetArchivedCards, RemoveCard } from '../../../Service/CardService';
import { Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, ChakraProvider, Alert, AlertIcon, FormLabel, Input, FormControl, Flex } from '@chakra-ui/react'
import { toast } from 'react-toastify';
export default function Content() {
    const [filterData, setFilterData] = useState();
    const { userId } = useSelector((x) => x.userCredentials);
    const queryClient = useQueryClient()
    const { BoardId: boardId } = useParams()
    const { data: Data, isLoading, error, isSuccess } = useQuery(
        ["boardData", boardId],
        () => getBoardById(boardId),
        {
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );
    const { data: archivedCards } = useQuery(
        ["GetArhivedCards", boardId],
        () => GetArchivedCards(boardId),
        {
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            cacheTime: 1000
        }
    );
    const [boardData, setBoardData] = useState()
    useEffect(() => {
        if (Data && isSuccess) {
            setBoardData(Data);
        }
    }, [Data, isSuccess]);
    const formik = useFormik({
        initialValues: {
            title: '',
            option: '',
        },
        onSubmit: (values) => {
            setFilterData(values);
        },
    });
    const { workspaceId } = useSelector((x) => x.workspaceAndBoard)
    const navigate = useNavigate()

    //arhive
    //Archive Data
    const ArchiveFormik = useFormik({
        initialValues: {
            isArchived: false,
            cardId: '',
            adminId: userId,
            workspaceId: workspaceId
        },
        onSubmit: async (values) => {
            ArchiveMutation(values);
        },
    });

    const { mutate: ArchiveMutation } = useMutation(
        (data) => ArchiveCard(data),
        {
            onSuccess: () => {
                toast.success("Archived")
                queryClient.invalidateQueries("boardData");
                queryClient.invalidateQueries("GetArhivedCards");

            },
            onError: (err) => {
                toast.error(`Error: ${err.message || "No Access!"}`);
            },
        }
    );
    //Delete card 
    //remove card Formik 
    const confirmDelete = (id) => {
        RemoveCardMutation(id);
    };
    const { mutate: RemoveCardMutation } = useMutation(
        (cardId) => RemoveCard(cardId, userId, workspaceId),
        {
            onSuccess: () => {
                toast.success("Card deleted !")
                 queryClient.invalidateQueries("GetArhivedCards");
                 queryClient.invalidateQueries("boardData");
            },
            onError: (err) => {
                toast.error("No Access!")
            },
        }
    );
    return (
        <div className={Styles.MainContainer} style={{ overflow: 'hidden' }}>
            <Col lg={12} className={Styles.sideBarMenuTopMenuWrapper}>
                <Container fluid className={[Styles.sideBarMenuTopMenu, "flex-wrap flex-column flex-md-row"]}>
                    <div className='d-flex align-items-center col-8 col-md-6 justify-content-start'>
                        <h5 id='boardName' className={Styles.boardName}>Board : {boardData?.data?.title}</h5>
                        <div id="workspace-privacy-dropdown-wrapper" className={Styles.workspacePrivacyDropdownWrapper}>
                        </div>
                    </div>

                    <div className='d-flex align-items-center col-8 col-md-6 justify-content-start justify-content-md-end'>
                        <div className={Styles.workspacePrivacyDropdownWrapper}>
                            <DropdownButton className={Styles.workspacePrivacyDropdown} title="Filters">
                                <div className={Styles.ContentDropdown}>
                                    <form onSubmit={formik.handleSubmit}>
                                        <Flex alignItems={'center'} justifyContent={"center"}>
                                            <h1 className={Styles.FilterMenuHeader}>
                                                Filter
                                            </h1>
                                        </Flex>
                                        <Flex flexDir={'column'}>
                                            <h1 className={Styles.FilterMenuHeader}>Keyword</h1>
                                            <input
                                                className={Styles.FilterInput}
                                                type="text"
                                                value={formik.values.title}
                                                onChange={formik.handleChange}
                                                name='title'
                                            />
                                            <p className={Styles.FilterDesc}>Search cards, members, labels, and more.</p>
                                        </Flex>
                                        <Flex flexDir={'column'}>
                                            <h1 className={Styles.FilterMenuHeader}>Labels</h1>
                                            <select
                                                style={{ padding: "9px 10px" }}
                                                className={Styles.FilterInput}
                                                value={formik.values.option}
                                                onChange={formik.handleChange}
                                                name='option'
                                            >
                                                <option className={Styles.label} value=""></option>
                                                <option className={Styles.label} value="option1">Option 1</option>
                                                <option className={Styles.label} value="option2">Option 2</option>
                                                <option className={Styles.label} value="option3">Option 3</option>
                                            </select>
                                            <button type='submit' onChange={formik.handleSubmit} className={Styles.FilterButton}>
                                                Filter
                                            </button>
                                        </Flex>
                                    </form>
                                </div>
                            </DropdownButton>
                        </div>
                        <div className={Styles.workspacePrivacyDropdownWrapper}>
                            <DropdownButton className={Styles.workspacePrivacyDropdown} title="Menu">
                                <div className={Styles.ContentDropdown}>
                                    <form onSubmit={formik.handleSubmit}>
                                        <Flex alignItems={'center'} justifyContent={"center"}>
                                            <h1 className={Styles.FilterMenuHeader}>
                                                Archived Cards
                                            </h1>
                                        </Flex>
                                        <Flex flexDir={'column'} gap={5} p={'15px 0'}>
                                            {archivedCards?.data?.length > 0 ? (
                                                archivedCards?.data?.map((card, index) => (
                                                    <>
                                                        <div key={index} className={Styles.ArchivedCardItem}>
                                                            <Flex align={'center'} justifyContent={'space-between'}>
                                                                <div>
                                                                    <p className={Styles.ArchivedCardtitle}>Card name : <b>{card.title}</b></p>
                                                                    <Flex gap={5} align={'center'}>
                                                                        <span style={{ fontSize: "17px" }} className="material-symbols-outlined">
                                                                            inventory_2
                                                                        </span>
                                                                        <p className={Styles.ArchivedText}>Archived</p>
                                                                    </Flex>
                                                                </div>
                                                                <Menu>
                                                                    <MenuButton bgColor={'transparent'}>
                                                                        <FontAwesomeIcon icon={faEllipsis} />
                                                                    </MenuButton>
                                                                    <MenuList w={"200px"} border={"#616466 1px solid"} borderRadius={4} pb={2} pt={2} gap={10} bgColor={'#1d2125'}>
                                                                        <MenuItem type='submit' onClick={() => { ArchiveFormik.setFieldValue("cardId", card.id); ArchiveFormik.handleSubmit() }} backgroundColor={"transparent"} _hover={{ backgroundColor: "#616466" }} p={"0px 12px"}>Unarchive card</MenuItem>
                                                                        <MenuItem type='submit' onClick={()=>{confirmDelete(card.id)}} backgroundColor={"transparent"} _hover={{ backgroundColor: "#616466" }} p={"0px 12px"}>Remove card</MenuItem>
                                                                    </MenuList>
                                                                </Menu>
                                                            </Flex>
                                                        </div>
                                                    </>
                                                ))
                                            ) : (
                                                <div>No archived cards found.</div>
                                            )}
                                        </Flex>
                                    </form>
                                </div>
                            </DropdownButton>
                        </div>
                        <div className={Styles.profilesWrapper}>
                            <Button onClick={() => navigate(`/members/${workspaceId}`)} className={Styles.shareButton}><FontAwesomeIcon icon={faUserPlus} />Share</Button>
                        </div>
                    </div>
                </Container>
            </Col>
            <Col lg={12} >
                <CardList boardData={boardData?.data} />
            </Col>
            <div>
            </div>
        </div>
    )
}
