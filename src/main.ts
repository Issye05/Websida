#!/usr/bin/env node
import express from "express";
import mysql from "mysql2/promise";
import crypto from "crypto";
import { v4 as uuid } from 'uuid';

async function main() {
  const app = express();

  app.use(logger);

  const db = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "Issye",
    database: "FotbollsLagDB",
  });

  app.get("/LagNamn", async function (req, res) {
    let question = "SELECT * FROM LagNamn;";
    console.log(question);
    const result = await db.execute(question);
    const data = result.values().next().value;
    console.log(data);
    res.send(data);
  });

  app.get("/input", async function (req, res) {
    const bmw_modeller = req.query.bmw_modeller;
    const LagNamn = "";
    const Ekonomi = 0;
    // const question = "SELECT * FROM LagNamn;";
    const question = "INSERT INTO msg VALUES (null, ?, ?, ?);";
    // console.log(question);
    const result = await db.execute(question, [LagNamn, Ekonomi]);
    // const data = result.values().next().value;
    res.send(bmw_modeller);
    // res.send("Hello!" + data[0].pris); visa Hello + pris
  });

  app.get("/login", async function (req, res) {
    if (
      req.query &&
      typeof req.query.user === "string" &&
      typeof req.query.password === "string"
    ) 
      const user_name = req.query.user;
      const password = crypto
        .createHash("md5")
        .update(String(req.query.password))
        .digest("hex");
      let question = 'SELECT name,password FROM user WHERE name =?';
      console.log(user_name);
      console.log(req.query.password);
      console.log(db.format(question, [user_name]));
      const user_answer = await db.execute(question, [user_name]);
      const password_from_database = user_answer.values().next().value[0].password;
      console.log(password_from_database);
      if (password_from_database === password) [
        const token = uuid();
        console.log(token);
        token_storage[token] = user_name;
        res.cookie('login', token, {maxAge: 10000000});
        res.send('Rätt lösenord');
        else {
          res.send('fel lösenord!');
        }
        else {
          res.send('Du har inte skrivit lössenord eller användarnamn')
        }
      ]
  });

  const port = 8080;

  app.listen(port, () => {
    console.log("You can find this server on: http://localhost:" + port);
  });
}

main();
