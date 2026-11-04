import { useCallback, useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task.types';
export function useTasks(){ const [tasks,setTasks]=useState<Task[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const load=useCallback(async()=>{setLoading(true);setError('');try{setTasks(await taskService.getFeed());}catch{setError('No pudimos conectar con el backend. Intenta nuevamente en unos momentos.');}finally{setLoading(false);}},[]); useEffect(()=>{void load();},[load]); return {tasks,setTasks,loading,error,setError,load}; }
