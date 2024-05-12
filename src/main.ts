import express from "express";
import mysql, { RowDataPacket } from "mysql2/promise";
import crypto from "crypto";
import { v4 as uuid } from "uuid";
import cookie from "cookie-parser";

async function main() {
  const app = express();

  app.get("/login");
  app.use(cookie());

  const db = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "Issye",
    database: "FotbollsLagDB",
  });

  app.get(
    "/login",
    async function (req: express.Request, res: express.Response) {
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
    },
  );

  const port = 8080;

  app.listen(port, () => {
    console.log("You can find this server on: http://localhost:" + port);
  });
}

main();
