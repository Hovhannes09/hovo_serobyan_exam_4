import "dotenv/config";
import path from "path";
import morgan from "morgan";
import express from "express";
import { createServer } from "http";

import "./migrate.js";

import errorHandler from "./middlewares/errorHanlder.js";

const app = express();

const { PORT } = process.env;

app.use(errorHandler.notFound);
app.use(errorHandler.errors);

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
