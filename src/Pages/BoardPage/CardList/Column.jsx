import React, { useState } from 'react';
import Styles from './Column.module.css';
import Task from './Task';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from "react-query";
import { RemoveCard, UpdateCardDesctiontion, createTask, getAllCardsByCardListId } from "../../../Service/CardService";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { CreateCover } from "../../../Service/CoverService";
import { ChakraProvider, Flex, useDisclosure } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton
} from '@chakra-ui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faSquareCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import FocusLock from "react-focus-lock";
import { useSelector } from 'react-redux';
import { ToastContainer, toast, useToast } from 'react-toastify';
import { CreateChecklist, GetAllChecklist } from '../../../Service/CheckListService';
import Checklist from '../../../Components/ChekcList/Checklist';

const Column = ({ column, index, filterData }) => {
  const queryClient = useQueryClient();
  const [openCreateTaskMenu, setOpenCreateTaskMenu] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPopoverOpen, onOpen: onPopoverOpen, onClose: onPopoverClose } = useDisclosure();
  const { isOpen: isChecklistPopoverOpen, onOpen: onChecklistPopoverOpen, onClose: isChecklistPopoverClose } = useDisclosure();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // New state to manage editing mode
  const [selectedColor2, setSelectedColor2] = useState();
  const firstFieldRef = React.useRef();
  const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
  const { userId } = useSelector((x) => x.userCredentials);

  const ColorArr = [
    "#216E4E",
    "#7F5F01",
    "#A54800",
    "#AE2E24",
    "#5e4dd7",
    "#0055cc",
    "#206a83",
    "#4c6b1f",
    "#943d73",
    "#596773",
  ];
  const taskData = [];

  // Filter tasks based on filterData
  const filteredTasks = filterData?.title
    ? taskData.filter(task => task.title.toLowerCase().includes(filterData.title.toLowerCase()))
    : taskData;

  const taskCreateFormik = useFormik({
    initialValues: {
      title: '',
      cardListId: column.id
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      cardListId: Yup.string().required('Card List ID is required')
    }),
    onSubmit: (values) => {
      CreateTaskMutation({
        ...values,
        order: taskData.length + 1  // Set the order based on the current number of tasks
      });
    },
  });

  const { mutate: CreateTaskMutation } = useMutation(
    (values) => createTask(values),
    {
      onSuccess: () => {
        setOpenCreateTaskMenu(false);
        queryClient.invalidateQueries(["boardData"]);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    updateCardDescriptionFormik.setValues({ cardId: task.id, description: task.description || '' });
    onOpen();
  };

  const { mutate: updateDescriptionMutation } = useMutation(
    (values) => UpdateCardDesctiontion(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["boardData"]);
        onClose();
        console.log('1');
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const updateCardDescriptionFormik = useFormik({
    initialValues: {
      cardId: '',
      description: ''
    },
    validationSchema: Yup.object({
      // description: Yup.string().required('Description is required')
    }),
    onSubmit: (values) => {
      updateDescriptionMutation(values);
      setIsEditing(false); // Close the editing mode after saving
      queryClient.invalidateQueries(["boardData"]);
    },

  });



  const HandleSaveCover = async (ThisCard, isRemove) => {
    let data = {
      color: isRemove ? "0" : selectedColor2,
      cardId: ThisCard,
      adminId: userId,
      workspaceId: workspaceId,
    };
    await UpdateCoverMutation(data);
  };

  const { mutate: UpdateCoverMutation } = useMutation(
    (values) => CreateCover(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["boardData"]);
        onClose();
        console.log(2);
      },
      onError: (error) => {
        toast.error("No Access")
      },
    }
  );
  // get Checklists 
  const { data: ChecklistData, isLoading, isError, error } = useQuery(
    ['getAllCheklist', selectedTask?.id], // First parameter is a unique key for the query
    () => GetAllChecklist(selectedTask?.id),
    {
      enabled: !!selectedTask?.id, // The query will only run if taskId is truthy
      staleTime: Infinity, // Specify how long the data is fresh and doesn't need refetching
      cacheTime: 1000 * 60 * 30 * 1, // Cache the data for 24 hours
    }
  );

  //Create Fromik
  const CreateChecklistFormik = useFormik({
    initialValues: {
      name: "",
      cardId: "",
      appUserId: userId,
      workspaceId: workspaceId
    },
    onSubmit: async (values) => {
      // const formData2 = new FormData();
      // formData2.append("AppUserId", userId ? userId : "");
      // formData2.append("Name", values.name);
      // formData2.append("CardId", values.cardId);
      // formData2.append("workspaceId", values.workspaceId);
      await AddChekclistMutation(values);
      queryClient.cancelQueries(["getAllCheklist", values.CardId]);
    },
  });
  const { mutate: AddChekclistMutation } = useMutation(
    (data) => CreateChecklist(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getAllCheklist");
        toast.success("Added Checklist")
        isChecklistPopoverClose()
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );
  //remove card Formik 
  //Create Fromik
  const confirmDelete = (id) => {
    RemoveCardMutation(id);

  };
  const { mutate: RemoveCardMutation } = useMutation(
    (cardId) => RemoveCard(cardId, userId, workspaceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("boardData");
        toast.success("CardDeleted")
        onClose()
      },
      onError: (err) => {
        console.log(err);
        toast.error("No Access!")
      },
    }
  );
  const [selectedCardId, setSelectedCardId] = useState(null);
  const { isOpen: isModalDeletModalOpen, onOpen: onOpenModalDeletModal, onClose: onCloseModalDeletModal } = useDisclosure();
  const openRemoveCardModal = (cardId) => {
    setSelectedCardId(cardId);
    onOpenModalDeletModal();
  };


  return (
    <div>
      <Draggable draggableId={column?.id} index={index}>
        {(provided) => (
          <div
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            ref={provided?.innerRef}
            className={Styles.main}
          >
            <h2>{column.title}</h2>
            <Droppable droppableId={column.id} type='task'>
              {(provided) => (

                <div style={{ minHeight: "20px" }} className={Styles.taskList} {...provided?.droppableProps} ref={provided.innerRef}>
                  {column?.tasks?.map((task, taskIndex) => (
                    <div onClick={() => handleTaskClick(task)} >
                      <Task key={task.id} task={task} index={taskIndex} />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div className={Styles.CreateCardContainer}>
              {openCreateTaskMenu ? (
                <div className={Styles.createTaskContainer}>
                  <input
                    onChange={taskCreateFormik.handleChange}
                    name="title"
                    placeholder="Enter a title for this card..."
                    className={Styles.inputTask}
                    type="text"
                  />
                  <div className={Styles.createTaskButtonsContainer}>
                    <button
                      type="submit"
                      onClick={taskCreateFormik.handleSubmit}
                      className={Styles.createTaskButton}
                    >
                      Add card
                    </button>
                    <button
                      onClick={() => setOpenCreateTaskMenu(false)}
                      className={Styles.closeButton}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setOpenCreateTaskMenu(true)} className={Styles.addTaskButton}>
                  <span className="material-symbols-outlined">add</span>
                  <p>Add a card</p>
                </div>
              )}
            </div>

            {selectedTask?.title && (
              <ChakraProvider>
                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent className={Styles.ModalBody}>
                    {(selectedTask.coverColor && selectedTask.coverColor !== "0") && (
                      <div style={{ backgroundColor: selectedTask.coverColor }} className={Styles.CoverContent}>
                      </div>
                    )}
                    <ModalHeader className={Styles.headerTitle}>
                      <Flex gap={2} alignItems={'center'}>
                        <span style={{ color: '#9fadbc', fontSize: "20px" }} className="material-symbols-outlined">
                          splitscreen_bottom
                        </span>{selectedTask.title}
                      </Flex>
                    </ModalHeader>
                    <ModalCloseButton color={'#9fadbc'} />
                    <ModalBody className={Styles.Details}>
                      <Flex gap={4} flex w={"100%"}>
                        <div style={{ width: "75%" }}>

                          <form onSubmit={updateCardDescriptionFormik.handleSubmit}>
                            <input
                              type="hidden"
                              name="cardId"
                              value={updateCardDescriptionFormik.values.cardId}
                              onChange={updateCardDescriptionFormik.handleChange}
                            />
                            <div>
                              <Flex justifyContent={'space-between'} alignItems={'center'}>
                                <Flex gap={2} alignItems={'center'}>
                                  <span style={{ color: '#9fadbc', fontSize: "22px" }} className="material-symbols-outlined">
                                    list
                                  </span>
                                  <label className={Styles.title}>Description</label>
                                </Flex>
                                {!isEditing && (
                                  <button
                                    type="button"
                                    className={Styles.EditButton}
                                    onClick={() => setIsEditing(true)}
                                  >
                                    Edit
                                  </button>
                                )}
                              </Flex>
                              {isEditing ? (
                                <div>
                                  <textarea
                                    name="description"
                                    value={updateCardDescriptionFormik.values.description}
                                    onChange={updateCardDescriptionFormik.handleChange}
                                    className={Styles.inputTaskArea}
                                  />
                                  <Button onClick={updateCardDescriptionFormik.handleSubmit} className={Styles.EditButton} type="submit" colorScheme='blue' mr={3}>
                                    Save
                                  </Button>
                                  <Button className={Styles.EditButton} variant='ghost' onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                              ) : (
                                <p className={Styles.Text}>{selectedTask.description}</p>
                              )}
                              <div>
                                <div className={Styles.Checklist}>
                                  {ChecklistData && ChecklistData.length > 0 &&
                                    ChecklistData?.map((item, index) => (
                                      <Checklist key={index} data={item} />
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                        <div className={Styles.LeftContainer} style={{ width: "25%" }}>
                          <h1 className={Styles.MenuTitle}>Add to Card</h1>
                          <div className={Styles.OptionSellectButton}>Members</div>
                          <div className={Styles.OptionSellectButton}>Labels</div>
                          <ChakraProvider>
                            <Popover
                              isOpen={isChecklistPopoverOpen}
                              initialFocusRef={firstFieldRef}
                              onOpen={onChecklistPopoverOpen}
                              onClose={isChecklistPopoverClose}
                              closeOnBlur={false}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <FontAwesomeIcon
                                    className="me-2"
                                    icon={faSquareCheck}
                                  />
                                  <p>
                                    Checklist
                                  </p>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.ChecklistModal}
                                p={5}
                              >
                                <Flex align={'center'} justifyContent={"space-between"}>
                                  <p>
                                  </p>
                                  <h1 className={Styles.CheckListHeader}>
                                    Add checklist
                                  </h1>
                                  <FontAwesomeIcon
                                    onClick={() => isChecklistPopoverClose()}
                                    className={Styles.XmarkIcon}
                                    icon={faXmark}
                                  />
                                </Flex>
                                <label htmlFor="Name">Title</label>
                                <input
                                  onChange={CreateChecklistFormik.handleChange}
                                  className={Styles.InputCheck}
                                  name="name"
                                  type="text"
                                />
                                <button
                                  type="submit"
                                  onClick={() => {
                                    CreateChecklistFormik.handleSubmit();
                                    CreateChecklistFormik.setFieldValue(
                                      "cardId",
                                      selectedTask?.id
                                    );
                                  }}
                                >
                                  Add
                                </button>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>

                          <div className={Styles.OptionSellectButton}>Dates</div>
                          <ChakraProvider>
                            <Popover
                              isOpen={isPopoverOpen}
                              initialFocusRef={firstFieldRef}
                              onOpen={onPopoverOpen}
                              onClose={onPopoverClose}
                              closeOnBlur={false}
                            >
                              <PopoverTrigger>
                                <button className={Styles.OptionSellectButton}>
                                  <FontAwesomeIcon
                                    className="me-2"
                                    icon={faPalette}
                                  />
                                  <p>
                                    Cover
                                  </p>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={Styles.CoverPopover}
                                p={5}
                              >
                                <FocusLock returnFocus persistentFocus={false}>
                                  <PopoverCloseButton m={6} color={"#9fadbc"} />
                                  <h5 className={Styles.Text}>Select a cover</h5>
                                  <Flex pb={3} gap={1} flexWrap={"wrap"}>
                                    {ColorArr.map((color, index) => (
                                      <div
                                        key={index}
                                        onClick={() => setSelectedColor2(color)}
                                        style={{
                                          backgroundColor: color,
                                          borderRadius: "2px",
                                          border:
                                            selectedColor2 === color
                                              ? "2px solid rgb(87, 157, 255)"
                                              : "none",
                                        }}
                                        className={Styles.ColorContaier}
                                      ></div>
                                    ))}
                                  </Flex>
                                  <Flex gap={2}>
                                    <button
                                      type="button"
                                      className={Styles.EditButton}
                                      onClick={() => {
                                        HandleSaveCover(selectedTask?.id, true);
                                        onPopoverClose();
                                      }}
                                    >
                                      Remove
                                    </button>
                                    <button
                                      type="button"
                                      className={Styles.EditButton}
                                      onClick={() => {
                                        HandleSaveCover(selectedTask?.id);
                                        onPopoverClose();
                                      }}
                                    >
                                      Save
                                    </button>
                                  </Flex>
                                </FocusLock>
                              </PopoverContent>
                            </Popover>
                          </ChakraProvider>
                          <div className={Styles.OptionSellectButton}>Custom Fields</div>
                          <h1 style={{ marginTop: "50px" }} className={Styles.MenuTitle}>Actions</h1>
                          <div onClick={() => openRemoveCardModal(selectedTask?.id)} className={Styles.OptionSellectButton}>Remove Card</div>
                          <Modal  isOpen={isModalDeletModalOpen} onClose={onCloseModalDeletModal}>
                            <ModalOverlay />
                            <ModalContent color='#9fadbc' backgroundColor="#22272B">
                              <ModalHeader>Delete Card</ModalHeader>
                              <ModalCloseButton />
                              <ModalBody>Are you sure you want to delete this card?</ModalBody>
                              <ModalFooter>
                                <Button colorScheme='red' mr={3} onClick={()=>confirmDelete(selectedTask.id)}>
                                  Delete
                                </Button>
                                <Button onClick={onCloseModalDeletModal}>Cancel</Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                        </div>
                      </Flex>

                    </ModalBody>
                  </ModalContent>
                </Modal>
              </ChakraProvider>
            )}
          </div>
        )
        }
      </Draggable >
    </div >
  );
};

export default Column;
