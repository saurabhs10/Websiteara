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
    "CREATE TABLE IF NOT EXISTS account_data(email text PRIMARY KEY, username text, password text)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS restaurant(name text PRIMARY KEY, location text, tables int, price int, description text, image text)"
  );
  //db.run("DROP TABLE abc");
}

//used for creating a restaurant
async function insertOne(db, row) {
  let exec;
  const time = 12;
  //we are remove all special characters from the restaurant name since
  //it will be used for table creation and special characters are not valid
  //name for tables in sqlite.
  const resName = row.resName.replace(/[^a-zA-Z0-9]/g, "");
  try {
    exec = await db.run("INSERT INTO restaurant VALUES(?, ?, ?, ?, ?, ?)", [
      row.resName,
      row.resLocation,
      Number.parseInt(row.resTables),
      row.resPrice,
      row.resDesc,
      row.resImg,
    ]);
    if (exec) {
      await db.run(
        `CREATE TABLE IF NOT EXISTS ${resName}(name text, location text, tables int, price int, description text, time text)`
      );
      //insert 10 time slots for available bookings
      for (let i = 0; i < 11; i++) {
        await db.run(`INSERT INTO ${resName} VALUES(?, ?, ?, ?, ?, ?)`, [
          row.resName,
          row.resLocation,
          Number.parseInt(row.resTables),
          row.resPrice,
          row.resDesc,
          `${time + i}:00`,
        ]);
      }
      return { msg: "Restaurant inserted", inserted: true };
    }
    return {
      msg: "Restaurant not inserted, It may already exist.",
      inserted: false,
    };
  } catch (e) {
    console.error(e);
    return {
      msg: "Restaurant could not be added, It may already exist.",
      inserted: false,
    };
  }
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
    exec = await db.run(`INSERT INTO account_data VALUES(?, ?, ?)`, [
      row.email,
      row.userName,
      row.password,
    ]);
  } catch (e) {
    return { msg: "User already exists", registered: false };
  }
  if (exec) {
    return { msg: "User registered", registered: true };
  }
}

async function getRestaurants(db) {
  try {
    const result = await db.all("SELECT * FROM restaurant");
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
}


async function getOneRestaurant(db, row) {
  try {
    const result = await db.all(
      "SELECT * FROM restaurant WHERE name = ?",
      row.name
    );
    console.log(result);
    return result[0];
  } catch (e) {
    console.error(e);
    return [];
  }
}





async function deleteRestaurant(db, row) {
  try {
    const result = await db.run(
      `DELETE FROM restaurant WHERE name = ?`,
      row.restaurantName
    );
    const restaurantName = row.restaurantName.replace(/[^a-zA-Z0-9]/g, "");
    //drop the table that stores restaurant data according to time.
    await db.run(`DROP TABLE ${restaurantName}`);
    if (result) return { deleted: true };
    return { deleted: false };
  } catch (e) {
    console.error(`Delete error: ${e}`);
    return { deleted: false };
  }
}

async function updateRestaurant(db, row) {
  let exec;
  console.log(row);
  try {
    exec = await db.run(
      "UPDATE restaurant SET location = ?, tables = ?, price = ?, description = ? WHERE name = ?",
      [
        row.resLocation,
        Number.parseInt(row.resTables),
        Number.parseInt(row.resPrice),
        row.resDesc,
        row.resName,
      ]
    );

    const resTable = row.resName.replace(/[^a-zA-Z0-9]/g, "");
    let startTime = 12;
    let endTime = 22;
    const incrementTables =
      Number.parseInt(row.resTables) - Number.parseInt(row.resPrevTables);
    //get all the tables from specified time and update the number of tables
    for (let i = startTime; i <= endTime; i++) {
      let { tables } = await db.get(
        `SELECT tables from ${resTable} WHERE time=?`,
        [`${i}:00`]
      );

      await db.run(
        `UPDATE ${resTable} SET location = ?, tables = ?, price = ?, description = ? WHERE time = ?`,
        [
          row.resLocation,
          Number.parseInt(tables) + incrementTables,
          Number.parseInt(row.resPrice),
          row.resDesc,
          `${i}:00`,
        ]
      );
    }
    if (exec) return { updated: true };
    return { updated: false };
  } catch (e) {
    console.error(e);
    return { updated: false };
  }
}

async function searchRestaurant(db, row) {
  try {
    const names = await db.all(
      `SELECT name, image FROM restaurant WHERE name LIKE '%${row.search}%' OR location LIKE '%${row.search}%'`
    );

    const rows = [];
    for (let obj of names) {
      const resTable = obj.name.replace(/[^a-zA-Z0-9]/g, "");
      rows.push(
        ...(await db.all(`SELECT * FROM ${resTable} WHERE time=?`, row.time))
      );
      rows[rows.length - 1].image = obj.image;
    }

    return rows;
  } catch (e) {
    console.error(e);
    return [];
  }
}

module.exports = {
  init,
  createTable,
  insertOne,
  login,
  register,
  getRestaurants,
  deleteRestaurant,
  getOneRestaurant,
  updateRestaurant,
  searchRestaurant,
};
