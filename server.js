// Import
const express = require("express");
const fs = require("fs");
const path = require("path");
const notes = require("./db/db.json");
const { v4: uuidv4 } = require("uuid");

// Create Express instance
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes:
// =============================================================

// Define route for home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Define route for notes page
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

// POST new note to db.json
app.post("/api/notes", (req, res) => {
  // Log request
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      _id: uuidv4(),
    };

    // Get current notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json("Error saving note");
      } else {
        let jsonNotes = [];

        if (data) {
          jsonNotes = Array.from(JSON.parse(data));
        }

        // Add new note
        jsonNotes.push(newNote);

        // Write updated notes array back to file
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(jsonNotes, null, 4),
          (err) => {
            if (err) {
              console.error(err);
              res.status(500).json("Error saving note");
            } else {
              const response = {
                status: "success",
                body: newNote,
              };

              console.log(response);
              res.status(201).json(response);
            }
          }
        );
      }
    });
  } else {
    res.status(500).json("Error saving note");
  }
});

// GET all notes from db.json
app.get("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json("Error retrieving notes");
    } else {
      const notes = JSON.parse(data);
      res.status(200).json(notes);
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

// Define default route for all other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
