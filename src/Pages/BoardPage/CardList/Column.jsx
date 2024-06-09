import React, { useState } from 'react';
import styles from './Column.module.css';
import Task from './Task';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQuery, useQueryClient } from "react-query";
import { UpdateCardDesctiontion, createTask, getAllCardsByCardListId } from "../../../Service/CardService";
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
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import FocusLock from "react-focus-lock";

const Column = ({ column, index, filterData }) => {
  const queryClient = useQueryClient();
  const [openCreateTaskMenu, setOpenCreateTaskMenu] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPopoverOpen, onOpen: onPopoverOpen, onClose: onPopoverClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // New state to manage editing mode
  const [selectedColor2, setSelectedColor2] = useState();
  const firstFieldRef = React.useRef();

  const ColorArr = ['#ff0000', '#00ff00', '#0000ff']; // Sample color array

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
        queryClient.invalidateQueries(["getAllCardsByCardListId", column.id]);
        // Removed the onClose() here to keep the modal open after saving
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
      description: Yup.string().required('Description is required')
    }),
    onSubmit: (values) => {
      updateDescriptionMutation(values);
      setIsEditing(false); // Close the editing mode after saving
    },
  });

  const HandleSaveCover = async (ThisCard, isRemove) => {
    let data;
    if (isRemove) {
      data = {
        color: "0",
        cardId: ThisCard,
      };
    } else {
      data = {
        color: selectedColor2,
        cardId: ThisCard,
      };
    }
    await CreateCover(data);
    await queryClient.invalidateQueries(["ModalCardDetails"]);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={styles.main}
        >
          <h2>{column.title}</h2>


          <Droppable droppableId={column.id} type='task'>
        {(provided) => (
          <div className={styles.taskList} {...provided.droppableProps} ref={provided.innerRef}>
            {column?.tasks?.map((task, taskIndex) => (
              <Task key={task.id} task={task} index={taskIndex} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>





          <div className={styles.CreateCardContainer}>
            {openCreateTaskMenu ? (
              <div className={styles.createTaskContainer}>
                <input
                  onChange={taskCreateFormik.handleChange}
                  name="title"
                  placeholder="Enter a title for this card..."
                  className={styles.inputTask}
                  type="text"
                />
                <div className={styles.createTaskButtonsContainer}>
                  <button
                    type="submit"
                    onClick={taskCreateFormik.handleSubmit}
                    className={styles.createTaskButton}
                  >
                    Add card
                  </button>
                  <button
                    onClick={() => setOpenCreateTaskMenu(false)}
                    className={styles.closeButton}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={() => setOpenCreateTaskMenu(true)} className={styles.addTaskButton}>
                <span className="material-symbols-outlined">add</span>
                <p>Add a card</p>
              </div>
            )}
          </div>

          {selectedTask && (
            <ChakraProvider>
              <Modal isOpen={isOpen} onClose={() => { onClose(); setIsEditing(false); }}>
                <ModalOverlay />
                <ModalContent className={styles.ModalBody}>
                  <ModalHeader className={styles.headerTitle}>
                    <Flex gap={2} alignItems={'center'}>
                      <span style={{ color: '#9fadbc', fontSize: "20px" }} className="material-symbols-outlined">
                        splitscreen_bottom
                      </span>{selectedTask.title}
                    </Flex>
                  </ModalHeader>
                  <ModalCloseButton color={'#9fadbc'} />
                  <ModalBody>
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
                                <label className={styles.title}>Description</label>
                              </Flex>
                              {!isEditing && (
                                <button
                                  type="button"
                                  className={styles.EditButton}
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
                                  className={styles.inputTaskArea}
                                />
                                <Button className={styles.EditButton} type="submit" colorScheme='blue' mr={3}>
                                  Save
                                </Button>
                                <Button className={styles.EditButton} variant='ghost' onClick={() => setIsEditing(false)}>Cancel</Button>
                              </div>
                            ) : (
                              <p className={styles.Text}>{selectedTask.description}</p>
                            )}
                          </div>
                          {updateCardDescriptionFormik.touched.description && updateCardDescriptionFormik.errors.description ? (
                            <div className={styles.error}>{updateCardDescriptionFormik.errors.description}</div>
                          ) : null}
                        </form>
                      </div>
                      <div className={styles.LeftContainer} style={{ width: "25%" }}>
                        <h1 className={styles.MenuTitle}>Add to Card</h1>
                        <div className={styles.OptionSellectButton}>Members</div>
                        <div className={styles.OptionSellectButton}>Labels</div>
                        <div className={styles.OptionSellectButton}>Checklist</div>
                        <div className={styles.OptionSellectButton}>Dates</div>
                        <ChakraProvider>
                          <Popover
                            isOpen={isPopoverOpen}
                            initialFocusRef={firstFieldRef}
                            onOpen={onPopoverOpen}
                            onClose={onPopoverClose}
                            closeOnBlur={false}
                          >
                            <PopoverTrigger>
                              <button className="btn btn-primary default-submit mb-2 w-100 text-start">
                                <FontAwesomeIcon
                                  className="me-2"
                                  icon={faPalette}
                                />
                                Cover
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className={styles.CoverPopover}
                              p={5}
                            >
                              <FocusLock returnFocus persistentFocus={false}>
                                <PopoverCloseButton />
                                <h5>Select a cover</h5>
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
                                      className={styles.ColorContaier}
                                    ></div>
                                  ))}
                                </Flex>
                                <Flex gap={2}>
                                  <Button
                                    style={{
                                      backgroundColor: "#6c757d",
                                      color: "white",
                                      border: "none",
                                    }}
                                    onClick={() => {
                                      HandleSaveCover(selectedTask?.id, true);
                                      onPopoverClose();
                                    }}
                                  >
                                    Remove
                                  </Button>
                                  <Button
                                    style={{
                                      backgroundColor: "#579dff",
                                      color: "white",
                                      border: "none",
                                    }}
                                    onClick={() => {
                                      HandleSaveCover(selectedTask?.id);
                                      onPopoverClose();
                                    }}
                                  >
                                    Save
                                  </Button>
                                </Flex>
                              </FocusLock>
                            </PopoverContent>
                          </Popover>
                        </ChakraProvider>
                        <div className={styles.OptionSellectButton}>Custom Fields</div>
                      </div>
                    </Flex>

                  </ModalBody>
                </ModalContent>
              </Modal>
            </ChakraProvider>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Column;
