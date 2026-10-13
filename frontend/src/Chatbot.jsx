import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Chatbot.css";

const CHAT_URL = "http://localhost:8080/api/chat";
const suggestedQuestions = [
	"What events are coming up?",
	"Show me upcoming workshops",
	"How do I get my QR ticket?",
	"How is attendance recorded?",
];

function Chatbot() {
	const navigate = useNavigate();
	const token = localStorage.getItem("Token");
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			text: "Hi, I can help you find college events and explain registration, QR tickets, and attendance.",
		},
	]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const messageListRef = useRef(null);

	useEffect(() => {
		if (!token) navigate("/");
	}, [navigate, token]);

	useEffect(() => {
		messageListRef.current?.scrollTo({
			top: messageListRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, loading]);

	async function sendMessage(text = message) {
		const cleanMessage = text.trim();
		if (!cleanMessage || loading) return;

		setError("");
		setMessage("");
		setMessages((current) => [
			...current,
			{ role: "user", text: cleanMessage },
		]);
		setLoading(true);

		try {
			const response = await axios.post(
				CHAT_URL,
				{ message: cleanMessage },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			const answer = response.data?.answer?.trim();

			if (!answer) {
				setError("The assistant returned an empty response. Please try again.");
				return;
			}

			setMessages((current) => [
				...current,
				{ role: "assistant", text: answer },
			]);
		} catch (requestError) {
			const status = requestError.response?.status;

			if (status === 401) {
				localStorage.removeItem("Token");
				setError("Your session has expired. Please log in again.");
				navigate("/");
			} else if (status === 403) {
				setError("Access was denied. Restart the backend, then sign out and sign in again to refresh your session.");
			} else if (status === 503) {
				setError(requestError.response?.data?.answer || "The assistant is temporarily unavailable. Please try again later.");
			} else if (status >= 500) {
				setError("The server could not answer right now. Please try again.");
			} else if (!requestError.response) {
				setError("Cannot reach the backend. Check that the server is running.");
			} else {
				setError("Your message could not be sent. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	}

	function handleSubmit(event) {
		event.preventDefault();
		sendMessage();
	}

	return (
		<main className="chat-page">
			<header className="chat-header">
				<Link className="chat-brand" to="/dashboard" aria-label="CampusConnect dashboard">
					<span className="chat-brand-mark" aria-hidden="true">C</span>
					<span>CampusConnect</span>
				</Link>
				<Link className="chat-back-link" to="/dashboard">Events</Link>
			</header>

			<section className="chat-shell" aria-label="CampusConnect event assistant">
				<div className="chat-titlebar">
					<div>
						<p className="chat-eyebrow">CAMPUS / CONNECT</p>
						<h1>Event assistant</h1>
						<p className="chat-subtitle">Grounded in events currently listed on campus.</p>
					</div>
					<span className="chat-status"><span /> Online</span>
				</div>

				<div className="chat-messages" ref={messageListRef} aria-live="polite" aria-relevant="additions">
					{messages.map((entry, index) => (
						<article className={`chat-message chat-message-${entry.role}`} key={`${entry.role}-${index}`}>
							<span className="chat-avatar" aria-hidden="true">
								{entry.role === "assistant" ? "C" : "You"}
							</span>
							<p>{entry.text}</p>
						</article>
					))}
					{loading && (
						<div className="chat-message chat-message-assistant" role="status" aria-label="Assistant is responding">
							<span className="chat-avatar" aria-hidden="true">C</span>
							<span className="chat-typing"><i /><i /><i /></span>
						</div>
					)}
				</div>

				{messages.length === 1 && (
					<div className="chat-suggestions" aria-label="Suggested questions">
						{suggestedQuestions.map((question) => (
							<button key={question} type="button" disabled={loading} onClick={() => sendMessage(question)}>
								{question}
							</button>
						))}
					</div>
				)}

				{error && <p className="chat-error" role="alert">{error}</p>}

				<form className="chat-composer" onSubmit={handleSubmit}>
					<label className="visually-hidden" htmlFor="chat-message">Ask about college events</label>
					<textarea
						id="chat-message"
						value={message}
						maxLength={2000}
						rows={1}
						placeholder="Ask about events, tickets, or attendance..."
						onChange={(event) => setMessage(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								handleSubmit(event);
							}
						}}
					/>
					<span className="chat-character-count">{message.length}/2000</span>
					<button type="submit" disabled={loading || !message.trim()}>
						{loading ? "Sending..." : "Send"}
					</button>
				</form>
			</section>
		</main>
	);
}

export default Chatbot;
