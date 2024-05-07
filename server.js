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
  console.info(`${req.method} request received to add a note:`);

  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    // Get current notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json("Error saving note");
      } else {
        let notes = [];
        if (data) {
          notes = Array.from(JSON.parse(data));
        }

        // Add new note to array
        notes.push(newNote);

        // Write updated notes array back to file
        fs.writeFile("./db/db.json", JSON.stringify(notes, null, 2), (err) => {
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
        });
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
      const notes = JSON.parse(data) || [];
      res.status(200).json(notes);
    }
  });
});

// DELETE note from db.json by ID
app.delete("/api/notes/:id", (req, res) => {
  // Log request
  console.info(`${req.method} request received to remove a note:`);

  // Get current notes
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error deleting note");
    } else {
      const notes = JSON.parse(data) || [];
      const noteId = req.params.id;

      // Remove note with matching ID
      const updatedNotes = notes.filter((note) => note.id !== noteId);

      // Write updated notes array back to file
      fs.writeFile(
        "./db/db.json",
        JSON.stringify(updatedNotes, null, 2),
        (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error deleting note");
          } else {
            const response = {
              status: "success",
              body: `deleted note with id: ${noteId}`,
            };

            console.log(response);
            res.status(200).send(response);
          }
        }
      );
    }
  });
});

// Define default route for all other requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Server start:
// =============================================================

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
