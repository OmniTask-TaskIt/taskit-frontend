export type TaskStatus = 'ACTIVE' | 'ASSIGNED' | 'COMPLETED' | 'REPORTED' | 'DISPUTED' | 'CANCELLED';
export type TaskCategory = 'ARREGLOS' | 'EDUCACION';
export type TaskTab = 'explore' | 'created' | 'assigned' | 'completed';
export type TaskDialog = 'create' | 'delete' | 'accept' | 'report' | 'dispute' | 'approve' | null;
export type TaskSort = 'recent' | 'price';
export interface Task { id:string; title:string; description:string; price:number; category:TaskCategory; status:TaskStatus; createdAt:string; ownerId:string; assigneeId?:string|null; ownerApproved?:boolean; assigneeApproved?:boolean; }
export interface TaskFormValues { title:string; description:string; price:string; category:TaskCategory; }
export interface TaskFilters { query:string; category:TaskCategory|'ALL'; minPrice:string; maxPrice:string; sort:TaskSort; }
export interface TaskApiResponse { content?:Task[]; tasks?:Task[]; data?:Task[]; }
