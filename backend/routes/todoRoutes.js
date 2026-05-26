const express = require('express');
const Todo = require('../models/Todo');

// --- BEGINNER EXPLANATION ---
// express.Router() lets us group all todo-related routes in one file
// instead of putting everything in server.js. Keeps code clean and organized.
const router = express.Router();

// ─────────────────────────────────────────────────
// GET /todos — Fetch tasks (supports ?search=xxx)
// ─────────────────────────────────────────────────
// Example: GET /todos?search=milk
// req.query gives us any ?key=value pairs from the URL
router.get('/', async (req, res) => {
  try {
    const { search } = req.query; // Read optional search text from URL

    // Build a filter object. If search is provided, use a RegExp so the match
    // is case-insensitive (e.g. "milk" also matches "MILK" or "Milk").
    const filter = {};
    if (search && search.trim() !== '') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Todo.find(filter) returns all documents that match the filter.
    // An empty filter {} returns ALL documents — same as before.
    const todos = await Todo.find(filter).sort({ createdAt: -1 }); // newest first
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────
// GET /todos/stats — Task statistics
// ─────────────────────────────────────────────────
// Returns: { total, completed, pending }
// IMPORTANT: This route MUST be defined BEFORE /:id routes,
// otherwise Express would think "stats" is a task ID.
router.get('/stats', async (req, res) => {
  try {
    const total     = await Todo.countDocuments();            // count all
    const completed = await Todo.countDocuments({ completed: true });
    const pending   = total - completed;
    res.json({ total, completed, pending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /todos — Create a new task
// ─────────────────────────────────────────────────
// req.body now also accepts 'priority' sent by the frontend.
router.post('/', async (req, res) => {
  // req.body = { title: "Buy milk", priority: "High" }
  const todo = new Todo({
    title:    req.body.title,
    priority: req.body.priority || 'Medium', // use 'Medium' if not provided
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo); // 201 = "Created"
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /todos/:id — Update a task
// ─────────────────────────────────────────────────
// Used for:
//   1. Toggle completed (existing feature)
//   2. Edit title (new feature)
//   3. Edit priority (new feature)
// We only update a field if the frontend actually sends it.
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    // Only change what was sent — avoids accidentally clearing fields
    if (req.body.completed !== undefined) todo.completed = req.body.completed;
    if (req.body.title     !== undefined) todo.title     = req.body.title;
    if (req.body.priority  !== undefined) todo.priority  = req.body.priority;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────────
// DELETE /todos/:id — Delete a single task
// ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    await todo.deleteOne();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
