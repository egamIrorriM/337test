/*
Matthew Chambers
CSC 337, Spring 2019
Homework 11

This js acts as a middle man to allow the rockPaper.js
to communicate with the database
requires the following to be installed to run:
	node
	mysql
	
*/


(function() {
		
	"use strict";

	const express = require("express");
	const app = express();
	let fs = require('fs');
	let mysql = require('mysql');
	
	const  bodyParser = require('body-parser');
	const jsonParser = bodyParser.json();
	
	//app.set('port', (process.env.PORT || 3000));

	app.use(express.static('public'));
	
	/** creates a mysql connection object to connect to the database
		Returns: the connection object
		SECURITY: users should never see this but this information
					should still be in a seperate file
	*/
	function makeConnection(){
		let con = mysql.createConnection({
		  host     : 'cs346p2mysqlrockpaper.ccvzhpt8n1yb.us-east-1.rds.amazonaws.com',
		  user     : 'egamIrorriM',
		  password : 'KingsHorses',
		  port     : '3306',
		  database : 'testdb'
		});
		
		return con;
		
	}
	
	/** checks if the given username and password are in the database*/
	function logIn(userName, pass, res) {
		
		let con = makeConnection();
		let json = {};

		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM 337user WHERE userName='" + userName + "' AND password ='"+ pass +"'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				if(result.length <= 0){
					json["result"] = null;
					res.send(json);
				} else {
					json["result"] = "success";
					json["clicks"] = result[0]["clicks"];
					addSession(con, userName, json, res);
				}
			});
		});
		
	}
	
	/** checks if the session id is valid and returns username and clicks if so
	*/
	
	function checkSession(sessionID, res){
		
		let json = {};
		
		if( parseInt(sessionID) < 0){
			json["result"] = null;
			res.send(json);
		}
		let con = makeConnection();
		

		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM 337user WHERE session='" + sessionID + "'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				if(result.length !=1){
					json["result"] = null;
					res.send(json);
				} else {
					json["result"] = "success";
					json["userName"] = result[0]["userName"];
					json["clicks"] = result[0]["clicks"];
					res.send(json);
				}
			});
		});
		
		
	}
	
	/** adds a new sessionID to the users account
	*/
	function addSession(con, userName, json, res) {
		let session = makeSessionId();
		json["session"] = session;
		
		let update = "UPDATE 337user SET session = '" + session + "' WHERE (userName = '"+ userName +"')";
			
		con.query(update, function (err, result, fields) {
			if (err) throw err;
			
			res.send(json);
		});
		
	}
	
	/** creates a random sessionID
	*/
	function makeSessionId(){
		let randomNumber = Math.floor(Math.random() * 1000000);
		return randomNumber;
	}
	
	
	/** tries to add the given username and password as a new instanceof
		in the database
	*/
	function addUser(userName, pass, res) {
		
		let con = makeConnection();
		
		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM 337user WHERE userName='" + userName + "'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				if(result.length > 0){
					res.send("Username already in use.");
					
				} else {
					let insert = "INSERT INTO 337user (userName, password) VALUES ('"+userName +"', '"+pass +"')";
					
					con.query(insert, function (err, result) {
						if (err) throw err;
						
						res.send("New account created.");
						
					});
					
				}
				
			});
		});
		
	}
	
	
	/** checks if the given username and password are in the database*/
	function logIn(userName, pass, res) {
		
		let con = makeConnection();
		let json = {};

		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM 337user WHERE userName='" + userName + "' AND password ='"+ pass +"'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				if(result.length <= 0){
					json["result"] = null;
					res.send(json);
				} else {
					json["result"] = "success";
					json["clicks"] = result[0]["clicks"];
					addSession(con, userName, json, res);
				}
			});
		});
		
	}
	

	/** checks that the sessionID is good, and then tries to update the clicks
	*/
	function updateClicks(sessionID, clicks, res){
		
		let json = {};
		
		if( parseInt(sessionID) < 0){
			json["result"] = null;
			res.send(json);
		}
		
		let con = makeConnection();
		

		con.connect(function(err) {
			if (err) throw err;
			
			let question = "SELECT * FROM 337user WHERE session='" + sessionID + "'";
			
			con.query(question, function (err, result, fields) {
				if (err) throw err;
				
				if(result.length !=1){
					json["result"] = null;
					res.send(json);
				} else {
					json["result"] = "success";
			
					setClicks(sessionID, clicks, json, con, res);
			
				}
			});
		});
		
	}

	/** sets the number of clicks to the sessionID
	*/
	function setClicks(sessionId, clicks, json, con, res){
		let update = "UPDATE 337user SET clicks = '" + clicks + "' WHERE (session = '"+ sessionId +"')";
			
		con.query(update, function (err, result, fields) {
			if (err) throw err;
			
			res.send(json);
		});
		
		
		
	}
	
	/** ensures there is no problem with the program talking back and forth on the same computer*/
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	
	/** collects the data sent from rockPaper.js
		and calles the method required
	*/
	app.post('/', jsonParser, function (req, res) {
		let params = req.body;
		let request = params.request;
		let sessionID = params.session;
		let username = params.userName;
		let pass = params.pass;
		let clicks = params.clicks;
		
		
		if(request == "logIn"){
			
			logIn(username, pass, res);
		}
		
		if(request == "checkSession"){
			
			checkSession(sessionID, res);
		}
		
		if(request == "addUser"){
			
			addUser(username, pass, res);
		}
		
		if(request == "updateClicks"){
			
			updateClicks(sessionID, clicks, res);
		}
		
	});
	
	app.get('/', function (req, res) {//get function
		res.send("hello!\n");
		

	});
	
	
	
	/*
	app.listen(app.get('port'), function() {
		console.log("Node app is running at localhost:" + app.get('port'))
	})
	*/
	
	//let port = process.env.PORT || 3000;
	//app.listen(port);
	app.listen(process.env.PORT);
	
}) ();
