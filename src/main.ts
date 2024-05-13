import express from "express";
import mysql, { RowDataPacket, OkPacket } from "mysql2/promise";
import crypto from "crypto";
import { v4 as uuid } from "uuid";
import cookie from "cookie-parser";

async function main() {
  const app = express();
  app.use(cookie());

  const db = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "issye",
    database: "FotbollsLagDB",
  });

  // GET-väg för att hämta lagens namn
  app.get("/LagNamn", async function (req, res) {
    try {
      const question = "SELECT * FROM LagNamn;";
      const result = await db.execute(question);
      const data = result.values().next().value;
      res.send(data);
    } catch (error) {
      console.error("Error fetching team names:", error);
      res.status(500).send("An error occurred while fetching team names.");
    }
  });

  // GET-väg för att hantera inmatning
  app.get("/input", async function (req, res) {
    try {
      const FotbollsLagDB = req.query.FotbollsLagDB;
      const LagNamn = "";
      const Ekonomi = 0;
      const ChampionsLeagueTrophies = 0;
      const LigaTitlar = 0;
      const question = "INSERT INTO msg VALUES (null, ?, ?, ?);";
      const result = await db.execute(question, [
        LagNamn,
        Ekonomi,
        ChampionsLeagueTrophies,
        LigaTitlar,
      ]);
      res.send(FotbollsLagDB);
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).send("An error occurred while inserting data.");
    }
  });

  app.use(express.json());
  app.post("/reg", async (req: express.Request, res: express.Response) => {
    try {
      const { user, password } = req.body;
      if (!user || !password) {
        return res
          .status(400)
          .send("Du måste ange både användarnamn och lösenord.");
      }
      const [existingUser] = await db.execute(
        "SELECT * FROM user WHERE name = ?",
        [user],
      );
      if ((existingUser as RowDataPacket[]).length > 0) {
        return res.status(400).send("Användarnamnet är redan upptaget.");
      }
      const hashedPassword = crypto
        .createHash("md5")
        .update(password)
        .digest("hex");
      await db.execute("INSERT INTO user (name, password) VALUES (?, ?)", [
        user,
        hashedPassword,
      ]);
      res.status(201).send("Konto skapat framgångsrikt.");
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send("Ett fel inträffade under registreringen.");
    }
  });

  app.get(
    "/login",
    async function (req: express.Request, res: express.Response) {
      try {
        let count = 0;
        type TokenData = { [key: string]: string };
        const token_storage: TokenData = {};

        console.log("Type of user:", typeof req.query.user);
        console.log("Type of password:", typeof req.query.password);

        const user_name = req.query.user as string;

        if (req.query && typeof req.query.password === "string") {
          const password = crypto
            .createHash("md5")
            .update(String(req.query.password))
            .digest("hex");
          let question = "SELECT name,password FROM user WHERE name =?";
          console.log(user_name);
          console.log(req.query.password);
          console.log(db.format(question, [user_name]));
          const [rows] = await db.execute(question, [user_name]);
          const user_answer = rows as RowDataPacket[];
          if (user_answer.length > 0) {
            const password_from_database = user_answer[0]?.password;
            console.log(password_from_database);
            if (password_from_database === password) {
              const token = uuid();
              console.log(token);
              token_storage[token] = user_name;
              count = Number(req.cookies.count);
              count++;
              res.cookie("count", count, { maxAge: 10000000 });
              res.cookie("login", token, { maxAge: 10000000 });
              res.send("Rätt lösenord");
            } else {
              res.send("fel lösenord!");
            }
          } else {
            res.send("Användaren hittades inte");
          }
        } else {
          res.send("Du har inte skrivit lösenord eller användarnamn");
        }
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Ett fel inträffade vid inloggningen.");
      }
    },
  );

  const port = 8080;

  app.listen(port, () => {
    console.log("You can find this server on: http://localhost:" + port);
  });
}

main();
