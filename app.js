import "dotenv/config";
import path from "path";
import morgan from "morgan";
import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";

import "./migrate.js";

import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHanlder.js";
import Socket from "./services/Socket.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const { PORT } = process.env;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/media",       express.static(path.join(__dirname, "public/media")));
app.use("/css",    express.static(path.join(__dirname, "public/css")));
app.use("/js",     express.static(path.join(__dirname, "public/js")));

app.use(routes);

app.use(errorHandler.notFound);
app.use(errorHandler.errors);

const server = createServer(app);

await Socket.init(server);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});