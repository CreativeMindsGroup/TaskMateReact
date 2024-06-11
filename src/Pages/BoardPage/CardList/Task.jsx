import React from 'react';
import styles from './Task.module.css';
import { Draggable } from '@hello-pangea/dnd';

const Task = ({ task, index }) => {
  return (
    <div>
      <Draggable draggableId={task?.id} index={index}>
        {(provided) => (
          <div
            className={styles.main}
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            ref={provided.innerRef}
          >
            {(task?.coverColor && task?.coverColor !== "0") && (
              <div
                className={styles.CoverDiv}
                style={{ backgroundColor: task?.coverColor }}
              ></div>
            )}
            <div className={styles.Content}>
              <p className={styles.TaskTitle}>{task.title}</p>
              {(task?.description && task?.description !== "0") && (
              <div>
              <span style={{fontSize:"15px",margin:"0"}} class="material-symbols-outlined">
                format_align_left
              </span>
            </div>
            )}
            </div>
          </div>
        )}
      </Draggable>
    </div>
  );
};

export default Task;
