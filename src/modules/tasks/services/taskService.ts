import { axiosInstance } from '../../authentication/Config/axios';
import { TASKS_API_BASE } from '../config/taskConfig';
import type { AcceptTaskInput, CompleteTaskInput, CreateTaskInput, EditTaskInput, ReasonInput, Task, TaskApiResponse } from '../types/task.types';

const normalize = (value: Task): Task => ({ ...value, id: value.taskId, title: value.taskName, description: value.taskDescription, status: value.taskStatus, createdAt: value.creationDate, ownerId: value.taskOwner, assigneeId: value.taskAssignee });
const unwrap = (data: unknown): Task[] => {
  if (Array.isArray(data)) return (data as Task[]).map(normalize);
  if (data && typeof data === 'object') {
    const response = data as TaskApiResponse;
    if (Array.isArray(response.content)) return response.content.map(normalize);
    if (Array.isArray(response.tasks)) return response.tasks.map(normalize);
    if (Array.isArray(response.data)) return response.data.map(normalize);
  }
  return [];
};

const request = <T>(promise: Promise<{ data: T }>) => promise.then(({ data }) => data);
export const taskService = {
  async createTask(input: CreateTaskInput) {
    console.log('[createTask] Enviando:', input);

    const response = await request(
      axiosInstance.post(`${TASKS_API_BASE}/create`, input)
    );

    console.log('[createTask] Recibido:', response);
    return response;
  },

  async editTask(taskId: string, input: EditTaskInput) {
    console.log('[editTask] Enviando:', { taskId, input });

    const response = await request(
      axiosInstance.put(`${TASKS_API_BASE}/${taskId}`, input)
    );

    console.log('[editTask] Recibido:', response);
    return response;
  },

  async deleteTask(taskId: string) {
    console.log('[deleteTask] Enviando:', { taskId });

    const response = await request(
      axiosInstance.delete(`${TASKS_API_BASE}/${taskId}`)
    );

    console.log('[deleteTask] Recibido:', response);
    return response;
  },

  async acceptTask(taskId: string, input: AcceptTaskInput) {
    console.log('[acceptTask] Enviando:', { taskId, input });

    const response = await request(
      axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/accept`, input)
    );

    console.log('[acceptTask] Recibido:', response);
    return response;
  },

  async reportTask(taskId: string, input: ReasonInput) {
    console.log('[reportTask] Enviando:', { taskId, input });

    const response = await request(
      axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/report`, input)
    );

    console.log('[reportTask] Recibido:', response);
    return response;
  },

  async disputeTask(taskId: string, input: ReasonInput) {
    console.log('[disputeTask] Enviando:', { taskId, input });

    const response = await request(
      axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/dispute`, input)
    );

    console.log('[disputeTask] Recibido:', response);
    return response;
  },

  async completeTask(taskId: string, input: CompleteTaskInput) {
    console.log('[completeTask] Enviando:', { taskId, input });

    const response = await request(
      axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/complete`, input)
    );

    console.log('[completeTask] Recibido:', response);
    return response;
  },

  async searchTasks(params?: Record<string, string | number>) {
    console.log('[searchTasks] Enviando parámetros:', params);

    const response = await axiosInstance.get(
      `${TASKS_API_BASE}/search`,
      { params }
    );

    console.log('[searchTasks] Recibido:', response.data);
    return unwrap(response.data);
  },

  async getTaskFeed(categories?: string[]) {
    console.log('[getTaskFeed] Categorías enviadas:', categories);

    const response = await axiosInstance.get(
      `${TASKS_API_BASE}/feed`,
      {
        params: categories?.map((category) => [
          'categories',
          category
        ])
      }
    );

    console.log('[getTaskFeed] Recibido:', response.data);
    return unwrap(response.data);
  },

  async getCreatedTasks(userId: string) {
    console.log('[getCreatedTasks] Usuario enviado:', userId);

    const response = await axiosInstance.get(
      `${TASKS_API_BASE}/history/created/${encodeURIComponent(userId)}`
    );

    console.log('[getCreatedTasks] Recibido:', response.data);
    return unwrap(response.data);
  },

  async getAssignedTasks(userId: string) {
    console.log('[getAssignedTasks] Usuario enviado:', userId);

    const response = await axiosInstance.get(
      `${TASKS_API_BASE}/history/assigned/${encodeURIComponent(userId)}`
    );

    console.log('[getAssignedTasks] Recibido:', response.data);
    return unwrap(response.data);
  },

  async getCompletedTasks(userId: string) {
    console.log('[getCompletedTasks] Usuario enviado:', userId);

    const response = await axiosInstance.get(
      `${TASKS_API_BASE}/history/completed/${encodeURIComponent(userId)}`
    );

    console.log('[getCompletedTasks] Recibido:', response.data);
    return unwrap(response.data);
  },

  async healthCheck() {
    console.log('[healthCheck] Consultando:', `${TASKS_API_BASE}/health`);

    const response = await request(
      axiosInstance.get(`${TASKS_API_BASE}/health`)
    );

    console.log('[healthCheck] Recibido:', response);
    return response;
  },

  async getCategories() {
    console.log(
      '[getCategories] Consultando:',
      `${TASKS_API_BASE}/categories`
    );
  
    const response = await axiosInstance.get(
      `${TASKS_API_BASE}/categories`
    );
  
    console.log('[getCategories] Recibido:', response.data);
  
    return unwrap(response.data);
  },
};