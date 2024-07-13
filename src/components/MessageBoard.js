import React, { useEffect, useState } from "react";
import { ListGroup, Col } from "react-bootstrap";
import { database } from "../services/firebaseConfig";
import axios from "axios";
import { get } from "firebase/database";
import "./MessageBoard.css";
import { ref, onValue } from "firebase/database";
import { format } from "date-fns";

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

const fetchWeather = async () => {
	console.log("fetch weather");
	const apiKey = "79ef97332637a272cb1060b0ac033fb0";
	const city = "Taipei"; // 城市名稱
	const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=zh_tw`;

	try {
		const response = await axios.get(url);
		const weatherData = response.data;
		console.log(
			`今日天氣：${weatherData.weather[0].description}，氣溫：${weatherData.main.temp}°C`
		);
		return `今日天氣：${weatherData.weather[0].description}，氣溫：${weatherData.main.temp}°C`;
	} catch (error) {
		console.error("Error fetching weather data:", error);
		return "無法獲取天氣資訊";
	}
};

function MessageBoard({ dayToShow }) {
	const [currentMessages, setCurrentMessages] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isVisible, setIsVisible] = useState(true);
	const [textMessages, setTextMessages] = useState([]);
	const [weather, setWeather] = useState("");

	useEffect(() => {
		const updateMessages = () => {
			if (textMessages.length === 0) return;
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
		const fetchMessages = async () => {
			const formattedDate = format(new Date(dayToShow), "yyyy-MM-dd");
			const messages = await fetchTextByDate(formattedDate);
			setTextMessages(messages);
			setCurrentMessages(messages.length > 0 ? [messages[0]] : []);
			setCurrentIndex(messages.length > 1 ? 1 : 0);

			if (messages.length === 0) {
				const weatherInfo = await fetchWeather();
				setWeather(weatherInfo);
			} else {
				setWeather("");
			}
		};

		fetchMessages();

		const formattedDate = format(new Date(dayToShow), "yyyy-MM-dd");

		const messagesRef = ref(database, `text_messages/${formattedDate}`);

		const unsubscribe = onValue(messagesRef, async (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const newMessages = Object.values(data).map((msg) => ({
					content: msg.content,
					from: msg.from,
					from_name: msg.from_name,
				}));
				setTextMessages(newMessages);
				setCurrentMessages(
					newMessages.length > 0 ? [newMessages[0]] : []
				);
				setCurrentIndex(newMessages.length > 1 ? 1 : 0);
				setWeather("");
			} else {
				setTextMessages([]);
				setCurrentMessages([]);
				setCurrentIndex(0);
				const weatherInfo = await fetchWeather();
				setWeather(weatherInfo);
			}
		});

		return () => unsubscribe();
	}, [dayToShow]);

	return (
		<ListGroup className="message-board">
			{currentMessages.length > 0 ? (
				currentMessages.map(
					(message, index) =>
						message && ( // 確保 message 存在
							<ListGroup.Item
								key={index}
								className={`message ${
									isVisible ? "message-visible" : ""
								}`}
							>
								<Col className="align-items-center d-flex flex-column">
									<div>{message.content}</div>
								</Col>
							</ListGroup.Item>
						)
				)
			) : (
				<ListGroup.Item className="message message-visible">
					<Col className="align-items-center d-flex flex-column">
						<div>{weather}</div>
					</Col>
				</ListGroup.Item>
			)}
		</ListGroup>
	);
}

export default MessageBoard;
