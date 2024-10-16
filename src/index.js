/**
 * Imports necessary modules for creating an Express server, working with the file system,
 * handling file paths, and generating unique IDs using nanoid.
 */
const express = require("express");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const cors = require('cors');
const {getDB, writeToDB} = require('./util.js')

/**
 * Creates an Express application and adds middleware to parse incoming requests with JSON payloads.
 * @returns The Express application instance with JSON parsing middleware.
 */
const app = express();
app.use(express.json());
app.use(cors());
/**
 * Defines a route for the root URL that sends a welcome message to the client.
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 * @returns None
 */
app.get("/", (request, response) => {
  response.send("Welcome to express app");
});

/**
 * Handles POST requests to register a new user.
 * @param {Object} request - The request object containing user data.
 * @param {Object} response - The response object to send back to the client.
 * @returns None
 */
app.post("/register", async (request, response) => {
  const { email, password, username } = request.body;
  console.log({email, password, username});
  if (!email || !password || !username) {
    return response
      .status(400)
      .json({ success: false, message: ["Invalid request body"] });
  }
  // Read db file  
  // Check for user exists
  // If: user already exist ? respond with error
  // Else: Add user to db, Send success reponse

  /**
   * Reads the contents of the "db.json" file located in the current directory synchronously,
   * parses the JSON data, and assigns it to the variable db.
   * @returns The parsed JSON data from the "db.json" file.
   */
  const db = await getDB();
  /**
   * Check if a user with the same email already exists in the database.
   * @param {Array} db.users - The array of users in the database.
   * @param {Object} request.body.email - The email of the user to check.
   * @returns {Object | undefined} The user object if found, otherwise undefined.
   */
  const users = db.users || [];
  const userExist = users.find(
    (user) => user.email.toLowerCase() === request.body.email.toLowerCase()
  );

  /**
   * Checks if a user already exists in the database. If the user does not exist, 
   * it adds the user to the database and saves the updated database to a JSON file.
   * @param {boolean} userExist - Indicates if the user already exists in the database.
   * @param {object} request - The request object containing the user data.
   * @param {object} response - The response object to send back to the client.
   * @param {array} users - The array of existing users in the database.
   * @param {object} db - The database object containing user data.
   * @returns None
   */
  if (userExist) {
    response.status(400).json({success: false, message: ["User already exist"]});
  } else {
    const user = { ...request.body, _id: nanoid(28) };
    users.push(user);
    const { password, ...userWithoutPassword } = user;
    db.users = users;

    await writeToDB(db);
    console.log({ body: request.body, db });
    response.status(201).json({success: true, data: userWithoutPassword});
  }
});

/**
 * Handles the POST request to the "/login" endpoint for user authentication.
 * @param {Object} request - The request object containing user credentials.
 * @param {Object} response - The response object to send back to the client.
 * @returns None
 */
app.post("/login", async (request, response) => {
  const { email, password } = request.body;
  /**
   * Checks if the email or password is missing in the request body.
   * If either email or password is missing, it sends a 400 status response
   * with a JSON object containing an error message.
   * @param {string} email - The email address provided in the request body.
   * @param {string} password - The password provided in the request body.
   * @returns None
   */
  if (!email || !password) {
    response
      .status(400)
      .json({ success: false, message: ["Invalid request body"] });
  }

  // Check for user exist in db
  // validate email and password matching
  // If: matching ? respond with user data
  // Else: Respond with error

  /**
   * Reads the contents of the "db.json" file, parses it into a JavaScript object,
   * and then finds a user with the given email and password in the users array.
   * @param {string} email - The email of the user to find.
   * @param {string} password - The password of the user to find.
   * @returns The user object if found, otherwise undefined.
   */
  let db = await getDB();
  const users = db.users || [];
  const user = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
  
  /**
   * Checks if a user object exists and returns a response accordingly.
   * If user exists, it removes the password field and sends the user data in the response.
   * If user does not exist, it sends a 401 status with an error message.
   * @param {object} user - The user object to check.
   * @param {object} response - The response object to send the result.
   * @returns None
   */
  if (user) {
    const { password, ...userWithoutPassword } = user;
    response.status(200).json({ success: true, data: userWithoutPassword });
  } else {
    response.status(401).json({ success: false, message: ["Invalid email or password"] });
  }
});


/**
 * Starts the Express app and listens on port 8080.
 * Logs a message with the current timestamp indicating that the Express app is serving at a specific URL.
 * @returns None
 */
app.listen(8080, () => {
  console.log(`${new Date().getTime()}: Express app is serving at http://localhost:8080`);
});
 
