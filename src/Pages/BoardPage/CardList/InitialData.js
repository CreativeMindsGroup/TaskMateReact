const initialData = {
    Tasks: {
      'task-1': { id: 'task-1', content: 'Task 1 content' },
      'task-2': { id: 'task-2', content: 'Task 2 content' },
      'task-3': { id: 'task-3', content: 'Task 3 content' },
      'task-4': { id: 'task-4', content: 'Task 4 content' },
      'task-5': { id: 'task-5', content: 'Task 5 content' }
    },
    Columns: {
      'column-1': {
        id: "1",
        title: 'To do',
        taskIds: ['task-1', "task-2", "task-3", 'task-4', 'task-5']
      },
    },
    ColumnOrder: ['column-1']
  };