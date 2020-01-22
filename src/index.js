import Express from "express";
import bodyParser from "body-parser";
import http from 'http';

// import api from "./api";
import socket from './lib/socket';

const port = 8080;
const app = Express();
const server = http.createServer(app);

// json 파싱
app.use(bodyParser.json());
// utf8 등의 query string
app.use(bodyParser.urlencoded({ extended: false }));
// api route
// app.use("/api", api);
// static route
app.use(Express.static(__dirname + "/static"));

// ===== socket.io 초기화
socket.init(server);

server.listen(port, () => {
  console.log(`server listen ${port}`);
});
