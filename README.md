# Stellar Tasks 🌟

Stellar Tasks is a premium To-Do web app with a Glassmorphism UI, powered by FastAPI and Firebase.

## 🚀 Quick Start

Follow these steps to set up and run the project locally from the root directory.

### 1. Setup Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Git Bash)
source .venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Firebase
- **Backend:** Place your `firebase-key.json` inside the `backend/` folder.
- **Frontend:** Update `frontend/js/firebase-config.js` with your Web SDK config.

### 3. Run Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 4. Run Frontend (New Terminal)
```bash
cd frontend
python -m http.server 3000
```
Visit: `http://localhost:3000`

## 🌟 Key Features
- **Auth:** Google Sign-In & Email/Password registration.
- **Views:** Switch between List View and Monthly Calendar.
- **Task Logic:** Auto-sort by deadline, overdue highlighting, and custom labels.
- **Design:** Modern Glassmorphism with responsive modal forms.

## 🎨 Customization
Edit `frontend/css/styles.css` to change theme colors:
```css
:root {
    --primary: #3b82f6;
    --bg: #0f172a;
}
```
