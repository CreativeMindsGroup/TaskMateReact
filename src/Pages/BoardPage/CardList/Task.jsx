import React from 'react';
import styles from './Task.module.css';
import { Draggable } from '@hello-pangea/dnd';

const Task = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className={styles.main}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <p>{task.title}</p>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
