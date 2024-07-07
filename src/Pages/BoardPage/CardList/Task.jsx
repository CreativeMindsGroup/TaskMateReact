import React from 'react';
import styles from './Task.module.css';
import { Draggable } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from 'react-query';
import { GetAttachments, getCardListItomCount } from '../../../Service/CardService';
import { Flex } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Task = ({ task, index }) => {
  const { workspaceId } = useSelector((x) => x.workspaceAndBoard);
  const { userId } = useSelector((x) => x.userCredentials);
  const queryClient = useQueryClient();
  const { data: Task } = useQuery(
    ['ChecklistCount', task.id],
    () => getCardListItomCount(task.id),
    {
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
    }
  );

  // Function to check if due date is past
  const isDueDatePast = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  const taskStyle = {
    borderRadius: "3px",
    padding: ' 0 4px',
    margin: "0",
    fontSize: "14px",
    backgroundColor: task.isDueDateDone ? "#4bce97" : (isDueDatePast() ? "#5d1f1a" : "initial"), // Color changes if due date is past
    color: task.isDueDateDone ? "#1d2125" : (isDueDatePast() ? "#ae2a19" : "#b6c2cf") // Conditional text color based on due date
  };
  const { data: attachments, isLoading: loading } = useQuery(
    ['GetAttachments', task.id], // Unique key for the query
    () => GetAttachments(task.id), // Fetch attachments using the GetAttachments function
    {
      enabled: !!task.id,
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 30 * 1,
    }
  );
  return (
    <div>
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            className={styles.main}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            {task.coverColor && task.coverColor !== "0" && (
              <div
                className={styles.CoverDiv}
                style={{ backgroundColor: task.coverColor }}
              ></div>
            )}
            <div className={styles.Content}>
              <p className={styles.TaskTitle}>{task.title}</p>
              <Flex alignItems={'center'} gap={10}>
                {task.description && task.description !== "0" && (
                  <Flex alignItems={'center'} gap={10}>
                    <span style={{ fontSize: "15px", margin: "0" }} className="material-symbols-outlined">
                      format_align_left
                    </span>
                  </Flex>
                )}

                {task.dueDate && (
                  <Flex style={taskStyle} alignItems={'center'} gap={3}>
                    <span style={{ fontSize: "15px", margin: "0" }} className="material-symbols-outlined">
                      schedule
                    </span>
                    <span style={{ fontSize: "14px", margin: "0", fontWeight: '400' }} >
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Flex>
                )}
                {task?.getCustomFieldDto && (
                  <span style={{ fontSize: "15px", margin: "0" }} className="material-symbols-outlined">
                    folder_copy
                  </span>
                )}
                {attachments?.data[0]?.id && (
                  <span style={{ fontSize: "18px", margin: "0" }} className="material-symbols-outlined">
                    attachment
                  </span>
                )}
              </Flex>
              {Task?.data && Task.data !== "0" && (
                <Flex alignItems={'center'} gap={10}>
                  <span style={{ fontSize: "15px", margin: "0" }} className="material-symbols-outlined">
                    select_check_box
                  </span>
                  <span style={{ fontSize: "14px", margin: "0", fontWeight: '400' }} >
                    {Task.data.done} / {Task.data.total}
                  </span>
                </Flex>
              )}
            </div>
          </div>
        )}
      </Draggable>
    </div>
  );
};

export default Task;
