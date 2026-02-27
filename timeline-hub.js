// timeline-hub.js
// Main JS for Client Communication Timeline Hub

// Sample client and activity data
const clients = [
    {
        id: 1,
        name: "Acme Corp",
        lastContact: "2026-02-25",
        status: "Active",
        activities: [
            { type: "Email", title: "Project Kickoff", date: "2026-02-20", notes: "Sent kickoff email." },
            { type: "Meeting", title: "Initial Meeting", date: "2026-02-21", notes: "Discussed project scope." },
            { type: "Task", title: "Design Draft", date: "2026-02-22", notes: "Submitted draft." },
            { type: "Deadline", title: "Phase 1 Delivery", date: "2026-02-28", notes: "Upcoming deadline." }
        ]
    },
    {
        id: 2,
        name: "Beta Solutions",
        lastContact: "2026-02-18",
        status: "Pending",
        activities: [
            { type: "Email", title: "Proposal Sent", date: "2026-02-15", notes: "Sent proposal." },
            { type: "Meeting", title: "Follow-up Call", date: "2026-02-18", notes: "Discussed feedback." },
            { type: "Task", title: "Revision", date: "2026-02-19", notes: "Working on revision." },
            { type: "Deadline", title: "Proposal Review", date: "2026-02-25", notes: "Awaiting review." }
        ]
    },
    {
        id: 3,
        name: "Gamma LLC",
        lastContact: "2026-02-10",
        status: "Inactive",
        activities: [
            { type: "Email", title: "Check-in", date: "2026-02-10", notes: "No response yet." },
            { type: "Task", title: "Report Submission", date: "2026-02-09", notes: "Submitted report." }
        ]
    }
];

// Utility: Format date
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

// Render client cards
function renderClients() {
    const list = document.getElementById('client-list');
    list.innerHTML = '';
    clients.forEach(client => {
        const card = document.createElement('div');
        card.className = 'client-card';
        card.innerHTML = `
            <h3>${client.name}</h3>
            <div class="last-contact">Last Contact: ${formatDate(client.lastContact)}</div>
            <div class="status">Status: ${client.status}</div>
        `;
        list.appendChild(card);
    });
}

// Render timeline for all clients
function renderTimeline() {
    const timeline = document.getElementById('timeline-view');
    timeline.innerHTML = '';
    clients.forEach(client => {
        client.activities.forEach(activity => {
            const event = document.createElement('div');
            event.className = 'timeline-event';
            event.innerHTML = `
                <h4>${activity.title} <span class="event-type">(${activity.type})</span></h4>
                <div class="event-date">${formatDate(activity.date)}</div>
                <div class="event-notes">${activity.notes}</div>
                <div class="event-client">Client: ${client.name}</div>
            `;
            timeline.appendChild(event);
        });
    });
}

// Render last contact alerts
function renderAlerts() {
    const alerts = document.getElementById('alerts-view');
    alerts.innerHTML = '';
    const today = new Date();
    clients.forEach(client => {
        const lastContact = new Date(client.lastContact);
        const daysSince = Math.floor((today - lastContact) / (1000 * 60 * 60 * 24));
        if (daysSince > 5) {
            const alert = document.createElement('div');
            alert.className = 'alert';
            alert.innerHTML = `
                <strong>${client.name}:</strong> No contact for ${daysSince} days!
            `;
            alerts.appendChild(alert);
        }
    });
}

// Generate weekly status summaries
function renderSummaries() {
    const summaries = document.getElementById('summaries-view');
    summaries.innerHTML = '';
    clients.forEach(client => {
        // Filter activities in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recent = client.activities.filter(a => new Date(a.date) >= weekAgo);
        let summaryText = '';
        if (recent.length === 0) {
            summaryText = 'No activity in the past week.';
        } else {
            summaryText = recent.map(a => `${a.type}: ${a.title} (${formatDate(a.date)})`).join('<br>');
        }
        const summary = document.createElement('div');
        summary.className = 'summary';
        summary.innerHTML = `
            <strong>${client.name}:</strong><br>${summaryText}
        `;
        summaries.appendChild(summary);
    });
}

// Initial render
window.addEventListener('DOMContentLoaded', () => {
    renderClients();
    renderTimeline();
    renderAlerts();
    renderSummaries();
});

// ...more code will be added to expand to 700+ lines...
