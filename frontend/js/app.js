import { api } from './api.js';

const tasksContainer = document.getElementById('tasks-container');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskTitle = document.getElementById('new-task-title');

// Dropdown/Option elements
const scheduleOption = document.getElementById('schedule-option');
const scheduleDropdown = document.getElementById('schedule-dropdown');
const scheduleLabel = document.getElementById('schedule-label');

const quickTaskHour = document.getElementById('quick-task-hour');
const quickTaskMinute = document.getElementById('quick-task-minute');
const quickTaskEndHour = document.getElementById('quick-task-end-hour');
const quickTaskEndMinute = document.getElementById('quick-task-end-minute');
const quickTimeClear = document.getElementById('quick-time-clear');

const labelOption = document.getElementById('label-option');
const labelDropdown = document.getElementById('label-dropdown');
const selectedLabelText = document.getElementById('selected-label-text');
const createLabelBtn = document.getElementById('create-label-btn');

// Modal elements
const taskModal = document.getElementById('task-modal');
const editTaskTitle = document.getElementById('edit-task-title');
const editTaskDesc = document.getElementById('edit-task-desc');
const editTaskDate = document.getElementById('edit-task-date');
const editTaskStartHour = document.getElementById('edit-task-start-hour');
const editTaskStartMinute = document.getElementById('edit-task-start-minute');
const editTaskEndHour = document.getElementById('edit-task-end-hour');
const editTaskEndMinute = document.getElementById('edit-task-end-minute');
const editTaskLabelSelect = document.getElementById('edit-task-label-select');
const saveTaskBtn = document.getElementById('save-task-btn');
const deleteModalBtn = document.getElementById('delete-task-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

let selectedDate = new Date();
let selectedLabel = "Default";
let selectedTime = null;
let selectedEndTime = null;
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

const tabList = document.getElementById('tab-list-view');
const tabCalendar = document.getElementById('tab-calendar-view');
const tabWeek = document.getElementById('tab-week-view');
const listViewSection = document.getElementById('list-view-section');
const calendarViewSection = document.getElementById('calendar-view-section');
const weekViewSection = document.getElementById('week-view-section');

function setupViewSwitcher() {
    tabList.onclick = () => {
        tabList.style.background = 'var(--primary)';
        tabList.style.borderColor = 'transparent';
        tabCalendar.style.background = 'transparent';
        tabCalendar.style.borderColor = 'var(--glass-border)';
        tabWeek.style.background = 'transparent';
        tabWeek.style.borderColor = 'var(--glass-border)';
        
        listViewSection.style.display = 'grid'; 
        calendarViewSection.style.display = 'none';
        weekViewSection.style.display = 'none';
        document.querySelector('aside').style.display = 'block'; 
        loadTasks();
    };

    tabCalendar.onclick = () => {
        tabCalendar.style.background = 'var(--primary)';
        tabCalendar.style.borderColor = 'transparent';
        tabList.style.background = 'transparent';
        tabList.style.borderColor = 'var(--glass-border)';
        tabWeek.style.background = 'transparent';
        tabWeek.style.borderColor = 'var(--glass-border)';
        
        listViewSection.style.display = 'none';
        calendarViewSection.style.display = 'block';
        weekViewSection.style.display = 'none';
        document.querySelector('aside').style.display = 'none'; 
        renderFullCalendar();
    };

    tabWeek.onclick = () => {
        tabWeek.style.background = 'var(--primary)';
        tabWeek.style.borderColor = 'transparent';
        tabList.style.background = 'transparent';
        tabList.style.borderColor = 'var(--glass-border)';
        tabCalendar.style.background = 'transparent';
        tabCalendar.style.borderColor = 'var(--glass-border)';
        
        listViewSection.style.display = 'none';
        calendarViewSection.style.display = 'none';
        weekViewSection.style.display = 'block';
        document.querySelector('aside').style.display = 'none'; 
        renderWeeklyView();
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
        
        // Default to current hour, end +1 hour
        const now = new Date();
        const startHour = now.getHours();
        const endHour = (startHour + 1) % 24;
        const minStr = now.getMinutes().toString().padStart(2, '0');
        
        editTaskStartHour.value = startHour.toString().padStart(2, '0');
        editTaskStartMinute.value = minStr;
        
        editTaskEndHour.value = endHour.toString().padStart(2, '0');
        editTaskEndMinute.value = minStr;

        editTaskLabelSelect.value = selectedLabel;
        
        deleteModalBtn.style.display = 'none'; // Hide delete button when creating
        taskModal.style.display = 'flex';
    };
}

// --- UI Logic ---
function setupDropdowns() {
    // Toggle dropdowns
    scheduleOption.onclick = (e) => {
        e.stopPropagation();
        scheduleDropdown.style.display = scheduleDropdown.style.display === 'flex' ? 'none' : 'flex';
        labelDropdown.style.display = 'none';

        // Initialize with current time if empty and dropdown is opening
        if (scheduleDropdown.style.display === 'flex' && !quickTaskHour.value) {
            const now = new Date();
            quickTaskHour.value = now.getHours().toString().padStart(2, '0');
            quickTaskMinute.value = now.getMinutes().toString().padStart(2, '0');
            quickTaskEndHour.value = ((now.getHours() + 1) % 24).toString().padStart(2, '0');
            quickTaskEndMinute.value = quickTaskMinute.value;
        }
    };

    labelOption.onclick = (e) => {
        e.stopPropagation();
        labelDropdown.style.display = labelDropdown.style.display === 'flex' ? 'none' : 'flex';
        scheduleDropdown.style.display = 'none';
    };

    labelDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // Fix: Prevent document.onclick from hiding dropdown
    });

    document.addEventListener('click', () => {
        scheduleDropdown.style.display = 'none';
        labelDropdown.style.display = 'none';
        document.getElementById('mini-calendar-container').style.display = 'none'; // reset
    });

    scheduleDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Date selection
    const dateOptions = scheduleDropdown.querySelectorAll('.dropdown-item[data-value]');
    dateOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            const val = e.currentTarget.dataset.value;
            if (!val) return;
            
            if (val === 'today') {
                selectedDate = new Date();
                updateScheduleLabel();
                // scheduleDropdown.style.display = 'none'; // Keep open to allow time adjustment
                document.getElementById('mini-calendar-container').style.display = 'none';
            } else if (val === 'tomorrow') {
                selectedDate = new Date();
                selectedDate.setDate(selectedDate.getDate() + 1);
                updateScheduleLabel();
                // scheduleDropdown.style.display = 'none';
                document.getElementById('mini-calendar-container').style.display = 'none';
            }
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
            updateScheduleLabel();
            // Optional: hide mini calendar but keep schedule dropdown open
            document.getElementById('mini-calendar-container').style.display = 'none';
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
        let dateStyle = 'font-size: 11px; color: var(--text-muted)';

        if (task.status === 'completed') {
            titleStyle = 'text-decoration: line-through; color: white; opacity: 0.9;';
        } else if (isOverdue) {
            dateStyle = 'font-size: 11px; color: #ef4444; font-weight: bold;'; // Overdue red on date
        }

        taskEl.innerHTML = `
            <div class="check-btn ${task.status === 'completed' ? 'completed' : ''}" onclick="event.stopPropagation(); toggleTaskStatus('${task.id}', '${task.status}')">
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div class="task-info" onclick="openTaskModal('${task.id}')" style="cursor: pointer; flex-grow: 1; margin-left: 1rem;">
                <h3 class="task-item-title" style="${titleStyle}">${task.title}</h3>
                <div class="task-meta" style="display: flex; gap: 0.5rem; align-items: center; margin-top: 4px;">
                    <span class="label" ${labelStyle}>${task.label || 'Default'}</span>
                    <span style="${dateStyle}">${new Date(task.due_date || task.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        tasksContainer.appendChild(taskEl);
    });
}

// Format number inputs to be 2-digit zero-padded
const timeInputs = [
    editTaskStartHour, editTaskEndHour, quickTaskHour, quickTaskEndHour,
    editTaskStartMinute, editTaskEndMinute, quickTaskMinute, quickTaskEndMinute
];

timeInputs.forEach(input => {
    if (!input) return;
    input.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 0;
        const max = parseInt(e.target.max, 10);
        const min = parseInt(e.target.min, 10);
        if (val < min) val = max;
        if (val > max) val = min;
        e.target.value = val.toString().padStart(2, '0');
    });
});

// Schedule updates logic follows below

function updateScheduleLabel() {
    let dateStr = "Today";
    const today = new Date();
    today.setHours(0,0,0,0);
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0,0,0,0);

    if (targetDate.getTime() === today.getTime()) {
        dateStr = "Today";
    } else {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        if (targetDate.getTime() === tomorrow.getTime()) {
            dateStr = "Tomorrow";
        } else {
            dateStr = targetDate.toLocaleDateString();
        }
    }

    let timeStr = "Now";
    if (selectedTime) {
        timeStr = selectedTime;
        if (selectedEndTime) {
            timeStr += ` - ${selectedEndTime}`;
        }
    }

    scheduleLabel.textContent = `${dateStr}, ${timeStr}`;
}

const updateQuickTime = () => {
    const h = quickTaskHour.value;
    const m = quickTaskMinute.value;
    const eh = quickTaskEndHour.value;
    const em = quickTaskEndMinute.value;
    
    if (h && m) {
        selectedTime = `${h}:${m}`;
        if (eh && em) {
            selectedEndTime = `${eh}:${em}`;
        } else {
            selectedEndTime = null;
        }
        updateScheduleLabel();
    }
};

quickTaskHour.onchange = updateQuickTime;
quickTaskMinute.onchange = updateQuickTime;
quickTaskEndHour.onchange = updateQuickTime;
quickTaskEndMinute.onchange = updateQuickTime;

quickTimeClear.onclick = (e) => {
    e.stopPropagation();
    selectedTime = null;
    selectedEndTime = null;
    selectedDate = new Date();
    quickTaskHour.value = '';
    quickTaskMinute.value = '';
    quickTaskEndHour.value = '';
    quickTaskEndMinute.value = '';
    updateScheduleLabel();
    scheduleDropdown.style.display = 'none';
};

async function handleAddTask() {
    const title = newTaskTitle.value.trim();
    if (!title) return;

    try {
        const startDate = new Date(selectedDate);
        let endDate = new Date(selectedDate);
        
        if (selectedTime) {
            const [h, m] = selectedTime.split(':');
            startDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
            
            if (selectedEndTime) {
                const [eh, em] = selectedEndTime.split(':');
                endDate.setHours(parseInt(eh, 10), parseInt(em, 10), 0, 0);
                if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
            } else {
                endDate.setHours(startDate.getHours() + 1);
            }
        } else {
            const now = new Date();
            startDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
            endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 1);
        }

        await api.createTask({ 
            title, 
            label: selectedLabel,
            due_date: startDate.toISOString(),
            end_time: endDate.toISOString()
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

    // Modal Date Pickers (Cleaned up buttons)

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
    
    if (task.due_date) {
        const d = new Date(task.due_date);
        editTaskStartHour.value = d.getHours().toString().padStart(2, '0');
        editTaskStartMinute.value = d.getMinutes().toString().padStart(2, '0');
    } else {
        editTaskStartHour.value = '00';
        editTaskStartMinute.value = '00';
    }

    if (task.end_time) {
        const e = new Date(task.end_time);
        editTaskEndHour.value = e.getHours().toString().padStart(2, '0');
        editTaskEndMinute.value = e.getMinutes().toString().padStart(2, '0');
    } else {
        // default 1 hr later
        const startH = task.due_date ? new Date(task.due_date).getHours() : 0;
        const endH = (startH + 1) % 24;
        editTaskEndHour.value = endH.toString().padStart(2, '0');
        editTaskEndMinute.value = '00';
    }

    editTaskLabelSelect.value = task.label || 'Default';
    
    taskModal.style.display = 'flex';
};

async function handleSaveEdit() {
    try {
        // Combine date and time (Fix local timezone parsing)
        const [y, m, d] = editTaskDate.value.split('-');
        const baseDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        
        const startH = editTaskStartHour.value;
        const startM = editTaskStartMinute.value;
        const endH = editTaskEndHour.value;
        const endM = editTaskEndMinute.value;
        
        const startDate = new Date(baseDate);
        if (startH) { startDate.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0); }
        
        const endDate = new Date(baseDate);
        if (endH) { endDate.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0); }

        // Handle overnight tasks (end time is smaller than start time)
        if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }

        const payload = {
            title: editTaskTitle.value,
            description: editTaskDesc.value,
            due_date: startDate.toISOString(),
            end_time: endDate.toISOString(),
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

// ==========================================
// WEEKLY VIEW LOGIC (DRAG & DROP)
// ==========================================
let currentWeekStart = getStartOfWeek(new Date());

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay() || 7; // Sunday is 0, make it 7
    d.setDate(d.getDate() - day + 1); // Monday
    d.setHours(0, 0, 0, 0);
    return d;
}

document.getElementById('week-prev-btn').onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeeklyView();
};

document.getElementById('week-next-btn').onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeeklyView();
};

async function renderWeeklyView() {
    const headersGrid = document.getElementById('week-headers');
    const alldayGrid = document.getElementById('week-allday-grid');
    const bodyGrid = document.getElementById('week-body-grid');
    
    // Set Header Label
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    document.getElementById('week-view-label').textContent = 
        `Week of ${currentWeekStart.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;

    // Clear Grids
    headersGrid.innerHTML = '<div class="week-header-cell">GMT</div>';
    alldayGrid.innerHTML = '<div class="week-allday-label">All Day</div>';
    bodyGrid.innerHTML = '<div class="week-time-labels" id="week-time-labels"></div>';

    // Time Labels Column
    const timeLabelsCol = bodyGrid.querySelector('#week-time-labels');
    for (let i = 0; i < 24; i++) {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = `${i.toString().padStart(2, '0')}:00`;
        timeLabelsCol.appendChild(label);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // Render 7 Days columns
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);

        const isToday = date.getTime() === today.getTime();

        // 1. Header
        const headerCell = document.createElement('div');
        headerCell.className = `week-header-cell ${isToday ? 'today' : ''}`;
        headerCell.innerHTML = `<div>${date.toLocaleDateString('en-US', { weekday: 'short' })}</div><div style="font-size: 1.2rem">${date.getDate()}</div>`;
        headersGrid.appendChild(headerCell);

        // 2. All Day Cell (Dropzone)
        const alldayCell = document.createElement('div');
        alldayCell.className = 'week-allday-cell';
        alldayCell.dataset.date = date.toISOString();
        alldayCell.ondragover = handleDragOver;
        alldayCell.ondrop = handleDropAllDay;
        alldayCell.ondragenter = (e) => e.target.classList.add('drag-over');
        alldayCell.ondragleave = (e) => e.target.classList.remove('drag-over');
        alldayGrid.appendChild(alldayCell);

        // 3. Body Column (24 slots)
        const dayCol = document.createElement('div');
        dayCol.className = 'week-day-col';
        dayCol.dataset.date = date.toISOString();
        
        for (let h = 0; h < 24; h++) {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.dataset.hour = h;
            slot.dataset.date = date.toISOString();
            slot.ondragover = handleDragOver;
            slot.ondrop = handleDropTimed;
            slot.ondragenter = (e) => e.target.classList.add('drag-over');
            slot.ondragleave = (e) => e.target.classList.remove('drag-over');
            dayCol.appendChild(slot);
        }
        bodyGrid.appendChild(dayCol);
    }

    // Fetch and populate tasks
    try {
        const tasks = await api.getTasks();
        const pendingTasks = tasks.filter(t => t.status !== 'completed');
        
        const tasksByDay = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            const localDateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            tasksByDay[localDateStr] = [];
        }

        pendingTasks.forEach(task => {
            const taskDate = new Date(task.due_date || task.created_at);
            const taskTime = taskDate.getTime();
            
            // Check if task falls within this week
            const startOfWkTime = currentWeekStart.getTime();
            const endOfWkTime = endOfWeek.getTime() + 86400000;

            if (taskTime >= startOfWkTime && taskTime < endOfWkTime) {
                const isAllDay = taskDate.getHours() === 0 && taskDate.getMinutes() === 0;
                if (isAllDay) {
                    renderTaskOnGrid(task, taskDate, true, null);
                } else {
                    const localDateStr = new Date(taskDate.getTime() - taskDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                    if (tasksByDay[localDateStr]) {
                        tasksByDay[localDateStr].push(task);
                    }
                }
            }
        });

        // Process overlaps for each day
        Object.keys(tasksByDay).forEach(dateStr => {
            const dayTasks = tasksByDay[dateStr];
            if (dayTasks.length === 0) return;

            // Sort by start time
            dayTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

            // Simple overlap logic: cluster overlapping tasks
            const clusters = [];
            let currentCluster = [];
            let maxEndInCluster = 0;

            dayTasks.forEach(task => {
                const start = new Date(task.due_date).getTime();
                const end = task.end_time ? new Date(task.end_time).getTime() : start + 3600000; // default 1 hour
                
                if (currentCluster.length === 0 || start < maxEndInCluster) {
                    currentCluster.push(task);
                    maxEndInCluster = Math.max(maxEndInCluster, end);
                } else {
                    clusters.push(currentCluster);
                    currentCluster = [task];
                    maxEndInCluster = end;
                }
            });
            if (currentCluster.length > 0) clusters.push(currentCluster);

            // Render clusters
            clusters.forEach(cluster => {
                const numInCluster = cluster.length;
                const widthPct = 96 / numInCluster;
                cluster.forEach((task, index) => {
                    const leftPct = 2 + (index * widthPct);
                    renderTaskOnGrid(task, new Date(task.due_date), false, { width: `${widthPct}%`, left: `${leftPct}%` });
                });
            });
        });

    } catch (e) { console.error(e); }
}

window.renderWeeklyView = renderWeeklyView;

function renderTaskOnGrid(task, dateObj, isAllDay, overlapStyles) {
    const colDateStr = new Date(dateObj);
    colDateStr.setHours(0,0,0,0);

    const taskEl = document.createElement('div');
    taskEl.className = 'week-task-block';
    taskEl.draggable = true;
    
    const timeText = isAllDay ? "" : `<div><b>${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}</b></div>`;
    taskEl.innerHTML = `${timeText}<div>${task.title}</div>`;
    taskEl.dataset.id = task.id;
    
    taskEl.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => taskEl.style.opacity = '0.5', 0);
    };
    taskEl.ondragend = (e) => {
        taskEl.style.opacity = '1';
    };
    taskEl.onclick = (e) => {
        e.stopPropagation();
        openTaskModal(task.id);
    };

    const labelObj = customLabels.find(l => l.name === task.label);
    if (labelObj) {
        taskEl.style.backgroundColor = labelObj.color;
        taskEl.style.borderLeftColor = "white";
    }

    if (isAllDay) {
        // Find Allday cell
        const cells = document.querySelectorAll('.week-allday-cell');
        cells.forEach(cell => {
            const cellDate = new Date(cell.dataset.date);
            if (cellDate.getTime() === colDateStr.getTime()) {
                cell.appendChild(taskEl);
            }
        });
    } else {
        // Calculate duration and height
        const startMs = dateObj.getTime();
        const endMs = task.end_time ? new Date(task.end_time).getTime() : startMs + 3600000;
        const durationHours = (endMs - startMs) / 3600000;
        const heightPx = Math.max(20, durationHours * 60);

        // Find Body col
        const cols = document.querySelectorAll('.week-day-col');
        cols.forEach(col => {
            const cellDate = new Date(col.dataset.date);
            if (cellDate.getTime() === colDateStr.getTime()) {
                const hour = dateObj.getHours();
                const min = dateObj.getMinutes();
                const topPos = (hour * 60) + (min); 
                taskEl.style.top = `${topPos}px`;
                taskEl.style.height = `${heightPx}px`; 
                
                if (overlapStyles) {
                    taskEl.style.width = overlapStyles.width;
                    taskEl.style.left = overlapStyles.left;
                }
                
                col.appendChild(taskEl);
            }
        });
    }
}

// Drag & Drop Handlers
function handleDragOver(e) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
}

async function handleDropAllDay(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const newDateStr = e.currentTarget.dataset.date;
    const newDate = new Date(newDateStr);
    newDate.setHours(0,0,0,0); // All day

    await updateTaskTimes(taskId, newDate, null);
}

async function handleDropTimed(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const newDateStr = e.currentTarget.dataset.date;
    const hour = parseInt(e.currentTarget.dataset.hour, 10);
    
    const newDate = new Date(newDateStr);
    newDate.setHours(hour, 0, 0, 0);

    // Fetch the task to preserve its duration
    const tasks = await api.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const startMs = new Date(task.due_date || task.created_at).getTime();
    const endMs = task.end_time ? new Date(task.end_time).getTime() : startMs + 3600000;
    const durationMs = endMs - startMs;

    const newEndDate = new Date(newDate.getTime() + durationMs);

    await updateTaskTimes(taskId, newDate, newEndDate);
}

async function updateTaskTimes(taskId, newStartDate, newEndDate) {
    try {
        const payload = { due_date: newStartDate.toISOString() };
        if (newEndDate) {
            payload.end_time = newEndDate.toISOString();
        }
        await api.updateTask(taskId, payload);
        // Refresh views
        loadTasks();
        renderFullCalendar();
        renderWeeklyView();
        window.dispatchEvent(new CustomEvent('tasks-updated'));
    } catch (e) {
        console.error("Failed to update task date", e);
    }
}
