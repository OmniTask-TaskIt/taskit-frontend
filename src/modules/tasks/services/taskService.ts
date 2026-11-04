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
  async createTask(input: CreateTaskInput) { return request(axiosInstance.post(`${TASKS_API_BASE}/create`, input)); },
  async editTask(taskId: string, input: EditTaskInput) { return request(axiosInstance.put(`${TASKS_API_BASE}/${taskId}`, input)); },
  async deleteTask(taskId: string) { return request(axiosInstance.delete(`${TASKS_API_BASE}/${taskId}`)); },
  async acceptTask(taskId: string, input: AcceptTaskInput) { return request(axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/accept`, input)); },
  async reportTask(taskId: string, input: ReasonInput) { return request(axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/report`, input)); },
  async disputeTask(taskId: string, input: ReasonInput) { return request(axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/dispute`, input)); },
  async completeTask(taskId: string, input: CompleteTaskInput) { return request(axiosInstance.patch(`${TASKS_API_BASE}/${taskId}/complete`, input)); },
  async searchTasks(params?: Record<string, string | number>) { return unwrap((await axiosInstance.get(`${TASKS_API_BASE}/search`, { params })).data); },
  async getTaskFeed(categories?: string[]) { return unwrap((await axiosInstance.get(`${TASKS_API_BASE}/feed`, { params: categories?.map((category) => ['categories', category]) })).data); },
  async getCreatedTasks(userId: string) { return unwrap((await axiosInstance.get(`${TASKS_API_BASE}/history/created/${encodeURIComponent(userId)}`)).data); },
  async getAssignedTasks(userId: string) { return unwrap((await axiosInstance.get(`${TASKS_API_BASE}/history/assigned/${encodeURIComponent(userId)}`)).data); },
  async getCompletedTasks(userId: string) { return unwrap((await axiosInstance.get(`${TASKS_API_BASE}/history/completed/${encodeURIComponent(userId)}`)).data); },
  async healthCheck() { return request(axiosInstance.get(`${TASKS_API_BASE}/health`)); },
};
