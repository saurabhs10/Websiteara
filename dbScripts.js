const sqlite = require("sqlite3").verbose();
//using sqlite because sqlite has async functions which will be used
//with registering user
const { open } = require("sqlite");

const init = async () => {
  return await open({
    filename: "./db/restaurantDB.db",
    driver: sqlite.Database,
  });
};

function createTable(db) {
  db.run(
    "CREATE TABLE IF NOT EXISTS account_data(email text PRIMARY KEY, password text)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS restaurant(name text PRIMARY KEY, location text, tables int, price int, description text, image text)"
  );
  //db.run("DROP TABLE abc");
}


async function login(db, row) {
  let exec;
  try {
    exec = await db.get(
      "SELECT * FROM account_data WHERE email=? AND password=?",
      [row.email, row.password]
    );
    if (exec) return true;
    return false;
  } catch (e) {
    console.error(e);
  }
}

async function register(db, row) {
  let exec;
  try {
    exec = await db.run(`INSERT INTO account_data VALUES(?, ?)`, [
      row.email,
      row.password,
    ]);
  } catch (e) {
    return { msg: "User already exists", registered: false };
  }
  if (exec) {
    return { msg: "User registered", registered: true };
  }
}


module.exports = {
  init,
  createTable,
  login,
  register
};
