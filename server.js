const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
var bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static(__dirname));

const MuleSchema = new mongoose.Schema({
    username : String, 
    inventory : [String]
})

MuleSchema
    .virtual("getInventory")
    .get(function () {
        return this.inventory.join();
    });

var Mule = mongoose.model("Mule", MuleSchema)

const uri = "";
app.get('/mules', (req, res) => {
    Mule.find({},(err, mules)=> {
        res.send(mules);
    })
})
app.post('/mules', (req, res) => {
    var mule = new Mule({
        username: req.body.username,
        inventory: []
    });
    mule.save((err) =>{
        if(err)
        sendStatus(500);
        console.log(req.body);
        io.emit('mule', req.body);
        res.sendStatus(200);
    })
})
app.post('/addItem', (req, res) => {
    Mule.findById(req.body.mule, (err, mule)=> {
        mule.inventory.push(req.body.item);
        // console.log(mule.inventory);
        mule.save((err) =>{
            if(err)
                sendStatus(500);
            req.body = mule;
            io.emit('inventory', req.body);
            res.sendStatus(200);
        })
    })   
})
app.post('/deleteItem', (req, res) => {
    Mule.findById(req.body.mule, (err, mule)=> {
        console.log(req.body.item);
        mule.inventory = mule.inventory.filter(item => item !== req.body.item);
        console.log(mule.inventory);
        mule.save((err) =>{
            if(err)
                sendStatus(500);
            req.body = mule;
            io.emit('inventory', req.body);
            res.sendStatus(200);
        })
    })    
})

mongoose.connect(uri ,{useNewUrlParser: true, useUnifiedTopology: true} ,(err) => {
        console.log('mongodb connected', err);
    })

const server = http.listen(8080, function () {
        console.log("Listening on *8080");
})


