const mongoose = require('mongoose');

// --- BEGINNER EXPLANATION ---
// A Schema is a blueprint that tells MongoDB what each document (record) must look like.
// We added a new field: 'priority' so users can mark tasks as High, Medium, or Low.

const todoSchema = new mongoose.Schema(
  {
    // title: every task must have a title (required: true means it cannot be empty)
    title: {
      type: String,
      required: true,
    },

    // completed: a true/false flag. Default is false (task starts as not done).
    completed: {
      type: Boolean,
      default: false,
    },

    // priority: NEW FIELD — lets the user assign urgency to a task.
    // 'enum' means the value MUST be one of these three strings only.
    // Default is 'Medium' so existing/new tasks always have a priority.
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
  },
  {
    // timestamps: true tells Mongoose to auto-add createdAt and updatedAt fields
    timestamps: true,
  }
);

// module.exports makes this Model available to other files (like our routes).
module.exports = mongoose.model('Todo', todoSchema);
