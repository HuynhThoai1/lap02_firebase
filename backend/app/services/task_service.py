from datetime import datetime
from ..core.firebase import get_db
from ..schemas.task import TaskCreate, TaskUpdate

db = get_db()
TASKS_COLLECTION = "tasks"

class TaskService:
    @staticmethod
    def create_task(user_id: str, task: TaskCreate):
        task_data = task.dict()
        task_data["user_id"] = user_id
        task_data["created_at"] = datetime.utcnow()
        task_data["updated_at"] = datetime.utcnow()
        
        doc_ref = db.collection(TASKS_COLLECTION).document()
        doc_ref.set(task_data)
        
        task_data["id"] = doc_ref.id
        return task_data

    @staticmethod
    def get_tasks(user_id: str):
        tasks = []
        docs = db.collection(TASKS_COLLECTION).where("user_id", "==", user_id).stream()
        for doc in docs:
            task = doc.to_dict()
            task["id"] = doc.id
            tasks.append(task)
        return tasks

    @staticmethod
    def update_task(user_id: str, task_id: str, task: TaskUpdate):
        doc_ref = db.collection(TASKS_COLLECTION).document(task_id)
        doc = doc_ref.get()
        
        if not doc.exists or doc.to_dict().get("user_id") != user_id:
            return None
        
        update_data = {k: v for k, v in task.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get().to_dict()
        updated_doc["id"] = task_id
        return updated_doc

    @staticmethod
    def delete_task(user_id: str, task_id: str):
        doc_ref = db.collection(TASKS_COLLECTION).document(task_id)
        doc = doc_ref.get()
        
        if not doc.exists or doc.to_dict().get("user_id") != user_id:
            return False
        
        doc_ref.delete()
        return True
