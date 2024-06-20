import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import configDb from './config/config.js';

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Permalist",
    password: configDb.password,
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  } catch (err) {
    console.log(err)
  }
});

app.post("/add", async (req, res) => {
  try {
    const item = req.body.newItem;
    await addItem(item)
    res.redirect("/");
  } catch (err) {
    console.log(err)
  }
});

app.post("/edit", async (req, res) => {
  try {
    let editedItem = req.body.updatedItemTitle
    let editedId = req.body.updatedItemId
    await editItem(editedItem, editedId)
    res.redirect("/")
  } catch (err) {
    console.log(err)
  }
});

app.post("/delete", async (req, res) => {
  try {
    let deleteItemId = req.body.deleteItemId
    await deleteItem(deleteItemId)
    res.redirect("/")
  } catch (err) {
    console.log(err)
  }
});



async function getItems () {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC")
  items = result.rows
  return items
}

async function addItem (newItem) {
  await db.query("INSERT INTO items (title) VALUES ($1)",[newItem])
  }

async  function editItem (editedTitle, editedId){
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [editedTitle, editedId])
}

async  function deleteItem (deliteId){
  await db.query("DELETE FROM items WHERE id = $1", [deliteId])
}


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
