import express from "express";
import mysql, { RowDataPacket } from "mysql2/promise";
import crypto from "crypto";
import { v4 as uuid } from "uuid";
import cookieParser from "cookie-parser";

async function main() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());

  type TokenData = { [key: string]: string };
  const token_storage: TokenData = {};

  const db = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "issye",
    database: "FotbollsLagDB",
  });

  app.use("/", express.static("public"));

  // GET route to fetch football teams from the database
  app.get("/FotbollsLagDB", async function (req, res) {
    try {
      const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM Lag;");
      if (Array.isArray(rows)) {
        let html = "<table border='1'>";
        html +=
          "<tr><th>Lag ID</th><th>Lag Namn</th><th>Ekonomi</th><th>Champions League Trophies</th><th>Liga Titlar</th></tr>";
        rows.forEach((row) => {
          html += "<tr>";
          html += "<td>" + row.LagID + "</td>";
          html += "<td>" + row.LagNamn + "</td>";
          html += "<td>" + row.Ekonomi + "</td>";
          html += "<td>" + row.ChampionsLeagueTrophies + "</td>";
          html += "<td>" + row.LigaTitlar + "</td>";
          html += "</tr>";
        });
        html += "</table>";
        res.send(html);
      } else {
        throw new Error("No data returned from the query.");
      }
    } catch (error) {
      console.error("Error fetching football teams:", error);
      res.status(500).send("An error occurred while fetching football teams.");
    }
  });

  app.get("/input", async function (req, res) {
    const { LagNamn, Ekonomi, ChampionsLeagueTrophies, LigaTitlar } = req.query;

    if (LagNamn && Ekonomi && ChampionsLeagueTrophies && LigaTitlar) {
      const question =
        "INSERT INTO `Lag` (LagNamn, Ekonomi, ChampionsLeagueTrophies, LigaTitlar) VALUES (?, ?, ?, ?)";

      try {
        await db.execute(question, [
          LagNamn,
          Ekonomi,
          ChampionsLeagueTrophies,
          LigaTitlar,
        ]);
        res.send("Data har lagts till i databasen!");
      } catch (error) {
        console.error("Error när data skulle läggas till i databasen:", error);
        res
          .status(500)
          .send("Ett fel inträffade när data skulle läggas till i databasen.");
      }
    } else {
      res.status(400).send("Alla parametrar måste vara definierade.");
    }
  });

  // GET route to handle login
  app.get("/login", async function (req, res) {
    if (
      req.query &&
      typeof req.query.user === "string" &&
      typeof req.query.password === "string"
    ) {
      const user_name = req.query.user;
      const password = crypto
        .createHash("md5")
        .update(String(req.query.password))
        .digest("hex");
      console.log("Username:", user_name);
      console.log("Password Hash:", password);
      const question = "SELECT name, password FROM user WHERE name = ?";
      try {
        const [rows] = await db.execute<RowDataPacket[]>(question, [user_name]);
        console.log("DB Rows:", rows);
        if (rows.length > 0 && rows[0].password === password) {
          const token = uuid();
          token_storage[token] = user_name;
          res.cookie("login", token, { maxAge: 10000000 });
          res.send("Du är inloggad!");
        } else {
          res.send("Fel lösenord!");
        }
      } catch (error) {
        console.error("Database query error:", error);
        res
          .status(500)
          .send("Ett fel inträffade när användarinformation skulle hämtas.");
      }
    } else {
      res.send("Du har inte skrivit in ett användarnamn eller lösenord!");
    }
  });

  const port = 8080;

  app.listen(port, () => {
    console.log("You can find this server on: http://localhost:" + port);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
