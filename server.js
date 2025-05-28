const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Session setup
app.use(
  session({
    secret: "quantum-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // Optional: 1 hour
  })
);

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/lightsounds_inventory", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to lightsounds_inventory");
});

// Mongoose Schema & Model
const itemSchema = new mongoose.Schema({
  category: String,
  brand: String,
  name: String,
  serial: String,
  stock: Number,
  status: String,
});

const Item = mongoose.model("items", itemSchema);

// Login Check Middleware
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

// Routes

// Serve the login page
app.get("/login.html", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/index.html"); // If already logged in, redirect to inventory
  } else {
    res.sendFile(path.join(__dirname, "login.html"));
  }
});

// Redirect root to login page if not logged in
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Login page POST handler
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded login (replace with DB check if needed)
  if (username === "QUANTUM" && password === "admin123") {
    req.session.loggedIn = true;
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out.");
    res.redirect("/login.html");
  });
});

// Serve protected inventory page (only if logged in)
app.get("/index.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API Routes

// CREATE
app.post("/items", requireLogin, async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: "Error creating item", error: err });
  }
});

// READ ALL
app.get("/items", requireLogin, async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err });
  }
});

// READ ONE
app.get("/items/:id", requireLogin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching item", error: err });
  }
});

// UPDATE
app.put("/items/:id", requireLogin, async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: "Error updating item", error: err });
  }
});

// DELETE
app.delete("/items/:id", requireLogin, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err });
  }
});

// Start Server
app.listen(3050, () => {
  console.log("Server running at http://localhost:3050");
});
