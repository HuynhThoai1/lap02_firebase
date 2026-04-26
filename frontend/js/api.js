// Change this to your Render.com URL when deploying (e.g. "https://my-backend.onrender.com")
const API_BASE_URL = "http://localhost:8000";

async function get_headers() {
    const auth = window.firebaseAuth;
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    
    const token = await user.getIdToken(true); // Force refresh to prevent 'issued in future' clock skew errors
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export const api = {
    async getTasks() {
        const headers = await get_headers();
        const response = await fetch(`${API_BASE_URL}/tasks/`, { headers });
        return response.json();
    },

    async createTask(task) {
        const headers = await get_headers();
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            method: "POST",
            headers,
            body: JSON.stringify(task)
        });
        return response.json();
    },

    async updateTask(taskId, updates) {
        const headers = await get_headers();
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(updates)
        });
        return response.json();
    },

    async deleteTask(taskId) {
        const headers = await get_headers();
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers
        });
        return response.json();
    }
};
