from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..services.task_service import TaskService
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskCreate, user = Depends(get_current_user)):
    return TaskService.create_task(user["uid"], task)

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(user = Depends(get_current_user)):
    return TaskService.get_tasks(user["uid"])

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task: TaskUpdate, user = Depends(get_current_user)):
    updated_task = TaskService.update_task(user["uid"], task_id, task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized")
    return updated_task

@router.delete("/{task_id}")
async def delete_task(task_id: str, user = Depends(get_current_user)):
    success = TaskService.delete_task(user["uid"], task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized")
    return {"message": "Task deleted successfully"}
