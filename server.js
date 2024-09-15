const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

let events = []; // In-memory store for simplicity

app.get('/events', (req, res) => {
    res.json(events);
});

app.post('/events', (req, res) => {
    const event = req.body;
    event.id = new Date().getTime().toString(); // Generate a unique ID
    events.push(event);
    res.status(201).json(event);
});

app.put('/events/:id', (req, res) => {
    const { id } = req.params;
    const updatedEvent = req.body;
    events = events.map(event => event.id === id ? updatedEvent : event);
    res.json(updatedEvent);
});

app.delete('/events/:id', (req, res) => {
    const { id } = req.params;
    events = events.filter(event => event.id !== id);
    res.status(204).end();
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
