import React, { useEffect, useState } from "react";
import { Carousel, Col, Spinner } from "react-bootstrap";
import { database } from "../services/firebaseConfig";
import "./ImageCarousel.css";
import { ref, get, onValue } from "firebase/database";
import { format, parseISO, subDays, isValid } from "date-fns";

const fetchAllImages = async () => {
	try {
		const snapshot = await get(ref(database, "image_messages"));
		const dates = snapshot.val() || {};

		let allImages = [];
		// Loop through each date
		for (const date of Object.keys(dates)) {
			const imagesOfDate = dates[date];
			// Loop through each image entry under the date
			for (const key of Object.keys(imagesOfDate)) {
				const imageEntry = imagesOfDate[key];
				if (imageEntry) {
					allImages.push(imageEntry);
				}
			}
		}

		console.log("All images:", allImages);
		return allImages;
	} catch (error) {
		console.error("Error fetching images:", error);
		return [];
	}
};

const fetchImagesByDate = async (date) => {
	const snapshot = await get(ref(database, `image_messages/${date}`));
	const images = snapshot.val() || [];
	console.log("images by date: ", images);
	return Object.keys(images).map((key) => {
		return images[key];
	});
};

function ImageCarousel({ dayToShow }) {
	const [currentImages, setCurrentImages] = useState([]);
	const [allImages, setAllImages] = useState([]);
	const [allImagesLoaded, setAllImagesLoaded] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAllImagesAsync = async () => {
			const images = await fetchAllImages();
			setAllImages(images);
			setAllImagesLoaded(true);
		};

		fetchAllImagesAsync();
	}, []);

	useEffect(() => {
		if (!allImagesLoaded) return; // Only proceed if allImages has been fetched

		const fetchImages = async () => {
			const formattedDate = format(new Date(dayToShow), "yyyy-MM-dd");
			let images = await fetchImagesByDate(formattedDate);

			if (images.length === 0 && allImages.length > 0) {
				let shuffled = [...allImages].sort(() => 0.5 - Math.random());
				images = shuffled.slice(0, 10);
			}

			setCurrentImages(images);
			setLoading(false); // End loading
		};

		fetchImages();

		const formattedDate = format(
			new Date(dayToShow),
			"yyyy-MM-dd-HH-mm-ss"
		);

		const imagesRef = ref(database, `image_messages/${formattedDate}`);
		const unsubscribe = onValue(imagesRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const newImages = Object.values(data).map((img) => ({
					content: img.content,
					from: img.from,
				}));
				setCurrentImages(newImages);
			} else {
				setCurrentImages([]);
			}
		});

		return () => unsubscribe();
	}, [allImagesLoaded, allImages, dayToShow]);

	return (
		<div className="carousel-container">
			{loading ? (
				<div className="loading-spinner">
					<Spinner animation="border" className="spinner-border" />
				</div>
			) : (
				<Carousel>
					{currentImages.map((img, index) => (
						<Carousel.Item
							key={index}
							className="photo-area carousel-item"
						>
							<Col className="align-items-center d-flex flex-column">
								<img
									className="d-block custom-image"
									src={img.content}
									alt={`Slide ${index}`}
								/>
							</Col>
						</Carousel.Item>
					))}
				</Carousel>
			)}
		</div>
	);
}

export default ImageCarousel;
