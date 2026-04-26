import { api } from './api.js';

const tasksContainer = document.getElementById('tasks-container');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskTitle = document.getElementById('new-task-title');

// Dropdown/Option elements
const dateOption = document.getElementById('date-option');
const dateDropdown = document.getElementById('date-dropdown');

const dateLabel = document.getElementById('selected-date-label');

const labelOption = document.getElementById('label-option');
const labelDropdown = document.getElementById('label-dropdown');
const selectedLabelText = document.getElementById('selected-label-text');
const createLabelBtn = document.getElementById('create-label-btn');

// Modal elements
const taskModal = document.getElementById('task-modal');
const editTaskTitle = document.getElementById('edit-task-title');
const editTaskDesc = document.getElementById('edit-task-desc');
const editTaskDate = document.getElementById('edit-task-date');
const editTaskLabelSelect = document.getElementById('edit-task-label-select');
const saveTaskBtn = document.getElementById('save-task-btn');
const deleteModalBtn = document.getElementById('delete-task-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

let selectedDate = new Date();
let selectedLabel = "Default";
let currentEditingTaskId = null;
let currentFilterDate = null;
let customLabels = JSON.parse(localStorage.getItem('customLabels')) || [];

// --- Initialization ---
function init() {
    setupDropdowns();
    setupLabelCreator();
    setupModal();
    setupViewSwitcher();
    setupExpandTask();
    loadTasks();
    refreshLabelLists();
    renderFullCalendar();
}

// --- View Switcher ---
const tabList = document.getElementById('tab-list-view');
const tabCalendar = document.getElementById('tab-calendar-view');
const listViewSection = document.getElementById('list-view-section');
const calendarViewSection = document.getElementById('calendar-view-section');

function setupViewSwitcher() {
    tabList.onclick = () => {
        tabList.style.background = 'var(--primary)';
        tabList.style.borderColor = 'transparent';
        tabCalendar.style.background = 'transparent';
        tabCalendar.style.borderColor = 'var(--glass-border)';
        
        listViewSection.style.display = 'grid'; // .app-grid uses grid
        calendarViewSection.style.display = 'none';
        document.querySelector('aside').style.display = 'block'; // Ensure sidebar calendar is visible
        loadTasks();
    };

    tabCalendar.onclick = () => {
        tabCalendar.style.background = 'var(--primary)';
        tabCalendar.style.borderColor = 'transparent';
        tabList.style.background = 'transparent';
        tabList.style.borderColor = 'var(--glass-border)';
        
        listViewSection.style.display = 'none';
        calendarViewSection.style.display = 'block';
        document.querySelector('aside').style.display = 'none'; // Hide sidebar calendar
        renderFullCalendar();
    };
}

// --- Expand Task ---
function setupExpandTask() {
    const expandBtn = document.getElementById('expand-task-btn');
    expandBtn.onclick = () => {
        currentEditingTaskId = null; // null means create mode
        document.getElementById('modal-title').textContent = 'Create Task';
        
        editTaskTitle.value = newTaskTitle.value.trim();
        editTaskDesc.value = '';
        editTaskDate.value = selectedDate.toISOString().split('T')[0];
        editTaskLabelSelect.value = selectedLabel;
        
        deleteModalBtn.style.display = 'none'; // Hide delete button when creating
        taskModal.style.display = 'flex';
    };
}

// --- UI Logic ---
function setupDropdowns() {
    // Toggle dropdowns
    dateOption.onclick = (e) => {
        e.stopPropagation();
        dateDropdown.style.display = dateDropdown.style.display === 'flex' ? 'none' : 'flex';
        labelDropdown.style.display = 'none';
    };

    labelOption.onclick = (e) => {
        e.stopPropagation();
        labelDropdown.style.display = labelDropdown.style.display === 'flex' ? 'none' : 'flex';
        dateDropdown.style.display = 'none';
    };

    labelDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // Fix: Prevent document.onclick from hiding dropdown
    });

    document.addEventListener('click', () => {
        dateDropdown.style.display = 'none';
        labelDropdown.style.display = 'none';
        document.getElementById('mini-calendar-container').style.display = 'none'; // reset
    });

    dateDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Date selection
    const dateOptions = dateDropdown.querySelectorAll('div[data-value]');
    dateOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const val = e.target.dataset.value;
            if (!val) return;
            
            if (val === 'today') {
                selectedDate = new Date();
                dateLabel.textContent = "Today";
                dateDropdown.style.display = 'none';
                document.getElementById('mini-calendar-container').style.display = 'none';
            } else if (val === 'tomorrow') {
                selectedDate = new Date();
                selectedDate.setDate(selectedDate.getDate() + 1);
                dateLabel.textContent = "Tomorrow";
                dateDropdown.style.display = 'none';
                document.getElementById('mini-calendar-container').style.display = 'none';
            }
            // 'custom' is handled by hover now, but if clicked, do nothing
        });
    });

    const customTrigger = document.getElementById('custom-date-trigger');
    const miniCal = document.getElementById('mini-calendar-container');

    customTrigger.addEventListener('mouseenter', () => {
        miniCal.style.display = 'block';
        renderMiniCalendar();
    });
}

function setupLabelCreator() {
    createLabelBtn.onclick = () => {
        const name = document.getElementById('new-label-name').value;
        const color = document.getElementById('new-label-color').value;
        if (!name) return;

        const newLabel = { name, color };
        customLabels.push(newLabel);
        localStorage.setItem('customLabels', JSON.stringify(customLabels));
        
        refreshLabelLists();
        selectLabel(name);
        
        document.getElementById('new-label-name').value = '';
    };

    labelDropdown.addEventListener('click', (e) => {
        const val = e.target.dataset.value;
        if (val && e.target.closest('#custom-label-creator') === null) {
            selectLabel(val);
            labelDropdown.style.display = 'none';
        }
    });
}

function selectLabel(name) {
    selectedLabel = name;
    selectedLabelText.textContent = name;
}

function refreshLabelLists() {
    // Update main dropdown
    const existing = labelDropdown.querySelectorAll('.custom-label-item');
    existing.forEach(el => el.remove());

    customLabels.forEach(lb => {
        const div = document.createElement('div');
        div.className = 'custom-label-item';
        div.dataset.value = lb.name;
        div.style.borderLeft = `4px solid ${lb.color}`;
        div.textContent = lb.name;
        labelDropdown.insertBefore(div, document.getElementById('custom-label-creator'));
    });

    // Update modal select
    editTaskLabelSelect.innerHTML = '<option value="Default">Default</option>';
    customLabels.forEach(lb => {
        const opt = document.createElement('option');
        opt.value = lb.name;
        opt.textContent = lb.name;
        editTaskLabelSelect.appendChild(opt);
    });
}

// --- Mini Calendar Logic ---
let miniCalDate = new Date();

function renderMiniCalendar() {
    const container = document.getElementById('mini-calendar-grid');
    const monthText = document.getElementById('mini-calendar-month');
    if (!container) return;
    
    container.innerHTML = '';
    const year = miniCalDate.getFullYear();
    const month = miniCalDate.getMonth();
    
    monthText.textContent = miniCalDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Day headers
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach(d => {
        const el = document.createElement('div');
        el.style.cssText = 'font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-bottom: 5px;';
        el.textContent = d;
        container.appendChild(el);
    });
    
    for (let i = 0; i < firstDay; i++) {
        container.appendChild(document.createElement('div'));
    }
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'mini-day';
        dayEl.textContent = day;
        
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        dayEl.onclick = (e) => {
            e.stopPropagation();
            selectedDate = new Date(year, month, day);
            dateLabel.textContent = selectedDate.toLocaleDateString();
            dateDropdown.style.display = 'none';
        };
        
        container.appendChild(dayEl);
    }
}

window.prevMiniMonth = (e) => {
    e.stopPropagation();
    miniCalDate.setMonth(miniCalDate.getMonth() - 1);
    renderMiniCalendar();
};

window.nextMiniMonth = (e) => {
    e.stopPropagation();
    miniCalDate.setMonth(miniCalDate.getMonth() + 1);
    renderMiniCalendar();
};

// --- Task CRUD ---
async function loadTasks() {
    try {
        const tasks = await api.getTasks();
        if (currentFilterDate) {
            const targetDate = currentFilterDate.toLocaleDateString();
            const filtered = tasks.filter(t => new Date(t.due_date || t.created_at).toLocaleDateString() === targetDate);
            renderTasks(filtered);
        } else {
            const pendingTasks = tasks.filter(t => t.status !== 'completed');
            renderTasks(pendingTasks);
        }
    } catch (e) { console.error(e); }
}

function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    // Sort: pending first, then by deadline (earliest to latest)
    tasks.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'completed' ? 1 : -1;
        }
        const dateA = new Date(a.due_date || a.created_at);
        const dateB = new Date(b.due_date || b.created_at);
        return dateA - dateB;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
        const taskDate = new Date(task.due_date || task.created_at);
        taskDate.setHours(0, 0, 0, 0);
        const isOverdue = task.status !== 'completed' && taskDate < today;

        const taskEl = document.createElement('div');
        taskEl.className = `task-card glass ${task.status === 'completed' ? 'task-done' : ''}`;
        
        const labelObj = customLabels.find(l => l.name === task.label);
        const labelStyle = labelObj ? `style="background: ${labelObj.color}22; color: ${labelObj.color}; border-color: ${labelObj.color}"` : '';

        let titleStyle = '';
        if (task.status === 'completed') {
            titleStyle = 'text-decoration: line-through; color: white; opacity: 0.9;';
        } else if (isOverdue) {
            titleStyle = 'color: #ef4444;'; // Overdue red
        }

        taskEl.innerHTML = `
            <div class="check-btn ${task.status === 'completed' ? 'completed' : ''}" onclick="event.stopPropagation(); toggleTaskStatus('${task.id}', '${task.status}')">
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div class="task-info" onclick="openTaskModal('${task.id}')" style="cursor: pointer; flex-grow: 1; margin-left: 1rem;">
                <h3 style="${titleStyle}">${task.title}</h3>
                <div class="task-meta" style="display: flex; gap: 0.5rem; align-items: center; margin-top: 4px;">
                    <span class="label" ${labelStyle}>${task.label || 'Default'}</span>
                    <span style="font-size: 11px; color: var(--text-muted)">${new Date(task.due_date || task.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        tasksContainer.appendChild(taskEl);
    });
}

async function handleAddTask() {
    const title = newTaskTitle.value.trim();
    if (!title) return;

    try {
        await api.createTask({ 
            title, 
            label: selectedLabel,
            due_date: selectedDate.toISOString()
        });
        newTaskTitle.value = '';
        loadTasks();
        renderFullCalendar();
        window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (e) { alert(e.message); }
}

window.toggleTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await api.updateTask(id, { status: newStatus });
    loadTasks();
    window.dispatchEvent(new CustomEvent('tasks-updated'));
};

// --- Modal Logic ---
function setupModal() {
    closeModalBtn.onclick = () => taskModal.style.display = 'none';
    saveTaskBtn.onclick = handleSaveEdit;
    deleteModalBtn.onclick = handleDeleteFromModal;

    // Modal Date Pickers
    const today = new Date();
    document.getElementById('modal-date-today').onclick = () => {
        editTaskDate.value = today.toISOString().split('T')[0];
    };
    document.getElementById('modal-date-tomorrow').onclick = () => {
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        editTaskDate.value = tmr.toISOString().split('T')[0];
    };

    // Modal Label Creator
    document.getElementById('modal-create-label-btn').onclick = () => {
        const name = document.getElementById('modal-new-label-name').value;
        const color = document.getElementById('modal-new-label-color').value;
        if (!name) return;

        const newLabel = { name, color };
        customLabels.push(newLabel);
        localStorage.setItem('customLabels', JSON.stringify(customLabels));
        
        refreshLabelLists();
        editTaskLabelSelect.value = name;
        document.getElementById('modal-new-label-name').value = '';
    };
}

window.openTaskModal = async (id) => {
    currentEditingTaskId = id;
    document.getElementById('modal-title').textContent = 'Edit Task';
    deleteModalBtn.style.display = 'block';
    
    const tasks = await api.getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editTaskTitle.value = task.title;
    editTaskDesc.value = task.description || '';
    editTaskDate.value = task.due_date ? task.due_date.split('T')[0] : '';
    editTaskLabelSelect.value = task.label || 'Default';
    
    taskModal.style.display = 'flex';
};

async function handleSaveEdit() {
    try {
        const payload = {
            title: editTaskTitle.value,
            description: editTaskDesc.value,
            due_date: new Date(editTaskDate.value).toISOString(),
            label: editTaskLabelSelect.value
        };

        if (currentEditingTaskId) {
            await api.updateTask(currentEditingTaskId, payload);
        } else {
            await api.createTask(payload);
            newTaskTitle.value = ''; // Clear quick add input
        }
        
        taskModal.style.display = 'none';
        loadTasks();
        renderFullCalendar();
        window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (e) { alert(e.message); }
}

async function handleDeleteFromModal() {
    if (currentEditingTaskId && confirm("Delete this task?")) {
        await api.deleteTask(currentEditingTaskId);
        taskModal.style.display = 'none';
        loadTasks();
        renderFullCalendar();
        window.dispatchEvent(new CustomEvent('tasks-updated'));
    }
}

addTaskBtn.onclick = handleAddTask;
document.getElementById('show-all-tasks-btn').onclick = () => {
    currentFilterDate = null;
    document.querySelectorAll('.day').forEach(d => d.style.background = ''); // reset calendar highlighting
    loadTasks();
};

window.addEventListener('auth-success', init);
window.addEventListener('filter-tasks', (e) => {
    currentFilterDate = e.detail.date;
    loadTasks();
});

// --- Full Calendar Logic ---
let fullCalDate = new Date();

async function renderFullCalendar() {
    const container = document.getElementById('full-calendar-grid');
    const monthText = document.getElementById('full-calendar-month');
    if (!container) return;
    
    container.innerHTML = '';
    const year = fullCalDate.getFullYear();
    const month = fullCalDate.getMonth();
    
    monthText.textContent = fullCalDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Day headers
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(d => {
        const el = document.createElement('div');
        el.style.cssText = 'font-weight: bold; color: var(--text-muted); text-align: right; padding-right: 0.5rem; margin-bottom: 0.5rem;';
        el.textContent = d;
        container.appendChild(el);
    });
    
    let tasks = [];
    try {
        tasks = await api.getTasks();
    } catch (e) {}

    // Add empty slots for days of previous month
    for (let i = 0; i < firstDay; i++) {
        container.appendChild(document.createElement('div'));
    }
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'full-day';
        
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        // Header (day number)
        const header = document.createElement('div');
        header.className = 'full-day-header';
        header.textContent = day;
        dayEl.appendChild(header);
        
        // Find tasks for this day
        const dayTasks = tasks.filter(t => {
            const tDate = new Date(t.due_date || t.created_at);
            return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year;
        });

        // Limit to 3 tasks
        const maxDisplay = 3;
        for (let i = 0; i < Math.min(dayTasks.length, maxDisplay); i++) {
            const t = dayTasks[i];
            const taskBar = document.createElement('div');
            taskBar.className = 'calendar-task-bar';
            
            const labelObj = customLabels.find(l => l.name === t.label);
            if (labelObj) {
                taskBar.style.backgroundColor = `${labelObj.color}44`;
                taskBar.style.borderLeftColor = labelObj.color;
            }
            if (t.status === 'completed') {
                taskBar.style.textDecoration = 'line-through';
                taskBar.style.opacity = '0.6';
            }
            
            taskBar.textContent = t.title;
            taskBar.onclick = (e) => {
                e.stopPropagation();
                openTaskModal(t.id);
            };
            dayEl.appendChild(taskBar);
        }

        if (dayTasks.length > maxDisplay) {
            const moreLabel = document.createElement('div');
            moreLabel.className = 'calendar-more-tasks';
            moreLabel.textContent = `+${dayTasks.length - maxDisplay} more`;
            dayEl.appendChild(moreLabel);
        }
        
        // Click day to filter list view
        dayEl.onclick = () => {
            const targetDate = new Date(year, month, day);
            document.getElementById('tab-list-view').click(); // Switch to list view
            window.dispatchEvent(new CustomEvent('filter-tasks', { detail: { date: targetDate } }));
        };
        
        container.appendChild(dayEl);
    }
}

document.getElementById('full-prev-month').onclick = () => {
    fullCalDate.setMonth(fullCalDate.getMonth() - 1);
    renderFullCalendar();
};

document.getElementById('full-next-month').onclick = () => {
    fullCalDate.setMonth(fullCalDate.getMonth() + 1);
    renderFullCalendar();
};
