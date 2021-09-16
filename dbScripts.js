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
  // db.each(
  //   "select name from sqlite_master where type='table'",
  //   function (err, tables) {
  //     console.log(tables);
  //   }
  // );
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
      row.username,
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

async function getRestaurantsByTime(db, row) {
  try {
    const result = await db.all("SELECT * FROM restaurant");

    //will contain data for all restaurants
    const resData = [];
    for (let res of result) {
      const resName = res.name.replace(/[^a-zA-Z0-9]/g, "");
      const restaurant = await db.get(`SELECT * FROM ${resName} where time=?`, [
        row.time,
      ]);
      restaurant.image = res.image;
      resData.push(restaurant);
    }

    return resData;
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

async function getUserPreviousBookings(db, row) {
  try {
    const userName = row.tableName.replace(/[^a-zA-Z0-9]/g, "");
    await db.run(
      `CREATE TABLE IF NOT EXISTS ${userName}(name text, booking_name text, time text, tables int, price int, description text, image text)`
    );
    const result = await db.all(`SELECT * FROM ${userName}`);
    if (result) return { restaurants: result, available: true };
    return { restaurants: result, available: false };
  } catch (e) {
    if (!row.tableName)
      console.error(
        `Previous booking error: Username not available, please login`
      );
    else console.error(`Previous booking error: ${e}`);
    return { restaurants: [], available: false };
  }
}

async function bookTable(db, row) {
  try {
    const userName = row.tableName.replace(/[^a-zA-Z0-9]/g, "");
    await db.run(
      `CREATE TABLE IF NOT EXISTS ${userName}(name text, booking_name text, time text, tables int, price int, description text, image text)`
    );

    const resName = row.name.replace(/[^a-zA-Z0-9]/g, "");
    //reduce the number of restaurants so that the tables can be reduced from the restaurant table
    //of the respective restaurant at the specfied time only
    await db.run(`UPDATE ${resName} set tables = ? WHERE time=?`, [
      row.tables - row.bookTables,
      row.time,
    ]);
    const result = await db.run(
      `INSERT INTO ${userName} VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        row.name,
        row.bookingName,
        row.time,
        Number.parseInt(row.bookTables),
        row.price,
        row.description,
        row.image,
      ]
    );
    if (result) return { booked: true };
    return { booked: false };
  } catch (e) {
    console.error(`Booking error: ${e}`);
    return { booked: false };
  }
}

async function cancelTable(db, row) {
  try {
    //what this means is that if all tables are canceled remove the record
    let result;
    const userName = row.tableName.replace(/[^a-zA-Z0-9]/g, "");
    //calculate new cost based on the number of tables canceled
    const cancelPrice =
      Number.parseInt(row.price / row.tables) * row.cancelTables;

    if (row.tables == row.cancelTables) {
      console.log(row);
      result = await db.run(
        `DELETE FROM ${userName} WHERE time = ? AND name = ?`,
        row.time,
        row.name
      );
    } else {
      result = await db.run(
        `UPDATE ${userName} SET tables = ?, price=?  WHERE name = ? AND time = ?`,
        [row.tables - row.cancelTables, cancelPrice, row.name, row.time]
      );
    }

    const resTable = row.name.replace(/[^a-zA-Z0-9]/g, "");
    //fetching current tables available in the restaurant whose table is being canceled
    let { tables } = await db.get(
      `SELECT tables from ${resTable} where time=?`,
      row.time
    );
    //increasing the tables with the number of tables canceled.
    tables += row.cancelTables;

    await db.run(`UPDATE ${resTable} set tables = ? WHERE time = ?`, [
      tables,
      row.time,
    ]);

    if (result) return { canceled: true };
    return { canceled: false };
  } catch (e) {
    console.error(`Booking error: ${e}`);
    return { canceled: false };
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
    console.log(resTable);
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
  getUserPreviousBookings,
  deleteRestaurant,
  getOneRestaurant,
  updateRestaurant,
  bookTable,
  cancelTable,
  searchRestaurant,
  getRestaurantsByTime,
};
