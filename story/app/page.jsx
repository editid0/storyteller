'use client';

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { use, useEffect, useRef, useState } from "react";

function round(num, precision = 2) {
	return Math.round((num + Number.EPSILON) * 10 ** precision) / 10 ** precision;
}

export default function Chat() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [processing, setProcessing] = useState(false);
	const [waitingTime, setWaitingTime] = useState(0);
	const containerRef = useRef(null);
	const { resolvedTheme } = useTheme();
	const [themeReady, setThemeReady] = useState(false);

	useEffect(() => {
		setThemeReady(true);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			container.lastChild?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (processing) {
				setWaitingTime((prev) => prev + 0.01);
			}
		}, 10);
		return () => clearInterval(interval);
	}, [processing]);

	useEffect(() => {
		if (!processing) {
			// Select the input field when not processing
			const inputField = document.querySelector('input[type="text"]');
			if (inputField) {
				inputField.focus();
			}
		}
	}, [processing]); // Re-focus input when processing state changes

	function handleSubmit() {
		if (input.trim() === "") return;
		if (processing) return;
		if (messages.length >= 100) {
			setProcessing(true);
			return;
		};
		setProcessing(true);
		setWaitingTime(0);
		const newMessage = { role: "user", content: input };
		setMessages([...messages, newMessage]);
		setInput("");

		fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ messages: [...messages, newMessage] }),
		})
			.then((response) => response.json())
			.then((data) => {
				setMessages((prev) => [...prev, data]);
				setProcessing(false);
			})
			.catch((error) => console.error("Error:", error));
	}

	return (
		<div className="w-full h-screen flex flex-col items-center justify-center">
			<div
				className="max-w-[20cm] w-full max-h-[70%] h-full bg-muted rounded-lg shadow-lg"
				style={
					themeReady && resolvedTheme === "dark"
						? {
							backgroundImage:
								"url('https://ik.imagekit.io/bk01nkfyo/adrien-olichon-_GH9LwhlSO4-unsplash.jpg?updatedAt=1752442951203?tr=r-20')",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}
						: {
							backgroundImage:
								"url('https://ik.imagekit.io/bk01nkfyo/renato-trentin-4eWsCl8Bw7s-unsplash.jpg?updatedAt=1752442951349?tr=r-20')",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
			>
				<div className="w-full h-full flex flex-col gap-4 p-4 justify-between backdrop-blur-sm rounded-lg">
					<div className="flex flex-col gap-2 w-full overflow-y-auto" ref={containerRef}>
						{messages.length >= 1 ? messages.map((message, index) => (
							<div key={index} className="p-4 mr-2 bg-muted-foreground/20 backdrop-blur-md rounded-lg mb-2 border-2 border-muted-foreground/30">
								<p className="text-primary">{message.role === "user" ? "You: " : "AI: "}{message.content}</p>
							</div>
						)) : (
							<div className="p-4 mr-2 bg-muted-foreground/20 backdrop-blur-md rounded-lg mb-2 border-2 border-muted-foreground/30">
								<p className="text-primary">To start, simply enter a prompt to start the story with!</p>
							</div>
						)}
					</div>
					<div className="flex flex-col items-center">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={messages.length === 0 ? "Enter your story prompt here..." : messages.length >= 100 ? "Too many messages, please start a new story." : "Describe your changes..."}
							className="p-2 border border-muted-foreground bg-muted/50 backdrop-blur-md rounded-lg w-3/4 mb-4"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter" && !processing) {
									handleSubmit();
								}
							}}
							disabled={processing}
						/>
						<Button
							onClick={handleSubmit}
							disabled={processing}
							className={"w-3/4" + (processing ? " opacity-50 cursor-not-allowed" : "")}
						>
							{processing ? round(waitingTime) : "Send"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}