import { api } from './api.js';

const calendarDays = document.getElementById('calendar-days');
const currentMonthText = document.getElementById('current-month');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');

let currentDate = new Date();

async function renderCalendar() {
    calendarDays.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthText.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let tasks = [];
    try {
        tasks = await api.getTasks();
    } catch (e) {}
    // Add day headers
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayNames.forEach(d => {
        const headerEl = document.createElement('div');
        headerEl.style.cssText = 'font-size: 0.8rem; color: var(--text-muted); font-weight: bold; margin-bottom: 0.5rem;';
        headerEl.textContent = d;
        calendarDays.appendChild(headerEl);
    });

    // Add empty slots
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarDays.appendChild(emptyDiv);
    }

    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = day;

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        // Check for tasks on this specific day
        const hasTask = tasks.some(t => {
            const tDate = new Date(t.due_date || t.created_at);
            return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year;
        });

        if (hasTask) {
            dayEl.classList.add('has-task');
            // Add a small colored dot
            const dot = document.createElement('span');
            dot.style.cssText = "width: 4px; height: 4px; background: var(--secondary); border-radius: 50%; position: absolute; bottom: 4px;";
            dayEl.style.position = 'relative';
            dayEl.appendChild(dot);
        }

        dayEl.onclick = () => {
            // Remove previous active
            document.querySelectorAll('.day').forEach(d => d.style.background = '');
            dayEl.style.background = 'rgba(139, 92, 246, 0.3)';
            
            // Dispatch filter event
            window.dispatchEvent(new CustomEvent('filter-tasks', { 
                detail: { date: dayDate } 
            }));
        };

        calendarDays.appendChild(dayEl);
    }
}

prevBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

nextBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

window.addEventListener('auth-success', renderCalendar);
window.addEventListener('tasks-updated', renderCalendar);
