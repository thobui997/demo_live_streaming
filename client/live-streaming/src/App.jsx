import { useEffect } from "react";
import "./App.css";

function App() {
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:3000");

		let mediaRecorder;

		ws.addEventListener("open", (e) => {
			console.log("websocket open", e);
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((stream) => {
					mediaRecorder = new MediaRecorder(stream);

					mediaRecorder.start(1000);

					mediaRecorder.ondataavailable = (e) => {
						ws.send(e.data);
					};
				})
				.catch((err) => {
					console.error(`The following error occurred: ${err}`);
				});
		});

		ws.addEventListener("close", (e) => {
			console.log("websocket closed", e);
		});
	}, []);
	return <h1>Live stream audio from browser to icecast server</h1>;
}

export default App;
