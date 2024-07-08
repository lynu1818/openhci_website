import React, { useEffect, useState } from "react";
import { Carousel, Col } from "react-bootstrap";
import { database } from "../services/firebaseConfig";
import "./ImageCarousel.css";
import { ref, get, onValue } from "firebase/database";
import { set } from "date-fns/fp/set";
import { format, parseISO, subDays, isValid } from "date-fns";

const fetchAllImages = async () => {
	const snapshot = await get(ref(database, "image_messages"));
	const dates = snapshot.val() || [];

	let allImages = [];
	// Loop through each date
	Object.keys(dates).forEach((date) => {
		const imagesOfDate = dates[date];
		// Loop through each image entry under the date
		Object.keys(imagesOfDate).forEach((key) => {
			const imageContent = imagesOfDate[key].content;
			if (imageContent) {
				allImages.push(imageContent);
			}
		});
	});

	console.log("All images:", allImages);
	return allImages;
};

const fetchImagesByDate = async (date) => {
	const snapshot = await get(ref(database, `image_messages/${date}`));
	const images = snapshot.val() || [];
	console.log("images by date: ", images);
	return Object.keys(images).map((key) => {
		return images[key].content;
	});
};

function ImageCarousel() {
	const [images, setImages] = useState([]);
	const [today, setToday] = useState(new Date());
	const [torn, setTorn] = useState(false);

	useEffect(() => {
		const dateRef = ref(database, "date");
		const tornRef = ref(database, "torn");

		const unsubscribeDate = onValue(dateRef, (snapshot) => {
			const newDateStr = snapshot.val();
			if (newDateStr) {
				const newDate = parseISO(newDateStr);
				if (isValid(newDate)) {
					// 检查解析后的日期是否有效
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
			const loadImages = async () => {
				const fetchedImages = await fetchImagesByDate(formattedDate);
				setImages(fetchedImages);
			};
			loadImages();
		}
	}, [torn, today]);

	return (
		<Carousel>
			{images.map((img, index) => (
				<Carousel.Item key={index} className="photo-area carousel-item">
					<Col className="align-items-center d-flex flex-column">
						<img
							className="d-block custom-image"
							src={img}
							alt={`Slide ${index}`}
						/>
					</Col>
				</Carousel.Item>
			))}
		</Carousel>
	);
}

export default ImageCarousel;
