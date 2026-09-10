let currentTab = 'dashboard';
let activeStudentId = null;
let activeDepartmentName = 'BSIT';

// 27 BSIT STUDENTS ARRAY
const bsitStudentsList = [
    "Angel Mae G. Adorna", "Jeane M. Ando", "Mark Nyl D. Apiag", "Joann A. Arnan",
    "Louie Jane L. Berdon", "Jubair P. Calib", "Dorelyn B. Canon", "Princess M. Clamor",
    "Dimple P. Garces", "Rona C. Guilingan", "Michael Adrian T. Hadjaluddin", "Sarah M. Hawani",
    "Ricci Aisha Marie S. Labrado", "Riena Mae B. Laure", "Mary Ann L. Maicong", "Raiza S. Olivar",
    "Rodrem A. Providencia", "Yvonne Ashley F. Sanchez", "Kim Bryle P. Tabiliran", "Rosmar G. Tachado",
    "Arianne P. Tagudando", "Raffy A. Tango-an", "Juvierto L. Tuclos", "Jacob James R. Ylanan",
    "Regine S. Lazarina", "Reymar A. Bagang", "Mcky J. Providencia"
];

// INITIAL DATA: 21 Present, 3 Absent, 3 Late
const initialAttendanceData = bsitStudentsList.map((name, index) => {
    let idNum = (index + 1).toString().padStart(3, '0');
    let status = "Present";
    let time = "8:15 AM";

    if (index === 5 || index === 11 || index === 22) {
        status = "Absent";
        time = "--";
    } else if (index === 2 || index === 14 || index === 25) {
        status = "Late";
        time = "8:45 AM";
    }

    return {
        id: (index + 1).toString(),
        studentId: `STU-${idNum}`,
        name: name,
        department: "BSIT",
        status: status,
        time: time
    };
});

const initialStudents = bsitStudentsList.map((name, index) => {
    let idNum = (index + 1).toString().padStart(3, '0');
    let cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    return {
        id: `STU-${idNum}`,
        name: name,
        department: "BSIT",
        email: `${cleanName}@school.edu`,
        rate: (92 + (index % 8) * 1.1).toFixed(1) + "%"
    };
});

const initialClasses = [
    { id: "1", name: "BSIT", teacher: "Prof. Alan Turing", room: "Lab 1", count: 27, rate: "88.9%" }
];

const initialNotifications = [
    { id: 1, title: "Absence alert dispatched for Jubair P. Calib", time: "15 mins ago", type: "SMS", icon: "fa-envelope", bg: "var(--danger-light)", color: "var(--danger)" },
    { id: 2, title: "Tardy arrival recorded for Mark Nyl D. Apiag", time: "30 mins ago", type: "Alert", icon: "fa-clock", bg: "var(--warning-light)", color: "var(--warning)" },
    { id: 3, title: "Morning Roster auto-synced", time: "1 hour ago", type: "System", icon: "fa-arrows-rotate", bg: "var(--primary-light)", color: "var(--primary)" }
];

const initialActivities = [
    { id: 1, title: "Marked Michael Adrian T. Hadjaluddin as Present", time: "Just now", icon: "fa-check", bg: "var(--success-light)", color: "var(--success)" },
    { id: 2, title: "Marked Ricci Aisha Marie S. Labrado as Present", time: "5 mins ago", icon: "fa-check", bg: "var(--success-light)", color: "var(--success)" },
    { id: 3, title: "Marked Sarah M. Hawani as Absent", time: "12 mins ago", icon: "fa-user-xmark", bg: "var(--danger-light)", color: "var(--danger)" },
    { id: 4, title: "Updated attendance status for Mark Nyl D. Apiag", time: "20 mins ago", icon: "fa-pen", bg: "var(--warning-light)", color: "var(--warning)" }
];

const ATTENDANCE_KEY = "edutrack_records_bsit";
const ACTIVITIES_KEY = "edutrack_activities_bsit";
const STUDENTS_KEY = "edutrack_students_bsit";
const NOTIF_KEY = "edutrack_notifs_bsit";
const THEME_KEY = "edutrack_theme_mode";

localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(initialAttendanceData));
localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(initialActivities));
localStorage.setItem(STUDENTS_KEY, JSON.stringify(initialStudents));
localStorage.setItem(NOTIF_KEY, JSON.stringify(initialNotifications));

// DARK MODE LOGIC
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const themeIcon = document.getElementById("theme-icon");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeIcon) themeIcon.className = "fa-solid fa-sun";
    } else {
        document.body.classList.remove("dark-mode");
        if (themeIcon) themeIcon.className = "fa-solid fa-moon";
    }
}

function toggleDarkMode() {
    const body = document.body;
    const themeIcon = document.getElementById("theme-icon");
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem(THEME_KEY, "dark");
        if (themeIcon) themeIcon.className = "fa-solid fa-sun";
    } else {
        localStorage.setItem(THEME_KEY, "light");
        if (themeIcon) themeIcon.className = "fa-solid fa-moon";
    }
}

function handleLogin(e) {
    e.preventDefault();
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-screen").classList.remove("hidden");
    updateDashboardCounters();
    renderTable();
    renderActivities();
    renderStudents();
    renderClasses();
    renderNotifications();
    populateAlertDropdown();
}

function logout() {
    document.getElementById("app-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
}

function getAttendanceData() { return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || []; }
function saveAttendanceData(data) { localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data)); }
function getActivityData() { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY)) || []; }

function addActivity(title, icon, bg, color) {
    const activities = getActivityData();
    activities.unshift({ id: Date.now(), title, time: "Just now", icon, bg, color });
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    renderActivities();
}

function updateDashboardCounters() {
    const data = getAttendanceData();
    const present = data.filter(d => d.status === "Present").length;
    const absent = data.filter(d => d.status === "Absent").length;
    const late = data.filter(d => d.status === "Late").length;
    const total = data.length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) + "%" : "0.0%";

    document.getElementById("stat-present").innerText = present;
    document.getElementById("stat-absent").innerText = absent;
    document.getElementById("stat-late").innerText = late;
    document.getElementById("stat-rate").innerText = rate;
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tab}`).classList.add('active');

    const heading = document.getElementById("page-heading");
    const subheading = document.getElementById("page-subheading");
    const mainStatsGrid = document.getElementById("main-stats-grid");

    heading.innerText = tab.charAt(0).toUpperCase() + tab.slice(1);

    if (['reports', 'notifications', 'settings'].includes(tab)) {
        mainStatsGrid.classList.add("hidden");
    } else {
        mainStatsGrid.classList.remove("hidden");
    }

    document.getElementById("view-dashboard").classList.add("hidden");
    document.getElementById("view-students").classList.add("hidden");
    document.getElementById("view-classes").classList.add("hidden");
    document.getElementById("view-reports").classList.add("hidden");
    document.getElementById("view-notifications").classList.add("hidden");
    document.getElementById("view-settings").classList.add("hidden");

    if (tab === 'dashboard') {
        document.getElementById("view-dashboard").classList.remove("hidden");
        document.getElementById("table-panel-title").innerText = "BSIT Class Attendance Roster";
        subheading.innerText = "Welcome back! Here's your Attendance overview.";
        renderTable();
    } else if (tab === 'attendance') {
        document.getElementById("view-dashboard").classList.remove("hidden");
        document.getElementById("table-panel-title").innerText = "Interactive Attendance Records";
        subheading.innerText = "Click on any student name below to open their attendance log.";
        renderTable();
    } else if (tab === 'students') {
        document.getElementById("view-students").classList.remove("hidden");
        subheading.innerText = "Manage student profiles and view rosters.";
        renderStudents();
    } else if (tab === 'classes') {
        document.getElementById("view-classes").classList.remove("hidden");
        subheading.innerText = "Department schedules and assigned faculty.";
        renderClasses();
    } else if (tab === 'reports') {
        document.getElementById("view-reports").classList.remove("hidden");
        subheading.innerText = "Analytics overview and exportable reports.";
    } else if (tab === 'notifications') {
        document.getElementById("view-notifications").classList.remove("hidden");
        subheading.innerText = "Automated parent SMS alerts and activity logs.";
        renderNotifications();
    } else if (tab === 'settings') {
        document.getElementById("view-settings").classList.remove("hidden");
        subheading.innerText = "Configure attendance cutoffs and school details.";
    }
}

function renderTable() {
    const data = getAttendanceData();
    const query = document.getElementById("global-search").value.toLowerCase();
    const tbody = document.getElementById("recent-attendance-tbody");

    tbody.innerHTML = "";

    const filtered = data.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.studentId.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found.</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const badgeClass = item.status === 'Present' ? 'badge-present' : (item.status === 'Absent' ? 'badge-absent' : 'badge-late');
        
        let nameHTML = "";
        if (currentTab === 'attendance') {
            nameHTML = `<span class="clickable-name" onclick="viewStudentHistory('${item.studentId}', '${item.name}', '${item.department}')">${item.name}</span>`;
        } else {
            nameHTML = `<span class="plain-name">${item.name}</span>`;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${nameHTML}</td>
            <td>${item.department}</td>
            <td><span class="badge ${badgeClass}">${item.status}</span></td>
            <td>${item.time}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editRecord('${item.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord('${item.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderStudents() {
    const list = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    const query = document.getElementById("global-search").value.toLowerCase();
    const tbody = document.getElementById("students-table-body");
    tbody.innerHTML = "";

    const filtered = list.filter(s => s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query));

    filtered.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${s.id}</strong></td>
            <td><strong>${s.name}</strong></td>
            <td>${s.department}</td>
            <td>${s.email}</td>
            <td><span class="badge badge-present">${s.rate}</span></td>
            <td><button class="btn btn-light btn-sm" onclick="viewStudentHistory('${s.id}', '${s.name}', '${s.department}')"><i class="fa-solid fa-eye"></i> Log</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderClasses() {
    const container = document.getElementById("classes-cards-container");
    container.innerHTML = "";

    initialClasses.forEach(c => {
        const div = document.createElement("div");
        div.className = "class-card";
        div.innerHTML = `
            <div class="class-header">
                <span class="class-title">${c.name}</span>
                <span class="badge badge-info">${c.room}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted);"><i class="fa-solid fa-chalkboard-user"></i> ${c.teacher}</p>
            <div class="class-stats-row">
                <span>Students: <strong>${c.count}</strong></span>
                <span>Avg Attendance: <strong style="color:var(--success);">${c.rate}</strong></span>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderNotifications() {
    const list = JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
    const container = document.getElementById("notifications-list");
    container.innerHTML = "";

    list.forEach(n => {
        const item = document.createElement("div");
        item.className = "activity-item";
        item.innerHTML = `
            <div class="activity-icon" style="background: ${n.bg}; color: ${n.color};">
                <i class="fa-solid ${n.icon}"></i>
            </div>
            <div class="activity-text">
                <h4>${n.title}</h4>
                <p>${n.time} • <span class="badge badge-info" style="font-size:0.65rem; padding:2px 6px;">${n.type}</span></p>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderActivities() {
    const activities = getActivityData();
    const feedContainer = document.getElementById("activity-feed");
    const modalListContainer = document.getElementById("all-activities-list");

    if (!feedContainer) return;
    feedContainer.innerHTML = "";
    modalListContainer.innerHTML = "";

    const recentTop = activities.slice(0, 4);
    recentTop.forEach(act => feedContainer.appendChild(createActivityItemHTML(act)));
    activities.forEach(act => modalListContainer.appendChild(createActivityItemHTML(act)));
}

function createActivityItemHTML(act) {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
        <div class="activity-icon" style="background: ${act.bg}; color: ${act.color};">
            <i class="fa-solid ${act.icon}"></i>
        </div>
        <div class="activity-text">
            <h4>${act.title}</h4>
            <p>${act.time}</p>
        </div>
    `;
    return item;
}

function populateAlertDropdown() {
    const select = document.getElementById("alert-student-select");
    select.innerHTML = "";
    bsitStudentsList.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.innerText = `${name} (BSIT)`;
        select.appendChild(opt);
    });
}

function handleGlobalSearch() {
    if (currentTab === 'students') renderStudents();
    else renderTable();
}

function openActivityModal() { renderActivities(); document.getElementById("activity-modal").style.display = "flex"; }
function closeActivityModal() { document.getElementById("activity-modal").style.display = "none"; }

function openAddStudentModal() { document.getElementById("student-modal").style.display = "flex"; }
function closeAddStudentModal() { document.getElementById("student-modal").style.display = "none"; }

function openSendAlertModal() { document.getElementById("alert-modal").style.display = "flex"; }
function closeSendAlertModal() { document.getElementById("alert-modal").style.display = "none"; }

function handleCreateStudent(e) {
    e.preventDefault();
    const id = document.getElementById("new-stu-id").value;
    const name = document.getElementById("new-stu-name").value;
    const department = document.getElementById("new-stu-class").value;
    const email = document.getElementById("new-stu-email").value;

    const list = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    list.push({ id, name, department, email, rate: "100%" });
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));

    addActivity(`Added new student: ${name}`, "fa-user-plus", "var(--primary-light)", "var(--primary)");
    closeAddStudentModal();
    renderStudents();
}

function handleSendAlert(e) {
    e.preventDefault();
    const student = document.getElementById("alert-student-select").value;
    const notifs = JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];

    notifs.unshift({
        id: Date.now(),
        title: `Manual SMS alert sent to ${student}'s guardian`,
        time: "Just now",
        type: "SMS",
        icon: "fa-paper-plane",
        bg: "var(--primary-light)",
        color: "var(--primary)"
    });

    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    addActivity(`Sent manual parent SMS for ${student}`, "fa-paper-plane", "var(--primary-light)", "var(--primary)");
    closeSendAlertModal();
    if (currentTab === 'notifications') renderNotifications();
}

function saveSettings(e) {
    e.preventDefault();
    alert("Settings updated successfully!");
    addActivity("System configurations updated", "fa-gear", "var(--primary-light)", "var(--primary)");
}

function exportReportCSV() {
    alert("Downloading bsit_attendance_report.csv...");
}

function viewStudentHistory(studentId, name, department) {
    activeStudentId = studentId;
    activeDepartmentName = department;

    document.getElementById("history-student-name").innerText = `${name}'s Attendance Log`;
    document.getElementById("history-student-info").innerText = `Student ID: ${studentId} | Department: ${department}`;

    const startInput = document.getElementById("filter-start-date");
    const endInput = document.getElementById("filter-end-date");

    startInput.value = "2026-06-15";
    endInput.value = "2026-10-12";

    const storageKey = `term_logs_${studentId}`;
    let termLogs = JSON.parse(localStorage.getItem(storageKey));

    if (!termLogs) {
        termLogs = [];
        const genStartDate = new Date("2026-06-15");
        const genEndDate = new Date("2026-10-12");
        const statuses = ["Present", "Present", "Present", "Present", "Absent", "Late"];

        let currDate = new Date(genStartDate);
        while (currDate <= genEndDate) {
            const dayOfWeek = currDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                termLogs.push({
                    date: currDate.toISOString().split('T')[0],
                    day: currDate.toLocaleDateString('en-US', { weekday: 'short' }),
                    status: randomStatus
                });
            }
            currDate.setDate(currDate.getDate() + 1);
        }
        localStorage.setItem(storageKey, JSON.stringify(termLogs));
    }

    filterStudentHistory();
    document.getElementById("history-modal").style.display = "flex";
}

function filterStudentHistory() {
    if (!activeStudentId) return;

    const startDate = document.getElementById("filter-start-date").value;
    const endDate = document.getElementById("filter-end-date").value;

    const storageKey = `term_logs_${activeStudentId}`;
    const allLogs = JSON.parse(localStorage.getItem(storageKey)) || [];

    const filteredLogs = allLogs.filter(log => {
        if (startDate && log.date < startDate) return false;
        if (endDate && log.date > endDate) return false;
        return true;
    });

    const totalDays = filteredLogs.length;
    const presentCount = filteredLogs.filter(r => r.status === 'Present').length;
    const absentCount = filteredLogs.filter(r => r.status === 'Absent').length;
    const lateCount = filteredLogs.filter(r => r.status === 'Late').length;
    const attendanceRating = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : "0.0";

    document.getElementById("hist-total-days").innerText = totalDays;
    document.getElementById("hist-present-count").innerText = presentCount;
    document.getElementById("hist-absent-count").innerText = absentCount;
    document.getElementById("hist-late-count").innerText = lateCount;
    document.getElementById("hist-attendance-rate").innerText = `${attendanceRating}%`;

    const tbody = document.getElementById("history-table-body");
    tbody.innerHTML = "";

    if (filteredLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No records found for selected date range.</td></tr>`;
        return;
    }

    filteredLogs.forEach(rec => {
        const badgeClass = rec.status === 'Present' ? 'badge-present' : (rec.status === 'Absent' ? 'badge-absent' : 'badge-late');
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rec.date}</td>
            <td>${rec.day}</td>
            <td>${activeDepartmentName}</td>
            <td><span class="badge ${badgeClass}">${rec.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function closeHistoryModal() { document.getElementById("history-modal").style.display = "none"; }

function handleSaveRecord(e) {
    e.preventDefault();
    const id = document.getElementById("record-id").value;
    const studentId = document.getElementById("student-id").value;
    const name = document.getElementById("student-name").value;
    const department = document.getElementById("student-class").value;
    const time = document.getElementById("record-date").value;
    const status = document.getElementById("record-status").value;

    let data = getAttendanceData();

    if (id) {
        data = data.map(item => item.id === id ? { id, studentId, name, department, status, time } : item);
        addActivity(`Updated attendance for ${name}`, "fa-pen", "var(--warning-light)", "var(--warning)");
    } else {
        data.push({ id: Date.now().toString(), studentId, name, department, status, time });
        addActivity(`Marked ${name} as ${status}`, status === 'Present' ? "fa-check" : "fa-user-xmark", status === 'Present' ? "var(--success-light)" : "var(--danger-light)", status === 'Present' ? "var(--success)" : "var(--danger)");
    }

    saveAttendanceData(data);
    updateDashboardCounters();
    closeModal();
    renderTable();
}

function editRecord(id) {
    const data = getAttendanceData();
    const record = data.find(i => i.id === id);
    if (!record) return;

    document.getElementById("record-id").value = record.id;
    document.getElementById("student-id").value = record.studentId;
    document.getElementById("student-name").value = record.name;
    document.getElementById("student-class").value = record.department;
    document.getElementById("record-date").value = record.time;
    document.getElementById("record-status").value = record.status;

    document.getElementById("modal-title").innerText = "Edit Attendance Record";
    openModal(true);
}

function deleteRecord(id) {
    const data = getAttendanceData();
    const record = data.find(item => item.id === id);
    if (confirm("Are you sure you want to delete this record?")) {
        let updatedData = data.filter(item => item.id !== id);
        saveAttendanceData(updatedData);
        if (record) {
            addActivity(`Deleted record for ${record.name}`, "fa-trash", "var(--danger-light)", "var(--danger)");
        }
        updateDashboardCounters();
        renderTable();
    }
}

function openModal(isEdit = false) {
    if (!isEdit) {
        document.getElementById("record-form").reset();
        document.getElementById("record-id").value = "";
        document.getElementById("modal-title").innerText = "Mark Attendance";
        document.getElementById("record-date").value = "8:15 AM";
    }
    document.getElementById("record-modal").style.display = "flex";
}

function closeModal() { document.getElementById("record-modal").style.display = "none"; }

// Initial Setup
initTheme();
renderActivities();