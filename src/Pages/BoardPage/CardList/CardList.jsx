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
import { moveCard, moveCardList } from "../../../Service/BoardService";
import { ToastContainer, toast } from "react-toastify";

const CardList = ({ boardData }) => {
  const queryClient = useQueryClient();
  const { BoardId:boardId } = useParams();
  const { userId } = useSelector(state => state.userCredentials);
  const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
  const [openCreateMenu, setOpenCreateMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { mutate: reorderCardsMutation } = useMutation(data => moveCard(data), {
    onSuccess: () => {
      toast.success("Card moved successfully!");
      queryClient.invalidateQueries(["boardData"]);
      setIsDragging(false); 
    },
    onError: (error) => {
      console.error("Error while reordering cards: ", error);
      toast.error("Failed to move card!");
      setIsDragging(false); 
    }
  });
  
  //reorder Card lists 
  const reorderListsMutation = useMutation(moveCardList, {
    onSuccess: () => {
      toast.success("List order updated successfully!");
      queryClient.invalidateQueries(["boardData"]);
      setIsDragging(false); 
    },
    onError: (error) => {
      console.error("Error while moving list: ", error);
      toast.error("Failed to move list!");
      setIsDragging(false); 
    }
  });



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
//hande Move
const handleOnDragEnd = (result) => {
  setIsDragging(true);
  const { source, destination, draggableId, type } = result;

  if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
    setIsDragging(false);
    return;
  }

  if (type === "card") {
    reorderCardsMutation.mutate({
      cardId: draggableId,
      sourceColumnId: source.droppableId,
      destinationColumnId: destination.droppableId,
      newIndex: destination.index
    });
  } else if (type === "list") {
    reorderListsMutation.mutate({
      boardId: boardId,
      sourceIndex: source.index,
      destinationIndex: destination.index
    });
  }
};

  return (
    <div className={styles.BoardListContainer}>
<ToastContainer />
      <div>
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
