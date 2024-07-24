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
  const { BoardId: boardId } = useParams();
  const { userId } = useSelector(state => state.userCredentials);
  const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
  const [openCreateMenu, setOpenCreateMenu] = useState(false);
  const { mutate: reorderCardsMutation } = useMutation(data => moveCard(data), {
    onSuccess: () => {
      toast.success("Done!")
      queryClient.invalidateQueries(["boardData"]);
    },
    onError: (error) => {
      console.error("Error while reordering cards: ", error);
      toast.error("No Access!")
    }
  });

  const handleOnDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) {
      return; // dropped outside the list
    }
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // dropped in the same place
    }

    if (type === "column") {
      // Reorder columns
      const newColumnOrder = Array.from(boardData.cardLists);
      const movedColumn = newColumnOrder.splice(source.index, 1)[0];
      newColumnOrder.splice(destination.index, 0, movedColumn);

      // Log column IDs and their order

      // Update the order of columns in the backend
      moveListMutation(
        newColumnOrder.map(list => list.id)
      );
    } else if (type === "task") {
      // Find the columns (or lists)
      const start = boardData.cardLists.find(list => list.id === source.droppableId);
      const finish = boardData.cardLists.find(list => list.id === destination.droppableId);

      if (start === finish) {
        // Moving tasks within the same column
        const newTaskIds = Array.from(start.tasks);
        const movedTask = newTaskIds.splice(source.index, 1)[0];
        newTaskIds.splice(destination.index, 0, movedTask);

        // Log task IDs and their order within the column

        reorderCardsMutation({
          sourceColumnId: start.id,
          destinationColumnId: start.id,
          cardId: draggableId,
          newIndex: destination.index
        });
      } else {
        // Moving tasks between different columns
        const startTaskIds = Array.from(start.tasks);
        startTaskIds.splice(source.index, 1);
        const finishTaskIds = Array.from(finish.tasks);
        finishTaskIds.splice(destination.index, 0, draggableId);

        reorderCardsMutation({
          sourceColumnId: start.id,
          destinationColumnId: finish.id,
          cardId: draggableId,
          newIndex: destination.index
        });
      }
    }
  };



  const { mutate: moveListMutation } = useMutation(data => moveCardList(boardId, data), {
    onSuccess: () => {
      toast.success("List moved successfully!");
      queryClient.invalidateQueries("boardData");
    },
    onError: (error) => {
      toast.error("Failed to move list!");
      console.error("Error while moving list:", error);
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
      workspaceId: workspaceId
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
        cardListCreateFormik.resetForm()
        toast.error("no Access!")
      },
    }
  );


  return (
    <div>
      <div className={styles.BoardListContainer}>
        <div>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div className={styles.main} {...provided?.droppableProps} ref={provided.innerRef}>
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
    </div>
  );
};

export default CardList;
