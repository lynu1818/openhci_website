import "./App.css";
import { Container, Row, Col} from "react-bootstrap";
import ImageCarousel from "./components/ImageCarousel";
import MessageBoard from "./components/MessageBoard";
import { useState, useEffect } from "react";
import { ref, get, onValue } from "firebase/database";
import { database } from "./services/firebaseConfig";
import { format, parseISO, subDays } from "date-fns";
import { zhTW } from "date-fns/locale";
import styled from "styled-components";

function App() {
	const [today, setToday] = useState(new Date());
	const [dayToShow, setDayToShow] = useState(new Date());
	const [weekDay, setWeekDay] = useState("");
	const [torn, setTorn] = useState(false);
	const [data, setData] = useState({
		lunar_date: "",
		ganzhi: "",
		yi: [],
		ji: [],
		good_times: [],
		jieqi: "",
		sha: "",
	});

	const renderTexts = (texts) => {
		const chunks = [];
		let size = 1;

		if (typeof texts === "string") {
			texts = [texts];
		}

		if (texts.length > 1 && texts.length <= 4) size = 2;
		else if (texts.length > 4 && texts.length <= 6) size = 3;

		for (let i = 0; i < texts.length; i += size) {
			chunks.push(texts.slice(i, i + size));
		}

		return chunks.map((chunk, index) => (
			<Row key={index} className="w-100 text-row">
				{chunk.map((text, idx) => (
					<StyledCol
						key={idx}
						size={size}
						className="blue-text d-flex justify-content-center align-items-center p-0 m-0"
					>
						{text}
					</StyledCol>
				))}
			</Row>
		));
	};

	const StyledCol = styled(Col)`
		font-size: ${(props) =>
			props.size === 1 ? "16px" : props.size === 2 ? "16px" : "13px"};
		margin: 1px;
	`;

	useEffect(() => {
		const tornRef = ref(database, "torn");

		const fetchData = (date) => {
			const dataRef = ref(database, `date_info/${date}`);
			onValue(dataRef, (snapshot) => {
				const data = snapshot.val();
				if (data) {
					setData(data);
				}
			});
		};

		const updateDayToShow = (isTorn) => {
			const currentDate = format(today, "yyyy-MM-dd");
			const previousDate = format(subDays(today, 1), "yyyy-MM-dd");
			const dateToShow = isTorn ? today : subDays(today, 1);
			const dateString = isTorn ? currentDate : previousDate;
			fetchData(dateString);
			setDayToShow(dateToShow);
			const wd = format(dateToShow, "eeee", { locale: zhTW });
			setWeekDay(wd);
		};

		const unsubscribeTorn = onValue(tornRef, (snapshot) => {
			const isTorn = snapshot.val();
			setTorn(isTorn);
			updateDayToShow(isTorn);
		});

		return () => {
			unsubscribeTorn();
		};
	}, [today]);

	return (
		<Container className="p-3">
			<Row className="mb-3 align-items-center">
				<Col className="text-center">
					<ImageCarousel dayToShow={dayToShow}/>
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
								{format(dayToShow, "yyyy") - 1911}
							</span>
							<span className="year-text-label">年</span>
						</Col>
					</Row>
					<div className="chinese-year-text">歲次{data.ganzhi}</div>
					<div className="custom-box">
						<span className="custom-box-text">農小</span>
					</div>
					<Row className="text-center">
						<Col className="">
							<div className="vertical-text">
								{data.lunar_date}
							</div>
							{/* TODO: 改成動態*/}
						</Col>
					</Row>
				</Col>
				<Col md={6} className="text-center date-text-col">
					<div className="date-text">{format(dayToShow, "d")}</div>
				</Col>
				<Col md={3} className="text-right">
					<Row className="justify-content-end">
						<Col className="text-right">
							<span className="month-text">
								{format(dayToShow, "M")}
							</span>
							<span className="month-text-label">月</span>
						</Col>
					</Row>
					<div className="life-tips text-center">生活小叮嚀</div>
					<hr className="dashed-hr" />
					<MessageBoard dayToShow={dayToShow}/>
				</Col>
			</Row>
			<Row>
				<Col md={4} className="">
					<div className="box">
						<Row className="fixed-height-row">
							<Col
								md={9}
								className="d-flex flex-wrap p-4-left-right m-0 box-content order-md-1"
							>
								{renderTexts(
									data.ji.slice(
										0,
										Math.min(data.ji.length, 6)
									)
								)}
							</Col>
							<Col
								md={3}
								className="d-flex justify-content-center align-items-center blue-box top-right order-md-2"
							>
								<div className="text-white">不宜</div>
							</Col>
						</Row>
						<Row>
							<div class="center-line"></div>
						</Row>
						<Row className="fixed-height-row">
							<Col
								md={3}
								className="d-flex justify-content-center align-items-center blue-box bottom-left order-md-1"
							>
								<div className="text-white">宜</div>
							</Col>
							<Col className="d-flex flex-wrap p-4-right-left m-0 box-content order-md-2">
								{renderTexts(
									data.yi.slice(
										0,
										Math.min(data.yi.length, 6)
									)
								)}
							</Col>
						</Row>
					</div>
				</Col>
				<Col md={4} className="chinese-date bottom-middle text-center">
					<div className="chinese-date">{weekDay}</div>{" "}
				</Col>
				<Col md={4} className="align-items-end  d-flex flex-column">
					<div className="box">
						<Row className="fixed-height-row-left">
							<Col
								md={4}
								className="d-flex justify-content-center align-items-center blue-box-left top-left p-0 order-md-1"
							>
								<div className="text-white-sm">節氣</div>
							</Col>
							<Col className="d-flex flex-wrap p-left m-0 box-content">
								{renderTexts(
									data.jieqi.slice(
										0,
										Math.min(data.jieqi.length, 6)
									)
								)}
							</Col>
						</Row>
						<Row className="center-line-container">
							<Col md={4} className="center-line-left-up"></Col>
							<Col md={8} className="center-line-right-up"></Col>
						</Row>
						<Row className="fixed-height-row-left">
							<Col
								md={4}
								className="d-flex justify-content-center align-items-center blue-box-left middle-left p-0 order-md-1"
							>
								<div className="text-white-sm">吉時</div>
							</Col>
							<Col className="d-flex flex-wrap p-left m-0 box-content">
								{renderTexts(
									data.good_times.join(" ").slice(
										0,
										Math.min(data.good_times.join(" ").length, 7)
									)
								)}
							</Col>
						</Row>
						<Row className="center-line-container">
							<Col md={4} className="center-line-left-down"></Col>
							<Col
								md={8}
								className="center-line-right-down"
							></Col>
						</Row>
						<Row className="fixed-height-row-left">
							<Col
								md={4}
								className="d-flex justify-content-center align-items-center blue-box-left bottom-left"
							>
								<div className="text-white-sm">煞</div>
							</Col>
							<Col className="d-flex flex-wrap p-left m-0 box-content">
								{renderTexts(data.sha)}
							</Col>
						</Row>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default App;
