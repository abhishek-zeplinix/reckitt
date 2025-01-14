// components/KanbanBoard.tsx
import { useState } from 'react';
import { Task, Column } from '../types';

const initialColumns: Column[] = [
    {
        id: 'todo',
        title: 'To Do',
        tasks: [
            { id: 'task1', title: 'Task 1', description: 'Description for Task 1', status: 'todo' },
            { id: 'task2', title: 'Task 2', description: 'Description for Task 2', status: 'todo' }
        ]
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        tasks: [{ id: 'task3', title: 'Task 3', description: 'Description for Task 3', status: 'in-progress' }]
    },
    {
        id: 'done',
        title: 'Done',
        tasks: [{ id: 'task4', title: 'Task 4', description: 'Description for Task 4', status: 'done' }]
    }
];

const KanbanBoard = () => {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const handleDragStart = (taskId: string) => {
        setDraggedTaskId(taskId);
    };

    const handleDrop = (columnId: 'todo' | 'in-progress' | 'done') => {
        if (!draggedTaskId) return;

        const draggedTask = findTaskById(draggedTaskId);
        if (draggedTask) {
            draggedTask.status = columnId;
            setColumns(updateColumnState(columns, draggedTask));
            setDraggedTaskId(null); // Reset dragged task after drop
        }
    };

    const findTaskById = (taskId: string): Task | null => {
        for (const column of columns) {
            const task = column.tasks.find((task) => task.id === taskId);
            if (task) return task;
        }
        return null;
    };

    const updateColumnState = (columns: Column[], updatedTask: Task): Column[] => {
        return columns.map((column) => {
            if (column.id === updatedTask.status) {
                return { ...column, tasks: [...column.tasks, updatedTask] };
            } else {
                return {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== updatedTask.id)
                };
            }
        });
    };

    return (
        <div className="kanban-board flex gap-8">
            {columns.map((column) => {
                const taskCount = column.tasks.length;

                // Set the color for the circle based on the column status
                const getStatusDotColor = (status: 'todo' | 'in-progress' | 'done') => {
                    switch (status) {
                        case 'todo':
                            return 'bg-red-500'; // Red for "todo"
                        case 'in-progress':
                            return 'bg-blue-500'; // Blue for "in-progress"
                        case 'done':
                            return 'bg-green-500'; // Green for "done"
                        default:
                            return '';
                    }
                };

                return (
                    <div key={column.id} className="column w-[5rem]  bg-gray-200 rounded-lg" onDrop={() => handleDrop(column.id)} onDragOver={(e) => e.preventDefault()}>
                        <div className="flex justify-content-between align-items-center px-2">
                            <div className="flex mb-4 gap-3 px-3 align-items-center">
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', marginTop: '0px', marginBottom: '0px' }} className={` ${getStatusDotColor(column.id as 'todo' | 'in-progress' | 'done')}`} />
                                <h2 className="text-left text-xl font-bold mt-3 ">{column.title}</h2>
                                <span className="text-sm">
                                    <div className="w-12 h-3 bg-gray-400 border-circle flex items-center justify-center text-white text-xs p-2">{taskCount}</div>
                                </span>
                            </div>
                            <div className="mb-4 ">
                                <i className="pi pi-ellipsis-v cursor-pointer" onClick={() => {}}></i>
                            </div>
                        </div>
                        <div className="tasks p-4">
                            {column.tasks.length === 0 ? (
                                <div className="empty-task-placeholder text-center text-gray-500">No tasks</div>
                            ) : (
                                column.tasks.map((task) => (
                                    <div key={task.id} className="task bg-white p-4 mb-4 rounded-lg shadow cursor-grab overflow-hidden" draggable onDragStart={() => handleDragStart(task.id)}>
                                        <h3 className="text-lg font-semibold truncate">{task.title}</h3>
                                        <p className="truncate">{task.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanbanBoard;
