/*
Matthew Chambers
CSC 337, Spring 2019
Homework 11

holds all of the logic fore the rockPaper html
sends messages to rockPaper_service.js and holds
log ins.
uses cookies to keep track of log ins if the buttons is clicked.
*/


"use strict";

(function() {
	
	//http://localhost:3000
	//http://ec2-52-206-46-141.compute-1.amazonaws.com/:3000
	let SERVER_ADDRESS = "https://csc337-finalproject-clickv3.herokuapp.com/:process.env.PORT";
	let loggedInUserName = null;
	let buttonClicks = 0;
	
	window.onload = function() {
		
		//enterLogIn();
		//console.log (document.cookie);
		let sessionId = getSessionIDfromCookie();
		if ( sessionId < 0){
			enterLogIn();
	
		} else {
			
			checkSessionID( sessionId);
			
			
		}
		
	};
	
	
	/** returns the session id stored in the cookie*/
	function getSessionIDfromCookie(){
		let id = getCookie("sessionID");
		if(id == null){
			return -1;
		}
		
		let sessionId = parseInt(id);
		
		return sessionId;
		
	}
	
	
	/** checks to see if the session id is valid*/
	function checkSessionID(sessionId){
		
		const fetchOptions = makeFetchOptions( "checkSession", sessionId, "", "", 0);
		
		let url = SERVER_ADDRESS;
		
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				let json = JSON.parse(responseText);
				handleSessionResponse(json);
			
			})
			.catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML = error;
				
			});
		
		
	}
	
	
	/** takes care of the results of the sesion id check*/
	function handleSessionResponse(json){
		
		if(json["result"] == "success") {
					
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "";
					 
			loggedInUserName = json["userName"];
			buttonClicks = json["clicks"];
			
			enterLobby();
					
		} else {
			
			enterLogIn();
		}
		
	}
	
	/** checks that the paramaters are of valid size*/
	function checkParamSize( param, paramName){
		if(param.length < 3 || param.length > 16 ){
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  paramName + " must be between 3 and 16 characters long.";
			return -1;
		}
		
		return 0;
		
	}
	
	
	
	/** sends a request to service to try to log In
	*/
	function logInAttempt() {
	
		let username = document.getElementById("loginName").value;
		let pass = document.getElementById("loginPass").value;
		
		
		if( checkParamSize(username, "Username") < 0 || checkParamSize(pass, "Password") < 0){
			return;
		}
		
		const fetchOptions = makeFetchOptions( "logIn", "", username, pass, 0);
		
		let url = SERVER_ADDRESS;
		
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				let json = JSON.parse(responseText);
				handleLogInResponse(json);
			
			})
			.catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML = error;
				
			});
		
	}
	
	
	/** creates the message, and fetch options object to send to service*/
	function makeFetchOptions( requestType, sessionId, username, passw, click) {
		
		const message = {request: requestType,
					session: sessionId,
					userName: username, 
					pass: passw,
					clicks: click};
	
		const fetchOptions = {
			method : 'POST',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			},
			body : JSON.stringify(message)
		};
		
		return fetchOptions;
	}
	
	
	/** handles the log in response from server*/
	function handleLogInResponse( json) {
		
		if(json["result"] == "success") {
					
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "";
					 
			loggedInUserName = json["userName"];
			buttonClicks = json["clicks"];
			
			makeCookie( "sessionID", json["session"]);
			
			enterLobby();
					
		} else {
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "Username or password not recognized.";
					
		}
		
	}
	
	
	
	/** determins if the new user input set is a viable set
	*/
	function checkNewUserValidity(username, pass, passRep){
		
		if( checkParamSize(username, "Username") < 0 || checkParamSize(pass, "Password") < 0){
			return;
		}
		
		if(pass != passRep){
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "passwords dont match.";
			return 0;
		}
		
		return -1;
		
	}
	
	/** sends a request to rockPaper_service to add this 
		name password pair to be a new user account.
	*/
	function makeNewUser() {
		let username = document.getElementById("newName").value;
		let pass = document.getElementById("newPass").value;
		let passRep = document.getElementById("newPassRep").value;
		
		if( checkNewUserValidity(username, pass, passRep) == 0) {
			return;
		}
		
		const fetchOptions = makeFetchOptions("addUser", "", username, pass, 0);
		
		let url = SERVER_ADDRESS;
		
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML = responseText;
			
			})
			.catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML = error;
				
			});
	
		
	}
	
	
	/** sends a request to the server save the current number of clicks to the database*/
	function saveClicks() {
		
		let sessionId = getSessionIDfromCookie();
		
		const fetchOptions = makeFetchOptions("updateClicks", sessionId, "", "", buttonClicks);
		
		let url = SERVER_ADDRESS;
		
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				let json = JSON.parse(responseText);
				handleClicksResponse(json);
				
				
			})
			.catch(function(error) {
				let logErrorDiv = document.getElementById("errorLog");
				logErrorDiv.innerHTML = error;
				
			});
		
	}
	
	
	/** handles the json response from server for saving cliccks*/
	function handleClicksResponse(json){
		
		if(json["result"] == "success") {
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "Save successfull.";	
					
		} else {
			let logErrorDiv = document.getElementById("errorLog");
			logErrorDiv.innerHTML =  "Error occured unable to save clicks.";
					
		}
		
	}
	

	
	/** displays all of the lobby buttons and text divs to the HTML*/
	function enterLobby(){
		
		clearPage();
		
		addButtonSection();
		
	}
	
	

	
	/** creates the simplest of cookies*/
	function makeCookie( name, value) {
		document.cookie = name + "=" + value;
	}
	
	/** creates a cookie that holds the username and has an experation date*/
	function makeExpireCookie() {
		 //document.cookie = ID_COOKIE_NAME + "=" + loggedInUserName;
		 
		let name = "rockPaperId";
		let value = loggedInUserName;
		let expires;
		let days = 1;
		
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = ", expires=" + date.toGMTString();
  
		document.cookie = name + "=" + value + expires;
		
	}
	
	
	/** this code is taken from https://www.w3schools.com/js/js_cookies.asp */
	function getCookie(cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
			  c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
			  return c.substring(name.length, c.length);
			}
		  }
		  return "";
	}

	
	
	
	
	
	
	
	
	/** logs the user out of the site and displays the log in screen*/
	function logOut() {
		
		makeCookie("sessionID", "-1");
		loggedInUserName = null;
		
		enterLogIn();
	}
	
	/** adds everything to the HTML to display the log in screen*/
	function enterLogIn() {
		clearPage();
		
		addLogInDiv();
		
		addNewUserDiv();
		
	}
	
	/** adds the HTML objects to allow a user to log in*/
	function addLogInDiv(){
		let logInSec = document.getElementById("logIn");
		
		let userTitle = document.createElement("h2");
		userTitle.innerHTML = "Log In";
		logInSec.appendChild(userTitle);
		
		let userName = document.createElement("h3");
		userName.innerHTML = "Username:";
		logInSec.appendChild(userName);
		
		let nameText = document.createElement("textarea");
		nameText.id = "loginName";
		nameText.rows = 1;
		nameText.cols = 30;
		logInSec.appendChild(nameText);
		
		let userPass = document.createElement("h3");
		userPass.innerHTML = "Password:";
		logInSec.appendChild(userPass);
		
		let namePass = document.createElement("textarea");
		namePass.id = "loginPass";
		namePass.rows = 1;
		namePass.cols = 30;
		logInSec.appendChild(namePass);
		
		let logButton = makeNewButton( "logInButton", "Log In", logInSec);
		logButton.onclick = logInAttempt;
	
		
	}
	
	
	/** adds the HTML objects to rockPaper.html to allow the 
		user to make a new account
	*/
	function addNewUserDiv(){
		let newUserSec = document.getElementById("newUser");
		
		let userTitle = document.createElement("h2");
		userTitle.innerHTML = "New user";
		newUserSec.appendChild(userTitle);
		
		let userName = document.createElement("h3");
		userName.innerHTML = "Username:";
		newUserSec.appendChild(userName);
		
		let nameText = document.createElement("textarea");
		nameText.id = "newName";
		nameText.rows = 1;
		nameText.cols = 30;
		newUserSec.appendChild(nameText);
		
		let userPass = document.createElement("h3");
		userPass.innerHTML = "Password:";
		newUserSec.appendChild(userPass);
		
		let namePass = document.createElement("textarea");
		namePass.id = "newPass";
		namePass.rows = 1;
		namePass.cols = 30;
		newUserSec.appendChild(namePass);
		
		let userPassRep = document.createElement("h3");
		userPassRep.innerHTML = "Repeat Password:";
		newUserSec.appendChild(userPassRep);
		
		let namePassRep = document.createElement("textarea");
		namePassRep.id = "newPassRep";
		namePassRep.rows = 1;
		namePassRep.cols = 30;
		newUserSec.appendChild(namePassRep);
		
		
		let logButton = makeNewButton( "newUserButton", "Make new user", newUserSec);
		logButton.onclick = makeNewUser;
		
		
	}
	
			/** adds the various options buttons to the HTML
		mainly used for the cookie example
	*/
	function addButtonSection(){
		
		let buttonDiv = document.getElementById("buttonDiv");
		
		let basicCookieButton = makeNewButton( "basicCookieButton", "Click Me", buttonDiv);
		basicCookieButton.onclick = increaseClicks;
		
		
		let clicksHeader = document.createElement("h3");
		clicksHeader.innerHTML = "Life time clicks";
		buttonDiv.appendChild(clicksHeader);
		
		let totalClicks = document.createElement("h2");
		totalClicks.id = "totalClicks";
		totalClicks.innerHTML = buttonClicks;
		buttonDiv.appendChild(totalClicks);
		
		
		let saveButton = makeNewButton( "saveButton", "save", buttonDiv);
		saveButton.onclick = saveClicks;
		
		
		let logoutButton = makeNewButton( "logoutButton", "Log Out", buttonDiv);
		logoutButton.onclick = logOut;
		
	}
	
	/** increases clicks by 1*/
	function increaseClicks(){
		buttonClicks++;
		
		let totalClicks = document.getElementById("totalClicks");
		totalClicks.innerHTML = buttonClicks;
	}
	
	
	
	
	/** removes all of the HTML objects that have been created by rockPaper.js*/
	function clearPage(){
		document.getElementById("logIn").innerHTML = "";
		
		document.getElementById("newUser").innerHTML = "";
		
		document.getElementById("errorLog").innerHTML = "";
		
		document.getElementById("buttonDiv").innerHTML = "";
		
		
	}
	
	/** creates a new HTML button object with the given id, text on the button
		and attaches it to the 'attachTo' object
	*/
	function makeNewButton(newId, innerText, attachTo){
		
		let newButton = document.createElement("button");
		newButton.id = newId;
		newButton.innerHTML = innerText;
		attachTo.appendChild(newButton);
		return newButton;
		
	}
	
	
	/** checks the status of the return AJAX result, returns an error if needed*/
	function checkStatus(response) {  
		if (response.status >= 200 && response.status < 300) {  
			return response.text();
		} else if (response.status == 410) {
			return Promise.reject(new Error("There is no data on this state.")); 
		} else {  
			return Promise.reject(new Error(response.status+": "+response.statusText)); 
		} 
	}
	


	
}) ();