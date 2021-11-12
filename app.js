global.__basedir = __dirname;
const express = require("express");
const ejs = require("ejs");
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs').promises;
var glob = require("glob");
const http = require('http');
const server = http.createServer(app);
const directoryScan = require("./functions/directoryScan.js");
const introScan = require("./functions/introScan.js");
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.get("/",  async function(req,res,next){
  try{
    var intro = await introScan.introScan();
  }
  catch(e){
    const error = new Error('There was a mistake on our part. We will try our hardest to resolve this issue in a timely manner. Please be patient');
    error.status = 500;
    return next(error);
  }
  try{
    var files = await directoryScan.directoryScan();
  }
  catch(e){
    const error = new Error('There was a mistake on our part. We will try our hardest to resolve this issue in a timely manner. Please be patient');
    error.status = 500;
    return next(error);
  }
  var mappedContestants = [];
  function finddata(a){
    return mappedContestants.map(function(e){
      return e.name.toLowerCase();
    }).indexOf(a);
  }

// first create maps for every available participant using only files that host one name/sketch files
  for(var i = 0; i < files.length; i++){
    let startIndex = finddata(files[i].slice(0,files[i].indexOf("_")).toLowerCase());
    if(startIndex == -1){
      mappedContestants.push({
        name: files[i].slice(0,files[i].indexOf("_")),
        amount:0
      });
    }
  }
  //Count how many times user appeared on the right side of files that have two names/ determine how many times user has colored other users sketches
  for(var i = 0; i < files.length; i++){
    let endIndex = finddata(files[i].slice(files[i].indexOf("_")+4, files[i].indexOf(".")).toLowerCase());
    if(endIndex != -1){
      mappedContestants[endIndex].amount++;
    }
  }
  //Sort from user who colored the most sketches to those who have colored the least
  mappedContestants.sort(function(a,b){
    return b.amount - a.amount  ;
  });
  // console.log(mappedContestants);
  res.render("participant",{intro:intro,participants:mappedContestants});
});
app.get("/error", async function(req,res){
  res.render("error");
});
app.get("/submissions", async function(req,res,next){
  const wordInString = (s, word) => new RegExp('\\b' + word + '\\b').test(s);
  try{
    var files = await directoryScan.directoryScan();
  }
  catch(e){
    const error = new Error('There was a mistake on our part. We will try our hardest to resolve this issue in a timely manner. Please be patient');
    error.status = 500;
    return next(error);
  }
  //We use this to search for file(s) in files. If a user like this does not exist, an error is thrown
  //If a user like this does exist then render all files with that users name on screen
  const name = req.query.name;
  //If entering a participants page from the home page
  const selectedFile = req.query.title ?? "";
  //Copy only parts of file that has enteries that have name in it
  const participant_files = files.filter(function(element){
    if(element.slice(0,element.indexOf("_")).toLowerCase() == name.toLowerCase() ||element.slice(element.indexOf("_")+4,element.indexOf(".")).toLowerCase() == name.toLowerCase()){
      return element;
    }
  });
  // files that have name in it but nothing after the second _
  let rough = [];
  //files that have name after the second _
  let other = [];
  //files that have name before first _
  let participantColored = [];
  for(var i =0; i < participant_files.length; i++){
    //if this is the rough sketch/files that have name in it but nothing after the second _
    if(participant_files[i].slice(participant_files[i].indexOf("_")+4,  participant_files[i].indexOf(".")).toLowerCase() == ""){
      rough.push(participant_files[i]);
    }
    //If the users sketch was drawn by anyone/files that have name after the second _
    else if(participant_files[i].slice(0,participant_files[i].indexOf("_")).toLowerCase() == name.toLowerCase()){
      other.push(participant_files[i]);
    }
    //if the user colored anyone elses sketch/files that have name before first _
    else{
      participantColored.push(participant_files[i]);
    }
  }
  if(participant_files.length == 0){
    res.redirect("/");
  }
  //if user starts from home page or inputs a name for a file that does not exist
  if(selectedFile == "" ||participant_files.map(fileName => fileName.toLowerCase()).indexOf(selectedFile.toLowerCase())  == -1){
    res.render("showcase",{
      name: name,
      rough:rough,
      others:other,
      participantColored:participantColored,
      focusedImage:"",
      overlay:false,
      ogname: "",
      coloredName:"",
    });
  }
  //If inputted filename exists in user dedicated list
  else{
    res.render("showcase",{
      name: name,
      rough:rough,
      others:other,
      participantColored:participantColored,
      focusedImage:selectedFile,
      overlay:true,
      ogname: selectedFile.slice(0,selectedFile.indexOf("_")),
      coloredName:selectedFile.slice(selectedFile.indexOf("_")+4,selectedFile.indexOf(".")),
    });
  }
});
app.use(function(req,res,next){
  const error = new Error('Not Found');
  error.status = "404";
  next(error);
});
app.use(function (error,req,res,next){
  console.log(error.status);
  res.render("error",{
    errorCode:error.status,
    errorMessage: error.message
  });
});
server.listen(PORT,(err) =>{
  if(err) console.log(`Error in server setup:${err}`);
  console.log(`Server listening on port ${PORT}`)
});
process.on('uncaughtException',err =>{
  console.log(err);
  process.exit(1);
});
