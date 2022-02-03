const express = require("express");
require("dotenv").config();
const ejs = require("ejs");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const res = require("express/lib/response");
const { json, redirect } = require("express/lib/response");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
mongoose.connect("mongodb://localhost:27017/dailyJournalDb")

const journalSchema = mongoose.Schema({
    title : String,
    content: String
})

const JournalEntry = mongoose.model("JournalEntry", journalSchema)


app.route("/journals")
    .get((req, res)=>{
        JournalEntry.find((err, result)=>{
            if(!err){
                res.render("index",{journals : result})
            }
        })
    })
    .post((req, res)=>{
        const newEntry = new JournalEntry({
            title: req.body.title,
            content: req.body.content
        })
        newEntry.save(()=>res.redirect("/journals"))
    })
    .delete((req, res)=>{
        JournalEntry.deleteMany((err)=>{
            if(!err){
                res.json({status: "Success"})
            }
        })
    })

app.get("/journals/:id",(req, res)=>{
    JournalEntry.findByIdAndDelete({_id: req.params.id},(err)=>{
        if(!err){
            console.log("success")
            res.redirect("/journals")
        }
    })
})

app.get("/journals/edit/:id", (req, res)=>{
    JournalEntry.findById({_id:req.params.id},(err, result)=>{
        if(!err){
            res.render("edit",{result: result})
        }
    })
})

app.post("/journals/edit/:id",(req, res)=>{
    JournalEntry.updateOne({_id: req.params.id},
        {$set:{title: req.body.title, content: req.body.content}},(err)=>{
            if(!err){
                res.redirect("/journals")
            }
            else{
                console.log(err);
            }
        })
})

app.route("/journals/:id")
    .get((req, res)=>{
        JournalEntry.findById({_id : req.params.id},(err, result)=>{
            if(!err){
                res.json({result : result})
            }
        })
    })
    .patch((req, res)=>{
        JournalEntry.updateOne({_id: req.params.id},
            {$set:{content: req.body.content}},
            (err)=>{
            if (!err) {
                res.json({status: "success"})
            }
        })
    })
    .delete((req, res)=>{
        JournalEntry.deleteOne({_id : req.params.id},
            (err)=>{
                if(!err){
                    res.json({status: "Success"})
                }
            })
    })

app.get("/compose",(req, res)=>{
    res.render("compose")
})

app.get("*", (req, res)=>{
    res.status(404).json({status:"Not found"});
})

app.listen(3000, ()=>{
    console.log("listening on port 3000")
})