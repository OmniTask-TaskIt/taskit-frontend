export type TaskStatus = 'ACTIVE' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'REPORTED' | 'DISPUTED';
export type TaskCategory = 'ARREGLOS' | 'EDUCACION';
export type TaskTab = 'explore' | 'created' | 'assigned' | 'completed';
export type TaskDialog = 'create' | 'edit' | 'delete' | 'accept' | 'report' | 'dispute' | 'approve' | null;
export type TaskSort = 'recent' | 'price';

export interface Task {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskStatus: TaskStatus;
  taskOwner: string;
  taskAssignee?: string | null;
  creationDate: string;
  category: TaskCategory;
  price: number;
  reportReason?: string | null;
  disputeReason?: string | null;
  ownerApproval: boolean;
  assigneeApproval: boolean;
  /** Campos normalizados usados por la interfaz existente. */
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  createdAt?: string;
  ownerId?: string;
  assigneeId?: string | null;
}

export interface CreateTaskInput { taskOwner: string; taskName: string; taskDescription: string; price: number; category: TaskCategory; }
export interface EditTaskInput { taskName: string; taskDescription: string; price: number; category: TaskCategory; }
export interface AcceptTaskInput { taskAssignee: string; }
export interface ReasonInput { reason: string; }
export interface CompleteTaskInput { userId: string; }
export interface TaskCompletionStatus { taskId: string; status: TaskStatus | 'SEMI_COMPLETED' | string; ownerApproved: boolean; assigneeApproved: boolean; ownerId: string; assigneeId: string; }
export interface TaskFormValues { title: string; description: string; price: string; category: TaskCategory; }
export interface TaskFilters { query: string; category: TaskCategory | 'ALL'; minPrice: string; maxPrice: string; sort: TaskSort; }
export interface TaskApiResponse { content?: Task[]; tasks?: Task[]; data?: Task[]; }
