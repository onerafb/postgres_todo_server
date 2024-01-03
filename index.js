const express = require("express");
const pool = require("./db");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
// const PORT = process.env.PORT ?? 8000;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello nox 👋 This is Todo Api ...");
});

//get todo
app.get("/todos/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  console.log(req);
  try {
    const todos = await pool.query("SELECT * FROM todos WHERE user_email=$1", [
      userEmail,
    ]);
    res.json(todos.rows);
  } catch (error) {
    console.log(error);
  }
});

//addding todo
app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  // console.log(user_email, title, progress, date);
  const id = uuidv4();
  // console.log(id);
  try {
    const newTodo = await pool.query(
      `INSERT INTO todos (id,user_email,title,progress,date) VALUES ($1,$2,$3,$4,$5)`,
      [id, user_email, title, progress || 50, date]
    );
    res.json(newTodo);
  } catch (error) {
    console.log(error);
  }
});

//edit todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {
    const editTodo = await pool.query(
      "UPDATE todos SET user_email=$1,title=$2,progress=$3,date=$4 WHERE id=$5;",
      [user_email, title, progress, date, id]
    );
    res.json(editTodo);
  } catch (error) {
    console.log(error);
  }
});

//delete todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTodo = await pool.query("DELETE FROM todos WHERE id=$1;", [id]);
    res.json(deleteTodo);
  } catch (error) {
    console.log(error);
  }
});
// var salt = bcrypt.genSaltSync(10);
// var hash = bcrypt.hashSync("B4c0/\/", salt);
//signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPasword = bcrypt.hashSync(password, salt);
  try {
    const signUp = await pool.query(
      `INSERT INTO users (email,hashed_password) VALUES ($1,$2)`,
      [email, hashedPasword]
    );

    const token = jwt.sign({ email, password }, "secret", { expiresIn: "1hr" });
    res.json({ email, token });
  } catch (error) {
    console.log(error);
    if (error) {
      res.json({ detail: error.detail, detailtwo: "User already exist" });
    }
  }
});

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await pool.query("SELECT * FROM users WHERE email =$1", [
      email,
    ]);
    if (!users.rows.length) return res.json({ detail: "User not exist" });

    const success = await bcrypt.compare(
      password,
      users.rows[0].hashed_password
    );
    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });
    if (success) {
      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detailtwo: "Login failed" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT, () => console.log(`Server is running on PORT ${process.env.PORT}`));
