import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import styles from './CardList.module.css';
import { useMutation, useQueryClient } from "react-query";
import { createCardList, getCardListByBoardId, reOrderColumns, reorderCards } from "../../../Service/CardService";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { useParams } from "react-router-dom";
import Column from "./Column";
import { moveCard } from "../../../Service/BoardService";
import { ToastContainer, toast } from "react-toastify";

const CardList = ({ boardData }) => {
  const queryClient = useQueryClient();
  const { BoardId:boardId } = useParams();
  const { userId } = useSelector(state => state.userCredentials);
  const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
  const [openCreateMenu, setOpenCreateMenu] = useState(false);
  const { mutate: reorderCardsMutation } = useMutation(data=>moveCard(data), {
    onSuccess: () => {
      toast.success("Done!")
      queryClient.invalidateQueries(["boardData"]);
    },
    onError: (error) => {
      console.error("Error while reordering cards: ", error);
      toast.success("Error!")
    }
  });
  
  const handleOnDragEnd = (result) => {
    console.log(result);
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return; 
    }
    const dataToSend = {
      cardId: draggableId,
      sourceColumnId: source.droppableId,
      destinationColumnId: destination.droppableId,
      newIndex: destination.index
    };
    reorderCardsMutation(dataToSend);
  };




  //create card Section

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    boardsId: Yup.string().required('Board ID is required'),
    appUserId: Yup.string().required('App User ID is required'),
    workspaceId: Yup.string().required('workspaceId ID is required')

  });

  const cardListCreateFormik = useFormik({
    initialValues: {
      title: '',
      boardsId: boardId,
      appUserId: userId,
      workspaceId:workspaceId
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      values.boardsId = boardId
      CreateCardListMutation(values);
    },
  });   

  const { mutate: CreateCardListMutation, isLoading: createListLoading } = useMutation(
    (values) => createCardList(values),
    {
      onSuccess: (resp) => {
        setOpenCreateMenu(false);
        queryClient.invalidateQueries(["boardData"]);
        cardListCreateFormik.resetForm()
        toast.success("Created!")
      },
      onError: (error) => {
        console.log(error);
        cardListCreateFormik.resetForm()
        toast.error("no Access!")
      },
    }
  );


  return (
    <div className={styles.BoardListContainer}>
      <div>
<ToastContainer />
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div className={styles.main} {...provided.droppableProps} ref={provided.innerRef}>
              {boardData?.cardLists?.map((column, index) => (
                <Column key={column.id} column={column} index={index} />
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
        </div>

        {!openCreateMenu ? (
          <div onClick={() => setOpenCreateMenu(true)} className={styles.AddListButton}>
            <span className="material-symbols-outlined">add</span>
            <p>Add another list</p>
          </div>
        ) : (
          <div className={styles.CreateListContainer}>
            <input
              onChange={cardListCreateFormik.handleChange}
              name="title"
              placeholder="Enter a list title ...."
              style={{ border: cardListCreateFormik.touched.title && cardListCreateFormik.errors.title ? "1px solid red" : "" }}
              className={styles.InputList}
              type="text"
            />

            <div className={styles.CreateListButtonsContainer}>
              <button type="submit" onClick={cardListCreateFormik.handleSubmit} className={styles.CreateBoardButton}>Add list</button>
              <button onClick={() => setOpenCreateMenu(false)} className={styles.CloseButton}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}
      </div>

  );
};

export default CardList;
