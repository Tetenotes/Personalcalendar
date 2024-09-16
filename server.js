const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

let events = [];
let users = [];  

// Secret for JWT token generation
const SECRET_KEY = 'dhbdbchhdyrieueipoitshzj'; 

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password and store the user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    
    // Redirect to index.html on successful signup
    res.status(201).json({ redirectTo: '/index.html' });
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    // Redirect to index.html on successful login
    res.json({ message: 'Login successful', token, redirectTo: '/index.html' });
});

// Events routes 
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

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
