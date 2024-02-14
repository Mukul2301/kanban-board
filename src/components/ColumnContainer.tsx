import { SortableContext, useSortable } from '@dnd-kit/sortable';
import Trash from '../icons/Trash';
import { Column, Id, Task } from '../types';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import PlusIcon from '../icons/PlusIcon';
import TaskCard from './TaskCard';

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  deleteTask: (columnId: Id) => void;
  updateTask: (columnId: Id, content: string) => void;
  tasks: Task[];
}
const ColumnContainer = (props: Props) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    deleteTask,
    updateTask,
    tasks,
  } = props;
  const [edit, setEdit] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: edit,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor opacity-60 rorder-rose-500 border-2 w-[350px] h-[500px] max-h-[500] flex rounded-md flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500] flex rounded-md flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEdit(true);
        }}
        className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none font-bold p-3 border-columnBackgroundColor bottom-4 flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div className=" flex justify-center items-center bg-columnBackgroundColor  px-2 py-2 text-sm rounded-full">
            0
          </div>
          {!edit ? (
            column.title && <div>{column.title}</div>
          ) : (
            <input
              className="bg-black focus:border-red-500 outline-none px-2 border rounded"
              autoFocus
              onBlur={() => setEdit(false)}
              onKeyDown={(e) => {
                e.key === 'Enter' && setEdit(false);
              }}
              onChange={(e) => updateColumn(column.id, e.target.value)}
            />
          )}
        </div>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="stroke-gray-500 rounded py-2 px-1 hover:stroke-white hover:bg-columnBackgroundColor"
        >
          <Trash />
        </button>
      </div>
      <div className="flex flex-grow   flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      <button
        onClick={() => {
          createTask(column.id);
        }}
        className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
};

export default ColumnContainer;
