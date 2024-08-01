import React, { useEffect, useState } from 'react';
import Styles from './Checklist.module.css';
import {
    Flex, Progress, Text, Button, useDisclosure, Modal,
    ModalOverlay, ModalContent, ModalHeader, ModalFooter,
    ModalBody, ModalCloseButton, Input, ChakraProvider,
    CircularProgress
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import { CheckItemUpdate, CreateChecklistitem, DeleteChecklist, DeleteChecklistItem, UpdateChecklist, UpdateChecklistItem, UpdateCheklistItemTitle } from '../../Service/CheckListService';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';

export default function Checklist({ data, Refetch }) {
    const queryClient = useQueryClient();
    const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
    const { userId } = useSelector((x) => x.userCredentials);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenChecklist, onOpen: onOpenChecklist, onClose: onCloseChecklist } = useDisclosure();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [editedText, setEditedText] = useState("");
    const [deletingItemId, setDeletingItemId] = useState(null);
    const { mutate: deleteChecklistItemMutation } = useMutation(
        (itemId) => DeleteChecklistItem(deletingItemId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("getAllCheklist");
                queryClient.invalidateQueries("ChecklistCount");
                onCloseChecklist();  // Close the modal after deletion

            },
            onError: (error) => {
                toast.error("Failed to delete checklist item.");
                console.error("Delete checklist item error:", error);
            }
        }
    );

    const handleCheckboxChange = (id, isChecked) => {
        updateCheckItemMutation({ id, newState: isChecked });
    };

    const { mutate: updateCheckItemMutation, isLoading } = useMutation(
        ({ id, newState }) => CheckItemUpdate(id, newState, userId, workspaceId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("getAllCheklist");
                queryClient.invalidateQueries("boardData");
            },
            onError: (error) => {
                toast.error("Failed to update checklist item.");
                console.error("Update error:", error);
            }
        }
    );
    const handleDeleteChecklistItem = (id) => {
        setDeletingItemId(id)
        onOpenChecklist();
    };
    const handleDelete = (event) => {
        event.stopPropagation();
        setIsDeleting(true);
        onOpen();
    };

    const confirmDelete = () => {
        deleteChecklist();
    };

    const { mutate: deleteChecklist } = useMutation(
        () => DeleteChecklist(data?.id, userId, workspaceId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("getAllCheklist");
                onClose();
            },
            onError: (err) => {
                console.error(err);
                toast.error("No Access!");
                onClose();
            },
        }
    );

    const formik = useFormik({
        initialValues: {
            text: "",
            checklistId: data?.id,
        },
        onSubmit: async (values, { resetForm }) => {
            await AddChecklistItemMutation(values);
            setShowAddItem(false);
            resetForm();
        },
    });

    const { mutate: AddChecklistItemMutation, isLoading: isAddingItem } = useMutation(
        (values) => CreateChecklistitem(values),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("getAllCheklist");
                queryClient.invalidateQueries("boardData");
                formik.resetForm();
            },
            onError: (err) => {
                console.error(err);
            },
        }
    );
    // Edit Check item Title
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editingItemId, setEditingItemId] = useState(null);

    const handleTitleClick = (item) => {
        setIsEditing(true);
        setEditingItemId(item.id);
        setEditedTitle(item.text);
    };

    const handleInputChange = (e) => {
        setEditedTitle(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const initialValues = {
            id: editingItemId,
            title: editedTitle,
            userId: userId,
            workspaceId: workspaceId
        };
        UpdateCheklistTitleMutation(initialValues);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };
    const { mutate: UpdateCheklistTitleMutation } = useMutation(
        (MutationData) => { UpdateChecklistItem(MutationData); },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['getAllCheklist'] }, data.id);
                setEditingItemId(null);
                Refetch(data.id)
            },
            onError: (err) => {
                toast.error(`Error: ${err.message || "No Access!"}`);
                setEditingItemId(null);
                toast.success('No Access!')
            },
        }
    );
    // Edit CheckList Title
    const [isEditing2, setIsEditing2] = useState(false);
    const [editedTitle2, setEditedTitle2] = useState("");
    const [editingItemId2, setEditingItemId2] = useState(null);

    const handleTitleClick2 = (item) => {
        setIsEditing2(true);
        setEditingItemId2(item.id);
        setEditedTitle2(item.name);
    };

    const handleInputChange2 = (e) => {
        setEditedTitle2(e.target.value);
    };

    const handleInputBlur2 = () => {
        setIsEditing2(false);
        const initialValues = {
            id: editingItemId2,
            title: editedTitle2,
            userId: userId,
            workspaceId: workspaceId
        };
        UpdateCheklistTitleMutation2(initialValues);
    };

    const handleKeyPress2 = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur2();
        }
    };
    const { mutate: UpdateCheklistTitleMutation2 } = useMutation(
        (MutationData) => { UpdateChecklist(MutationData); },
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['getAllCheklist'] }, data.id);
                setEditingItemId2(null);
                Refetch(data.id)
            },
            onError: (err) => {
                toast.error(`Error: ${err.message || "No Access!"}`);
                setEditingItemId2(null);
                toast.success('No Access!')
            },
        }
    );
    return (
        <div>
            <div className={Styles.TitleContainer}>
                <Flex flexDir={'column'} className={Styles.Main}>
                    <Flex align={'center'} justifyContent={'space-between'}>
                        <Flex gap={2} align={'center'}>
                            <span style={{ color: "#9fadbc", fontSize: "23px", position: "relative" }} className="material-symbols-outlined">
                                check_box
                            </span>
                            {isEditing2 && editingItemId2 === data.id ? (
                                <input
                                    type="text"
                                    value={editedTitle2}
                                    onChange={handleInputChange2}
                                    onBlur={handleInputBlur2}
                                    onKeyPress={handleKeyPress2}
                                    className={Styles.Input}
                                    autoFocus
                                />
                            ) : (
                                <h1 onClick={() => handleTitleClick2(data)} className={Styles.ListTitle}>{data?.name}</h1>
                            )}
                        </Flex>
                        <button type='button' className={Styles.Button} onClick={handleDelete}>
                            Delete
                        </button>
                    </Flex>
                    <div>
                        <Flex p={"15px 0px"} gap={5} alignItems={"center"}>
                            <Text style={{ color: "#9fadbc" }} fontSize={14} m={0}>
                                {data?.checkPercentage}%
                            </Text>
                            <Progress borderRadius={5} h={2} w={"100%"} value={data?.checkPercentage} />
                        </Flex>
                        <ChakraProvider>
                            {data?.getCheckitemDtos?.map((item) => (
                                <>
                                    <Flex justifyContent={'space-between'} key={item.id} alignItems={'center'}>
                                        <Flex key={item.id} alignItems={'center'}>
                                            <input
                                                type="checkbox"
                                                checked={item.check}
                                                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                                            />
                                            {editingItemId === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editedTitle}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    onKeyPress={handleKeyPress}
                                                    className={Styles.Input}
                                                    autoFocus
                                                />
                                            ) : (
                                                <Text
                                                    onClick={() => handleTitleClick(item)}
                                                    className={Styles.ChecklistTitle}
                                                    userSelect={"none"}
                                                    borderRadius={10}
                                                    cursor={"pointer"}
                                                    w={"100%"}
                                                    m="0"
                                                    p={"6px 12px"}
                                                    _hover={{
                                                        background:
                                                            "var(--ds-background-neutral, #A1BDD914)",
                                                    }}
                                                >
                                                    {item.text}
                                                </Text>
                                            )}
                                        </Flex>
                                        <span onClick={() => { handleDeleteChecklistItem(item.id) }} style={{ color: "#9fadbc", cursor: 'pointer' }} className="material-symbols-outlined">
                                            more_horiz
                                        </span>

                                    </Flex>
                                </>
                            ))}
                            <Modal isOpen={isOpenChecklist} onClose={onCloseChecklist} >
                                <ModalOverlay />
                                <ModalContent style={{ color: '#9fadbc', backgroundColor: "#22272B" }}>
                                    <ModalHeader>Delete Checklist item</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        Are you sure you want to delete this checklist item?
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button colorScheme='red' mr={3} onClick={() => { deleteChecklistItemMutation() }}>
                                            Delete
                                        </Button>
                                        <Button onClick={onCloseChecklist}>Cancel</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal >
                        </ChakraProvider>
                        {!showAddItem && (
                            <Button m={"10px 0 !important"} isLoading={isAddingItem} className={Styles.Button} onClick={() => setShowAddItem(true)} style={{ margin: "20px 10px" }}>
                                Add an item
                            </Button>
                        )}

                        {showAddItem && (
                            <Flex p={"13px 10px"} m={"0 0 10px"} backgroundColor={"#24282b"} borderRadius={5} gap={2} flexDir={"column"} w={"100%"}>
                                <Input
                                    backgroundColor={"#22272B"}
                                    border={"#579DFF 1px solid"}
                                    w={"100%"}
                                    color={"white"}
                                    placeholder="Add an Item"
                                    onChange={formik.handleChange}
                                    value={formik.values.text}
                                    name="text"
                                />
                                <Flex justifyContent={"space-between"} alignItems={"center"}>
                                    <Button className={Styles.Button2} onClick={() => { formik.setFieldValue('checklistId', data?.id); formik.handleSubmit(); }} colorScheme="blue">
                                        Add
                                    </Button>
                                    <Button className={Styles.Button2} onClick={() => setShowAddItem(false)} colorScheme="gray">
                                        Cancel
                                    </Button>
                                </Flex>
                            </Flex>
                        )}
                    </div>
                </Flex>
            </div >
            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent style={{ color: '#9fadbc', backgroundColor: "#22272B" }}>
                    <ModalHeader>Delete Checklist</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete this checklist?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme='red' mr={3}
                            disabled={isLoading}
                            isLoading={isLoading} onClick={() => confirmDelete()}>
                            {isLoading ? <CircularProgress isIndeterminate size="24px" color="#579dff" /> : "Delete"}
                        </Button>
                        <Button isLoading={isLoading} onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </div >
    );
}