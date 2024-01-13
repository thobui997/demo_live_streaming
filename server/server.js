const childProcess = require("child_process");
const http = require("http");
const express = require("express");
const WebsocketServer = require("ws").Server;

const app = express();
const PORT = 3000;
const server = http.createServer(app).listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});

const wss = new WebsocketServer({ server });

// -b:a 32k -content_type application/ogg -f opus
wss.on("connection", (ws, rq) => {
	const ffmpegProcess = childProcess.spawn("ffmpeg", [
    "-i",
    "pipe:0", // Use pipe:0 to read from stdin
    "-b:a",
    "32k",
    "-ac",
    "1",
    "-vn",
    "-content_type",
    "application/ogg",
    "-f",
    "opus",
    "icecast://...",
]);

	ffmpegProcess.on("error", (err) => {
		console.log("FFMPEG CHILD PROCESS ERRR", err);
	});

	ffmpegProcess.on("close", (code, signal) => {
		console.log(`Ffmpeg child process closed code ${code}, signal ${signal}`);
		// ws.terminate();
	});

	ffmpegProcess.stdin.on("error", (err) => {
		console.log("FFMPEG STDIN ERROR", err);
	});

	ws.on("message", (data) => {
		console.log("DATA", data);
		ffmpegProcess.stdin.write(data);
	});

	ws.on("close", (e) => {
		ffmpegProcess.kill("SIGINT");
	});
});
