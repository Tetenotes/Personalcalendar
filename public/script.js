document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const modal = document.getElementById('eventModal');
    const closeModal = document.querySelector('.close');
    const eventForm = document.getElementById('eventForm');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const eventIdInput = document.getElementById('eventId');
    const saveButton = document.getElementById('saveEvent');
    const deleteButton = document.getElementById('deleteEvent');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                // Fetch events from the server
                const response = await fetch('http://localhost:3000/events');
                const events = await response.json();
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },
        dateClick: function(info) {
            showModal(info.dateStr);
        },
        eventClick: function(info) {
            showModal(info.event.startStr, info.event.title, info.event.extendedProps.description, info.event.id);
        }
    });

    // Add initial events
    const initialEvents = [
        {
            id: '1',
            title: 'Completion of LAUNCH',
            start: '2024-10-24',
            description: 'Due by 11:59pm'
        },
        {
            id: '2',
            title: 'Paddle Reveal',
            start: '2024-11-07',
            description: 'Complete a Paddle for your Big'
        },
        {
            id: '3',
            title: 'Service Hours Deadline',
            start: '2024-11-07',
            description: 'Complete 16 hours of service'
        },
        {
            id: '4',
            title: 'Interview Completion',
            start: '2024-11-07',
            description: 'Interview all other members of your Pledge Class'
        },
        {
            id: '5',
            title: 'Fundraiser Point',
            start: '2024-11-07',
            description: 'Attain 1 chapter fundraiser point'
        },
        {
            id: '6',
            title: 'Big/Little Bondings',
            start: '2024-11-07',
            description: 'Complete 3 Big/Little bondings'
        },
        {
            id: '7',
            title: 'Big/Little Service Hours',
            start: '2024-11-07',
            description: 'Complete 2 hours of service with your Big'
        },
        {
            id: '8',
            title: 'Paddle for Big',
            start: '2024-11-07',
            description: 'Complete a Paddle for your Big for Paddle Reveal'
        },
        {
            id: '9',
            title: 'Letter to Big',
            start: '2024-11-07',
            description: 'Letter to your Big reflecting on the semester'
        },
        {
            id: '10',
            title: 'Pledge Class Committees',
            start: '2024-11-07',
            description: 'Participate in Pledge Class Executive Committees'
        }
        // Add more events if needed
    ];

    async function fetchAndRenderEvents() {
        try {
            // Fetch existing events from the server
            const response = await fetch('http://localhost:3000/events');
            const events = await response.json();
            events.forEach(event => {
                calendar.addEvent(event);
            });
        } catch (error) {
            console.error('Error fetching events:', error);
        }

        // Add initial events
        initialEvents.forEach(event => {
            calendar.addEvent(event);
        });
    }

    function showModal(date, title = '', description = '', id = '') {
        modal.style.display = 'block';
        titleInput.value = title;
        descriptionInput.value = description;
        eventIdInput.value = id;
    }

    function hideModal() {
        modal.style.display = 'none';
        eventIdInput.value = '';
        titleInput.value = '';
        descriptionInput.value = '';
    }

    closeModal.onclick = hideModal;

    window.onclick = function(event) {
        if (event.target == modal) {
            hideModal();
        }
    }

    eventForm.onsubmit = async function(e) {
        e.preventDefault();
        const id = eventIdInput.value;
        const title = titleInput.value;
        const description = descriptionInput.value;
        const event = {
            title: title,
            start: new Date().toISOString().split('T')[0], // Today's date
            description: description
        };

        if (id) {
            // Edit existing event
            event.id = id;
            try {
                await fetch(`http://localhost:3000/events/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });
                const updatedEvent = calendar.getEventById(id);
                updatedEvent.setProp('title', title);
                updatedEvent.setExtendedProp('description', description);
            } catch (error) {
                console.error('Error updating event:', error);
            }
        } else {
            // Add new event
            try {
                const response = await fetch('http://localhost:3000/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });
                const newEvent = await response.json();
                calendar.addEvent(newEvent);
            } catch (error) {
                console.error('Error adding event:', error);
            }
        }

        hideModal();
    };

    deleteButton.onclick = async function() {
        const id = eventIdInput.value;
        if (id) {
            // Delete existing event
            try {
                await fetch(`http://localhost:3000/events/${id}`, {
                    method: 'DELETE'
                });
                const event = calendar.getEventById(id);
                event.remove();
            } catch (error) {
                console.error('Error deleting event:', error);
            }
            hideModal();
        }
    };

    fetchAndRenderEvents();
    calendar.render();
});
