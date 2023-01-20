const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


//Initializing EJS with express
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

main().catch(err => console.log(err));

async function main () {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
   }

   try {
     mongoose.set('strictQuery',false);

    await mongoose.connect("mongodb+srv://admin-yeboah:Elohim1sgrt@cluster0.xfjyzqe.mongodb.net/todolistDB", connectionOptions);

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

  app.get("/", function(req, res){

Item.find({}, function(err, foundItems){
  if (foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Succesfully saved default items");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle:"Today", newListItems: foundItems});
  }

});


  //console.log(day);
});

app.post("/", function(req, res){

const  itemName = req.body.newitem;
const listName = req.body.list;

const item = new Item({
  name: itemName
});

if (listName === "Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}



});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted the item");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    })
  }

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        // Create a new list
        const list = new List({
            name: customListName,
            items: defaultItems
        });

      list.save();
      res.redirect("/" + customListName);

      } else {

        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });


  console.log(customListName);
});



app.get("/about", function(req, res){
  res.render("about");
});

console.log(`Connected to MongoDB`)
 } catch (err) {
  console.log(`Couldn't connect: ${err}`)
 }
}


app.listen(3000, function(){
  console.log("The server is running on port 3000");
});
