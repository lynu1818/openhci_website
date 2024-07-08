import "./App.css";
import { Container, Row, Col, Carousel, Button } from "react-bootstrap";
import ImageCarousel from "./models/ImageCarousel";
import MessageBoard from "./models/MessageBoard";
import { useState, useEffect } from "react";
import { ref, get, onValue } from "firebase/database";
import { database } from "./services/firebaseConfig";
import { format, parseISO, subDays } from "date-fns";
import { zhTW } from "date-fns/locale";

const url = {
	"1-1": "",
	"1-2": "",
	"2-1": "",
	"2-2": "",
	"3-1": "",
	"3-2": "",
	"4-1": "",
	"4-2": "",
	"5-1": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F5-1.png?alt=media&token=a9d515d8-2cd0-4137-860c-e8a0a417200d",
	"5-2": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F5-2.png?alt=media&token=975e4b29-4e0e-4c15-af9c-d51e572d9de2",
	"6-1": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F6-1.png?alt=media&token=14a10ddd-0d36-4199-a946-e42b462a8c8c",
	"6-2": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F6-2.png?alt=media&token=abeb3a1a-6462-45ee-939a-00a815b1beae",
	"7-1": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F7-1.png?alt=media&token=71a19e1e-fe12-4e8e-9aa1-7f6f4ffdb878",
	"7-2": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F7-2.png?alt=media&token=dac71c83-edad-4927-9311-29373b4fada1",
	"8-1": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F8-1.png?alt=media&token=491eeb70-e007-4f48-ae61-73ad067b31aa",
	"8-2": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F8-2.png?alt=media&token=88a8d7cd-f6ed-48be-85b7-f27badaeca6a",
	"9-1": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F9-1.png?alt=media&token=13b9e067-95c9-4dcc-9552-8d080065401b",
	"9-2": "https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2F9-2.png?alt=media&token=56cdae03-9ad2-4b36-819e-ceddbf040a47",
};

const lunarDate = {
	1: "",
	2: "",
	3: "",
	4: "",
	5: "五月三十日",
	6: "六月初一",
	7: "六月初二",
	8: "六月初三",
	9: "六月初四",
	10: "六月初五",
	11: "六月初六",
	12: "六月初七",
};

function App() {
	const [today, setToday] = useState(new Date());
	const [weekDay, setWeekDay] = useState("");
	const [torn, setTorn] = useState(false);

	const lunarKey = torn ? format(today, "d") : format(subDays(today, 1), "d");

	const imageKeyLeft = torn
		? `${format(today, "d")}-1`
		: `${format(subDays(today, 1), "d")}-1`;
	const imageKeyRight = torn
		? `${format(today, "d")}-2`
		: `${format(subDays(today, 1), "d")}-2`;

	console.log("lunarKey: ", lunarKey);

	useEffect(() => {
		const dateRef = ref(database, "date");
		const tornRef = ref(database, "torn");

		const unsubscribeDate = onValue(dateRef, async (snapshot) => {
			const newDateStr =
				snapshot.val() || format(new Date(), "yyyy-MM-dd");
			const newDate = parseISO(newDateStr);
			setToday(newDate);
			const wd = torn
				? format(newDate, "eeee", { locale: zhTW })
				: format(subDays(newDate, 1), "eeee", { locale: zhTW });
			setWeekDay(wd); // 設置星期幾，使用繁體中文
			// TODO: 設置農曆日期
		});

		const unsubscribeTorn = onValue(tornRef, async (snapshot) => {
			setTorn(snapshot.val());
		});

		return () => {
			unsubscribeDate();
			unsubscribeTorn();
		};
	}, []);

	return (
		<Container className="p-3">
			<Row className="mb-3 align-items-center">
				<Col className="text-center">
					<ImageCarousel />
				</Col>
			</Row>
			<Row className="">
				<Col
					md={3}
					className="text-left align-items-start d-flex flex-column"
				>
					<Row className="d-flex align-items-start">
						<Col className="text-right">
							<span className="year-text">
								{torn
									? format(today, "yyyy") - 1911
									: format(subDays(today, 1), "yyyy") - 1911}
							</span>
							<span className="year-text-label">年</span>
						</Col>
					</Row>
					<div className="chinese-year-text">歲次甲辰</div>
					<div className="custom-box">
						<span className="custom-box-text">農小</span>
					</div>
					<Row className="text-center">
						<Col className="">
							<div className="vertical-text">
								{lunarDate[lunarKey]}
							</div>
							{/* TODO: 改成動態*/}
						</Col>
					</Row>
				</Col>
				<Col md={6} className="text-center date-text-col">
					<div className="date-text">
						{torn
							? format(today, "d")
							: format(subDays(today, 1), "d")}
					</div>
				</Col>
				<Col md={3} className="text-right">
					<Row className="justify-content-end">
						<Col className="text-right">
							<span className="month-text">
								{torn
									? format(today, "M")
									: format(subDays(today, 1), "M")}
							</span>
							<span className="month-text-label">月</span>
						</Col>
					</Row>
					<div className="life-tips text-center">生活小叮嚀</div>
					<hr className="dashed-hr" />
					<MessageBoard />
					{/* <Col className="d-flex flex-row justify-content-center align-items-center">
						<span className="text-center voice-reply-text">
							錄音回覆一下
						</span>
						<img
							className="d-block arrow-img"
							src="https://firebasestorage.googleapis.com/v0/b/openhci-880b9.appspot.com/o/default%2Farrow.png?alt=media&token=1a1fd111-72ab-40a5-b483-fff2211a28fa"
							alt="arrow"
						/>
					</Col> */}
				</Col>
			</Row>
			<Row>
				<Col md={4} className="">
					<img src={url[imageKeyLeft]} alt="left box" />
				</Col>
				<Col md={4} className="chinese-date bottom-middle text-center">
					<div className="chinese-date">
						{torn
							? format(today, "eeee", {
									locale: zhTW,
							  })
							: format(subDays(today, 1), "eeee", {
									locale: zhTW,
							  })}
					</div>{" "}
					{/* TODO: 改成動態*/}
				</Col>
				<Col md={4} className="align-items-end  d-flex flex-column">
					<img src={url[imageKeyRight]} alt="right box" />
				</Col>
			</Row>
		</Container>
	);
}

export default App;
