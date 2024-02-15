import { useEffect, useMemo, useState } from 'react';
import PlusIcon from '../icons/PlusIcon';
import { Column, Id, Task, defaultColumns } from '../types';
import ColumnContainer from './ColumnContainer';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>(() => {
    const storedColumns = localStorage.getItem('kanbanColumns');
    return storedColumns ? JSON.parse(storedColumns) : defaultColumns;
  });
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem('kanbanTasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem('kanbanColumns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );

  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  };
  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  };
  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((column) => id !== column.id);
    const newTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(newTasks);
    setColumns(filteredColumns);
  };

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: Id): void => {
    const filteredTasks = tasks.filter((task) => task.id !== id);
    setTasks(filteredTasks);
  };
  const updateTask = (id: Id, content: string): void => {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  };
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.type);
    }
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.type);
    }
  };
  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId,
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId,
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === 'Column';

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  return (
    <div>
      <button
        onClick={createNewColumn}
        className="h-[60px] w-[250px] cursor-pointer min-w-[250px] rounded-lg border-2 bg-mainBackgroundColor border-columnBackgroundColor p-4 top-2 ring-rose-500 hover:ring-2 m-[40px] px-[40px] flex gap-2"
      >
        Add Column <PlusIcon />
      </button>
      <div className="m-[10px] flex min-h-[80%] w-[95%] items-center overflow-x-auto overflow-y-hidden">
        <DndContext
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          sensors={sensors}
          onDragOver={onDragOver}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4">
              <SortableContext items={columnsId}>
                {columns.map((column) => (
                  <ColumnContainer
                    column={column}
                    key={column.id}
                    deleteColumn={deleteColumn}
                    updateColumn={updateColumn}
                    createTask={createTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    tasks={tasks.filter((task) => task.columnId === column.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </div>
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id,
                  )}
                />
              )}
            </DragOverlay>,
            document.body,
          )}

          {activeTask && (
            <TaskCard
              task={activeTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          )}
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
