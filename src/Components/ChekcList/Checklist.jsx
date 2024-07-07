import React, { useEffect, useState } from 'react';
import Styles from './Checklist.module.css';
import {
    Flex, Progress, Text, Button, useDisclosure, Modal,
    ModalOverlay, ModalContent, ModalHeader, ModalFooter,
    ModalBody, ModalCloseButton, Input, ChakraProvider,
    CircularProgress
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import { CheckItemUpdate, CreateChecklistitem, DeleteChecklist, DeleteChecklistItem } from '../../Service/CheckListService';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';

export default function Checklist({ data }) {
    const queryClient = useQueryClient();
    const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
    const { userId } = useSelector((x) => x.userCredentials);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenChecklist, onOpen: onOpenChecklist, onClose: onCloseChecklist } = useDisclosure();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [checkboxes, setCheckboxes] = useState({});

    const { mutate: deleteChecklistItem } = useMutation(
        (itemId) => DeleteChecklistItem(itemId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("getAllCheklist");
                queryClient.invalidateQueries("ChecklistCount");
                toast.success("Checklist item deleted successfully!");
                onCloseChecklist();  // Close the modal after deletion

            },
            onError: (error) => {
                toast.error("Failed to delete checklist item.");
                console.error("Delete checklist item error:", error);
            }
        }
    );

    const handleCheckboxChange = (id, isChecked) => {
        updateCheckItem({ id, newState: isChecked });
    };
    const { mutate: updateCheckItem, isLoading } = useMutation(
        ({ id, newState }) => CheckItemUpdate(id, newState),
        {
            onSuccess: () => {
                toast.success("Checklist item updated successfully!");
                queryClient.invalidateQueries("getAllCheklist");
                queryClient.invalidateQueries("ChecklistCount");
            },
            onError: (error) => {
                toast.error("Failed to update checklist item.");
                console.error("Update error:", error);
            }
        }
    );
    const handleDelete = (event) => {
        event.stopPropagation();
        setIsDeleting(true);
        onOpen();
    };

    const confirmDelete = () => {
        deleteChecklist();
    };

    const { mutate: deleteChecklist } = useMutation(
        () => DeleteChecklist(data.id, userId, workspaceId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("getAllCheklist");
                toast.success("Deleted");
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
            checklistId: data.id,
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
                formik.resetForm();
            },
            onError: (err) => {
                console.error(err);
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
                            <h1 className={Styles.ListTitle}>{data.name}</h1>
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
                                <Flex justifyContent={'space-between'} key={item.id} alignItems={'center'}>
                                    <Flex key={item.id} alignItems={'center'}>
                                        <input
                                            type="checkbox"
                                            checked={item.check}
                                            onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                                        />
                                        <Text
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
                                    </Flex>
                                    <span onClick={() => onOpenChecklist()} style={{ color: "#9fadbc", cursor: 'pointer' }} class="material-symbols-outlined">
                                        more_horiz
                                    </span>
                                    < Modal isOpen={isOpenChecklist} onClose={onCloseChecklist}  >
                                        <ModalOverlay />
                                        <ModalContent style={{ color: '#9fadbc', backgroundColor: "#22272B" }}>
                                            <ModalHeader>Delete Checklist item</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                Are you sure you want to delete this checklist item?
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button colorScheme='red' mr={3} onClick={() => { deleteChecklistItem(item.id) }}>
                                                    Delete
                                                </Button>
                                                <Button onClick={onCloseChecklist}>Cancel</Button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal >
                                </Flex>
                            ))}
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
                                    <Button className={Styles.Button2} onClick={formik.handleSubmit} colorScheme="blue">
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
            < Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent style={{ color: '#9fadbc', backgroundColor: "#22272B" }}>
                    <ModalHeader>Delete Checklist</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to delete this checklist item?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            disabled={isLoading}
                            isLoading={isLoading} onClick={onClose}>
                            {isLoading ? <CircularProgress isIndeterminate size="24px" color="#579dff" /> : "Delete"}
                        </Button>
                        <Button isLoading={isLoading} onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal >
        </div >
    );
}
