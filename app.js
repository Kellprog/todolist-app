//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_TG:test123@cluster0.xujtxto.mongodb.net/todolistDB", {useNewUrlParser:true});


const itemsSchema = new mongoose.Schema ({
  name:{
    type:String,
    required:[true, "Error"]
  }
})

const Item = mongoose.model('Todolist', itemsSchema);

const item1 = new Item({
  name:"Welcome to your Todolist"
})
const item2 = new Item({
  name:"Hit the + button to add new items"
})
const item3 = new Item({
  name:"<-- Hit this to delete an item."
})
const defaultArray =[item1,item2,item3];
const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {



  Item.find({}, (err,items) => {
    if(items.length === 0){
      Item.insertMany(defaultArray,(err) => {
        if(err){
          console.log(err);
        }else{
          console.log("Successfully inserted Items ");
        }
      }
    );
      res.redirect("/");
    }else{
      if(err){
        console.log(err);
      }else{
        res.render("list", {listTitle: "Today", newListItems: items});
        }
    }
    })

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list

  const item = new Item ({
    name:itemName
  })


  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},(err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    })
  }


});

app.get("/:customListName",(req,res) => {
  const  customListName = _.capitalize(req.params.customListName);


  List.findOne({name:customListName},(err,foundList) => {
    if(!err){
      if(!foundList){
        //creating new list
        const list =new List ({
          name:customListName,
          items:defaultArray
        });

        list.save();
        res.redirect("/" + customListName)

      }else{
        //show existing list
        res.render('list',{listTitle:foundList.name,newListItems:foundList.items})
      }

    }
  })

})




app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,(err) => {
      if(!err){
        console.log("Successfully deleted item with Id");
         res.redirect("/")
       }
     })
   }else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, (err,foundList) => {
       if(!err){
         res.redirect("/" + listName)
       }
     })
   }
})
let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started Successfully");
});
