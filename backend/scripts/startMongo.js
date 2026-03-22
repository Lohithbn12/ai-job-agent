"use strict";

const { spawn } = require("child_process");

const MONGOD = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
const DBPATH = "C:\\data\\db";

const proc = spawn(MONGOD, ["--dbpath", DBPATH], { stdio: "inherit" });

proc.on("error", (err) => {
  console.error("[MongoDB] Failed to start:", err.message);
  process.exit(1);
});

proc.on("exit", (code) => {
  process.exit(code ?? 0);
});