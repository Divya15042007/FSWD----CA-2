const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Define Workout Schema
const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    reps: { type: Number },
    sets: { type: Number },
    weight: { type: Number }
});

const WorkoutSchema = new mongoose.Schema({
    user: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    caloriesBurned: { type: Number },
    exercises: [ExerciseSchema]
});

const Workout = mongoose.model("Workout", WorkoutSchema);

// Routes

// Create a new workout (POST)
app.post("/workouts", async (req, res) => {
    try {
        const workout = new Workout(req.body);
        await workout.save();
        res.status(201).json(workout);
    } catch (err) {
        res.status(400).json({ error: "Validation failed: " + err.message });
    }
});

// Get all workouts or a specific workout by ID (GET)
app.get("/workouts/:id?", async (req, res) => {
    try {
        if (req.params.id) {
            const workout = await Workout.findById(req.params.id);
            if (!workout) return res.status(404).json({ error: "Workout not found" });
            return res.json(workout);
        }
        const workouts = await Workout.find();
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Update a workout (PUT)
app.put("/workouts/:id", async (req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!workout) return res.status(404).json({ error: "Workout not found" });
        res.json(workout);
    } catch (err) {
        res.status(400).json({ error: "Validation failed: " + err.message });
    }
});

// Delete a workout (DELETE)
app.delete("/workouts/:id", async (req, res) => {
    try {
        const workout = await Workout.findByIdAndDelete(req.params.id);
        if (!workout) return res.status(404).json({ error: "Workout not found" });
        res.json({ message: "Workout deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
