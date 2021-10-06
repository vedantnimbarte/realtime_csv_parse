const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql");
const chokidar = require("chokidar");
const { JSDOM } = require("jsdom");

const { window } = new JSDOM();

const connection = mysql.createConnection({
  host: "164.52.216.37",
  user: "root",
  password: "micro@440027",
  database: "axel_box",
});

let rows = 0;
const values = [];

function insertData(values) {
  let sql =
    "INSERT INTO temp_data(`train`, `unique_id`, `axle-r`, `temp-r`, `axle-l`, `temp-l`, `date`, `time`) VALUES (?,?,?,?,?,?,?,?);";
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
    }
  });
}

function watchfile() {
  chokidar.watch("./csv/*.csv").on("add", (event, path) => {
    let filename = event.split("/")[1];
    console.log("Inserting.");

    fs.createReadStream(`./csv/${filename}`)
      .pipe(csv())
      .on("data", (row) => {
        let data = {
          train: row.train,
          UniqueID: row.UniqueID,
          AxleR: row.AxleR,
          TemperatureR: row.TemperatureR,
          AxleL: row.AxleL,
          TemperatureL: row.TemperatureL,
          Date: row.Date,
          Time: row.Time,
        };

        values.push(data);
      })
      .on("end", () => {
        let sql =
          "INSERT INTO temp_data(`train`, `unique_id`, `axle-r`, `temp-r`, `axle-l`, `temp-l`, `date`, `time`) VALUES (?,?,?,?,?,?,?,?);";
        for (let i = 0; i < values.length; i++) {
          connection.query(sql, Object.values(values[i]), (err, result) => {
            if (err) {
              console.error(err);
            }
            console.log(`${i} rows inserted successfully`);
          });
        }
      });
  });
}

watchfile();
