const fs = require("fs");
const path = require("path");

// Read DB asynchronously
 const getDB = () => new Promise(async (resolve, reject) => {
  try {
    let db = await fs.readFileSync(path.join(__dirname, "db.json"), "utf-8");
    db = JSON.parse(db);
    resolve(db);
  } catch (error) {
    reject(error);
  }
});

// Write DB asynchronously
 const writeToDB = (db) => new Promise(async (resolve, reject) => {
  try {
    await fs.writeFileSync(
      path.join(__dirname, "db.json"),
      JSON.stringify(db, null, 2),
      "utf-8"
    );
    resolve()
  } catch(error) {
    reject(error)
  }
});

module.exports = {getDB, writeToDB}
