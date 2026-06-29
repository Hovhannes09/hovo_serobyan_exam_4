import "dotenv/config";
import path from "path";
import morgan from "morgan";
import express from "express";
import { createServer } from "http";

import "./migrate.js";

const app = express();

const { PORT } = process.env;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
