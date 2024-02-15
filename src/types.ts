export type Id=string | number;

export type Column ={
    id:Id,
    title:string
}

export type Task ={
    id:Id,
    columnId:Id,
    content:string

}

export const defaultColumns = [
    {
      id: 'todo',
      title: 'Todo',
    },
    {
      id: 'doing',
      title: 'Work in progress',
    },
    {
      id: 'done',
      title: 'Done',
    },
  ];