import "dotenv/config";
import path from "path";
import morgan from "morgan";
import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";

import "./migrate.js";

import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHanlder.js";

const app = express();

const { PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/media", express.static("media"));

app.use(routes);

app.use(errorHandler.notFound);
app.use(errorHandler.errors);

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});