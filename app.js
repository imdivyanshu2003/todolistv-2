const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
 
// make a connection with the database
mongoose.connect("mongodb+srv://admin-divyanshu:Test123@cluster0.ugkea8x.mongodb.net/todolistDB");
 
// create a schema
const itemsSchema = new mongoose.Schema({
  name: String,
});
 
// create a model
const Item = mongoose.model("Item", itemsSchema);
 
//create a document
const item1 = new Item({
  name: "Hello !",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});
 
//create an array of documents
const defaultItems = [item1, item2, item3];
 
const listSchema = {
  name: String,
  items: [itemsSchema],
};
 
const List = mongoose.model("List", listSchema);
 
app.get("/", async (req, res) => {
  await Item.find({})
    .then(function (founditems) {
      if (founditems.length === 0) {
        //   Insert the array of documents in the database and save them
        Item.insertMany(defaultItems)
          .then(function () {
            res.redirect("/");
          })
          .catch(function () {
            console.log("Error inserting to database..");
          });
      } else {
        res.render("list", { listTitle: "Today", newListItems: founditems });
      }
    })
    .catch(function () {
      console.log("errrrror");
    });
});
 
app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name: itemName,
  });
 
  if (listName === "Today") {
    await item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(async function (foundList) {
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(" error save new item in custom list");
      });
  }
});
 
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        res.redirect("/");
      })
      .catch(function () {
        console.log("delete error");
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(function (foundList) {
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log("err in delete item from custom list");
      });
  }
});
 
app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
 
  await List.findOne({ name: customListName })
    .then(async function (foundList) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
 
        await list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}),
  app.listen(3000, (req, res) => {
    console.log(`Example app listening on port 3000`);
  });
