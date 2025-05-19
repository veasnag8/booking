const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public'

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/meetingDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema
const meetingSchema = new mongoose.Schema({
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    room: String,
    description: String,
    bookingBy: String
});

const Meeting = mongoose.model('Meeting', meetingSchema);

// Routes

// Create
app.post('/meetings', async (req, res) => {
    try {
        const meeting = new Meeting(req.body);
        await meeting.save();
        res.status(201).send(meeting);
    } catch (err) {
        res.status(500).send({ message: 'Failed to create meeting', error: err });
    }
});

// Read
app.get('/meetings', async (req, res) => {
    try {
        const meetings = await Meeting.find();
        res.send(meetings);
    } catch (err) {
        res.status(500).send({ message: 'Failed to fetch meetings', error: err });
    }
});

// Update
app.put('/meetings/:id', async (req, res) => {
    console.log('PUT /meetings/:id called');
    console.log('Meeting ID:', req.params.id);
    console.log('Update Data:', req.body);

    try {
        const updatedMeeting = await Meeting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedMeeting) {
            return res.status(404).send({ message: 'Meeting not found' });
        }

        res.send(updatedMeeting);
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).send({ message: 'Server error while updating meeting', error });
    }
});

// Delete
app.delete('/meetings/:id', async (req, res) => {
    try {
        const deleted = await Meeting.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).send({ message: 'Meeting not found' });
        }
        res.send({ message: 'Meeting deleted' });
    } catch (err) {
        res.status(500).send({ message: 'Failed to delete meeting', error: err });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
