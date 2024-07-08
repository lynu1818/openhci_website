import React, { useEffect, useState } from "react";
import { ListGroup, Col } from "react-bootstrap";
import { database } from "../services/firebaseConfig";
import { get } from "firebase/database";
import "./MessageBoard.css";
import { ref, onValue } from "firebase/database";
import { format, parseISO, subDays, isValid } from "date-fns";

const fetchTextByDate = async (date) => {
	const snapshot = await get(ref(database, `text_messages/${date}`));
	const text = snapshot.val() || [];
	console.log("text by date: ", text);
	return Object.keys(text).map((key) => {
		return {
			content: text[key].content,
		};
	});
};

function MessageBoard() {
	const [currentMessages, setCurrentMessages] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isVisible, setIsVisible] = useState(true);

	const [textMessages, setTextMessages] = useState([]);
	const [today, setToday] = useState(new Date());
	const [torn, setTorn] = useState(false);

	useEffect(() => {
		const updateMessages = () => {
			setIsVisible(false);
			setTimeout(() => {
				setCurrentMessages([textMessages[currentIndex]]);
				setCurrentIndex((currentIndex + 1) % textMessages.length);
				setIsVisible(true);
			}, 1000);
		};

		const intervalId = setInterval(updateMessages, 4000);
		return () => clearInterval(intervalId);
	}, [currentIndex, textMessages]);

	useEffect(() => {
		const targetDate = torn ? today : subDays(today, 1);
		const formattedDate = format(targetDate, "yyyy-MM-dd");

		const messagesRef = ref(database, `text_messages/${formattedDate}`);
		const unsubscribe = onValue(messagesRef, (snapshot) => {
			const newMessage = {
				content: snapshot.val().content,
			};
			setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);
		});

		return () => unsubscribe();
	}, [torn, today]);

	useEffect(() => {
		const dateRef = ref(database, "date");
		const tornRef = ref(database, "torn");

		const unsubscribeDate = onValue(dateRef, (snapshot) => {
			const newDateStr = snapshot.val();
			if (newDateStr) {
				const newDate = parseISO(newDateStr);
				if (isValid(newDate)) {
					setToday(newDate);
				}
			}
		});

		const unsubscribeTorn = onValue(tornRef, (snapshot) => {
			setTorn(snapshot.val());
		});

		return () => {
			unsubscribeDate();
			unsubscribeTorn();
		};
	}, []);

	useEffect(() => {
		if (isValid(today)) {
			const targetDate = torn ? today : subDays(today, 1);
			const formattedDate = format(targetDate, "yyyy-MM-dd");
			const loadText = async () => {
				const fetchedText = await fetchTextByDate(formattedDate);
				setTextMessages(fetchedText);
				setCurrentIndex(0); // 重置索引
			};
			loadText();
		}
	}, [torn, today]);

	return (
		<ListGroup className="message-board">
			{currentMessages.map((message, index) => (
				<ListGroup.Item
					key={index}
					className={`message ${isVisible ? "message-visible" : ""}`}
				>
					<Col className="align-items-center d-flex flex-column">
						{message ? <div>{message.content}</div> : null}
					</Col>
				</ListGroup.Item>
			))}
		</ListGroup>
	);
}

export default MessageBoard;
