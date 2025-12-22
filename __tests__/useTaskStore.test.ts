/**
 * Unit Tests for Task Store (Zustand)
 * * Tests cover all core functionality including:
 * - Adding single and multiple tasks
 * - Toggling task completion status
 * - Deleting tasks
 * - Updating task details
 * - Search query management
 * - Sort order management
 * - State persistence
 */

import { act } from '@testing-library/react-hooks';
import { useTaskStore } from '../src/store/useTaskStore';
import { SortOrder } from '../src/types';

// mock AsyncStorage for testing
// jest.mock('@react-native-async-storage/async-storage', () => ({
//     setItem: jest.fn(() => Promise.resolve()),
//     getItem: jest.fn(() => Promise.resolve(null)),
//     removeItem: jest.fn(() => Promise.resolve()),
// }));

describe('useTaskStore', () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        act(() => {
            useTaskStore.getState().clearAllTasks();
            useTaskStore.setState({
                searchQuery: '',
                sortOrder: 'dueDate-asc',
                error: null,
                loading: false,
            });
        });
    });

    describe('Task Creation', () => {
        it('should add a task with generated id and createdAt', () => {
            const taskData = {
                title: 'Test Task',
                description: 'Test Description',
                isCompleted: false,
            };

            act(() => {
                useTaskStore.getState().addTask(taskData);
            });

            const state = useTaskStore.getState();
            expect(state.tasks).toHaveLength(1);
            expect(state.tasks[0].title).toBe('Test Task');
            expect(state.tasks[0].description).toBe('Test Description');
            expect(state.tasks[0].isCompleted).toBe(false);
            expect(state.tasks[0].id).toBeDefined();
            expect(state.tasks[0].createdAt).toBeDefined();
            expect(typeof state.tasks[0].id).toBe('string');
            expect(typeof state.tasks[0].createdAt).toBe('number');
        });

        it('should add multiple tasks at once', () => {
            const tasksData = [
                { title: 'Task 1', isCompleted: false },
                { title: 'Task 2', isCompleted: false },
                { title: 'Task 3', isCompleted: false },
            ];

            act(() => {
                useTaskStore.getState().addTasks(tasksData);
            });

            const state = useTaskStore.getState();
            expect(state.tasks).toHaveLength(3);
            expect(state.tasks[0].title).toBe('Task 1');
            expect(state.tasks[1].title).toBe('Task 2');
            expect(state.tasks[2].title).toBe('Task 3');

            // each task should have unique id
            const ids = state.tasks.map(t => t.id);
            expect(new Set(ids).size).toBe(3);
        });

        it('should add task with optional fields', () => {
            const taskData = {
                title: 'Task with Due Date',
                description: 'Important task',
                dueDate: Date.now() + 86400000, // tomorrow
                isCompleted: false,
            };

            act(() => {
                useTaskStore.getState().addTask(taskData);
            });

            const state = useTaskStore.getState();
            expect(state.tasks).toHaveLength(1);
            expect(state.tasks[0].dueDate).toBeDefined();
            expect(state.tasks[0].description).toBe('Important task');
        });
    });

    describe('Task Status Management', () => {
        it('should toggle task completion status', () => {
            act(() => {
                useTaskStore.getState().addTask({
                    title: 'Toggle Test',
                    isCompleted: false,
                });
            });

            const taskId = useTaskStore.getState().tasks[0].id;

            // toggle to completed
            act(() => {
                useTaskStore.getState().toggleTask(taskId);
            });

            expect(useTaskStore.getState().tasks[0].isCompleted).toBe(true);

            // toggle back to incomplete
            act(() => {
                useTaskStore.getState().toggleTask(taskId);
            });

            expect(useTaskStore.getState().tasks[0].isCompleted).toBe(false);
        });

        it('should not affect other tasks when toggling', () => {
            act(() => {
                useTaskStore.getState().addTasks([
                    { title: 'Task 1', isCompleted: false },
                    { title: 'Task 2', isCompleted: false },
                    { title: 'Task 3', isCompleted: true },
                ]);
            });

            const tasks = useTaskStore.getState().tasks;
            const taskId = tasks[0].id;

            act(() => {
                useTaskStore.getState().toggleTask(taskId);
            });

            const updatedTasks = useTaskStore.getState().tasks;
            expect(updatedTasks[0].isCompleted).toBe(true);
            expect(updatedTasks[1].isCompleted).toBe(false);
            expect(updatedTasks[2].isCompleted).toBe(true);
        });
    });

    describe('Task Deletion', () => {
        it('should delete a task by id', () => {
            act(() => {
                useTaskStore.getState().addTasks([
                    { title: 'Task 1', isCompleted: false },
                    { title: 'Task 2', isCompleted: false },
                ]);
            });

            const taskId = useTaskStore.getState().tasks[0].id;

            act(() => {
                useTaskStore.getState().deleteTask(taskId);
            });

            const state = useTaskStore.getState();
            expect(state.tasks).toHaveLength(1);
            expect(state.tasks[0].title).toBe('Task 2');
        });

        it('should handle deleting non-existent task gracefully', () => {
            act(() => {
                useTaskStore.getState().addTask({
                    title: 'Test Task',
                    isCompleted: false,
                });
            });

            act(() => {
                useTaskStore.getState().deleteTask('non-existent-id');
            });

            expect(useTaskStore.getState().tasks).toHaveLength(1);
        });

        it('should clear all tasks', () => {
            act(() => {
                useTaskStore.getState().addTasks([
                    { title: 'Task 1', isCompleted: false },
                    { title: 'Task 2', isCompleted: false },
                    { title: 'Task 3', isCompleted: false },
                ]);
            });

            expect(useTaskStore.getState().tasks).toHaveLength(3);

            act(() => {
                useTaskStore.getState().clearAllTasks();
            });

            expect(useTaskStore.getState().tasks).toHaveLength(0);
        });
    });

    describe('Task Updates', () => {
        it('should update task fields', () => {
            act(() => {
                useTaskStore.getState().addTask({
                    title: 'Original Title',
                    description: 'Original Description',
                    isCompleted: false,
                });
            });

            const taskId = useTaskStore.getState().tasks[0].id;

            act(() => {
                useTaskStore.getState().updateTask(taskId, {
                    title: 'Updated Title',
                    description: 'Updated Description',
                });
            });

            const updatedTask = useTaskStore.getState().tasks[0];
            expect(updatedTask.title).toBe('Updated Title');
            expect(updatedTask.description).toBe('Updated Description');
            expect(updatedTask.id).toBe(taskId);
        });

        it('should update only specified fields', () => {
            const dueDate = Date.now();
            act(() => {
                useTaskStore.getState().addTask({
                    title: 'Task',
                    description: 'Description',
                    dueDate,
                    isCompleted: false,
                });
            });

            const taskId = useTaskStore.getState().tasks[0].id;

            act(() => {
                useTaskStore.getState().updateTask(taskId, {
                    title: 'New Title',
                });
            });

            const updatedTask = useTaskStore.getState().tasks[0];
            expect(updatedTask.title).toBe('New Title');
            expect(updatedTask.description).toBe('Description');
            expect(updatedTask.dueDate).toBe(dueDate);
        });
    });

    describe('Search Functionality', () => {
        it('should set search query', () => {
            act(() => {
                useTaskStore.getState().setSearchQuery('test query');
            });

            expect(useTaskStore.getState().searchQuery).toBe('test query');
        });

        it('should update search query', () => {
            act(() => {
                useTaskStore.getState().setSearchQuery('first query');
            });

            expect(useTaskStore.getState().searchQuery).toBe('first query');

            act(() => {
                useTaskStore.getState().setSearchQuery('second query');
            });

            expect(useTaskStore.getState().searchQuery).toBe('second query');
        });

        it('should clear search query', () => {
            act(() => {
                useTaskStore.getState().setSearchQuery('test');
            });

            act(() => {
                useTaskStore.getState().setSearchQuery('');
            });

            expect(useTaskStore.getState().searchQuery).toBe('');
        });
    });

    describe('Sort Order Management', () => {
        it('should set sort order', () => {
            const sortOrders: SortOrder[] = [
                'title-asc',
                'title-desc',
                'dueDate-asc',
                'dueDate-desc',
            ];

            sortOrders.forEach((order) => {
                act(() => {
                    useTaskStore.getState().setSortOrder(order);
                });

                expect(useTaskStore.getState().sortOrder).toBe(order);
            });
        });

        it('should have default sort order', () => {
            const state = useTaskStore.getState();
            expect(state.sortOrder).toBe('dueDate-asc');
        });
    });

    describe('State Initialization', () => {
        it('should have correct initial state', () => {
            const state = useTaskStore.getState();

            expect(state.tasks).toEqual([]);
            expect(state.loading).toBe(false);
            expect(state.error).toBe(null);
            expect(state.searchQuery).toBe('');
            expect(state.sortOrder).toBe('dueDate-asc');
        });

        it('should have all required actions', () => {
            const state = useTaskStore.getState();

            expect(typeof state.addTask).toBe('function');
            expect(typeof state.addTasks).toBe('function');
            expect(typeof state.toggleTask).toBe('function');
            expect(typeof state.deleteTask).toBe('function');
            expect(typeof state.updateTask).toBe('function');
            expect(typeof state.clearAllTasks).toBe('function');
            expect(typeof state.setSearchQuery).toBe('function');
            expect(typeof state.setSortOrder).toBe('function');
        });
    });

    describe('Edge Cases', () => {
        it('should handle adding task with empty description', () => {
            act(() => {
                useTaskStore.getState().addTask({
                    title: 'Task',
                    description: '',
                    isCompleted: false,
                });
            });

            expect(useTaskStore.getState().tasks[0].description).toBe('');
        });

        it('should handle rapid successive operations', () => {
            act(() => {
                useTaskStore.getState().addTask({ title: 'Task 1', isCompleted: false });
                useTaskStore.getState().addTask({ title: 'Task 2', isCompleted: false });
                useTaskStore.getState().addTask({ title: 'Task 3', isCompleted: false });
            });

            const tasks = useTaskStore.getState().tasks;
            expect(tasks).toHaveLength(3);

            act(() => {
                useTaskStore.getState().toggleTask(tasks[0].id);
                useTaskStore.getState().deleteTask(tasks[1].id);
                useTaskStore.getState().updateTask(tasks[2].id, { title: 'Updated' });
            });

            const finalTasks = useTaskStore.getState().tasks;
            expect(finalTasks).toHaveLength(2);
            expect(finalTasks[0].isCompleted).toBe(true);
            expect(finalTasks[1].title).toBe('Updated');
        });
    });
});
