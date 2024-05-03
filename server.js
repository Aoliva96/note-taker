// Import
const express = require("express");
const fs = require("fs");
const path = require("path");
const notes = require("./db/db.json");

// Create Express instance
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes:
// =============================================================

// Define default route
app.get("*", (req, res) => {
  // Code to serve the HTML file for the note-taking app
});

// Define route for notes page
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

// GET all notes from db.json
app.get("/api/notes", (req, res) => {
  res.json(notes);
});

// POST new note to db.json
app.post("/api/notes", (req, res) => {
  const newNote = req.body;
  notes.push(newNote);
  fs.writeFile("./db/db.json", JSON.stringify(notes), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error saving note");
    } else {
      res.json(newNote);
    }
  });
});

// DELETE note from db.json based on ID
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const updatedNotes = notes.filter((note) => note.id !== noteId);
  fs.writeFile("./db/db.json", JSON.stringify(updatedNotes), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error deleting note");
    } else {
      res.send("Note deleted successfully");
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
