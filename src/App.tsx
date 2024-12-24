import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./App.css";
import { BasicInfo } from "./basic";
import { Appointment, Appointments } from "./appointments";
import { Photos } from "./photos";
import type { Photo } from "react-photo-album";
import PocketBase from "pocketbase";
import { getImageDimensions, ImageDimensions } from "./dimensions";
import { decode } from "./base64";
class App extends React.Component<
	{},
	{
		patientID: string;
		patientName: string;
		server: string;
		appointments: Array<Appointment>;
		photos: Array<Photo>;
		loaded: boolean;
		phone: string;
		currency: string;
	}
> {
	constructor(props: any) {
		super(props);
		this.state = {
			patientID: "",
			patientName: "",
			server: "",
			appointments: [],
			photos: [],
			loaded: false,
			phone: "",
			currency: "",
		};
	}

	notFound() {
		this.setState({ loaded: true });
	}

	componentDidMount() {
		const code = window.location.pathname.split("/")[1];
		if (!code) return this.notFound();

		console.log(code);

		const decoded = decode(code);
		const patientID = decoded.split("|")[0];
		const patientName = decoded.split("|")[1];
		let server = decoded.split("|")[2];

		console.log(decoded);

		if (!patientID || !patientName || !server) return this.notFound();

		server = server.replace(/\/$/g, "");

		this.setState({
			patientID: patientID,
			patientName: patientName,
			server: server,
		});

		this.fetch(patientID, server);
	}

	async fetch(pid: string, server: string) {
		const pb = new PocketBase(server);
		const res = await pb
			.collection("public")
			.getList(1, 9999, { filter: `pid="${pid}"` });
		if (res.items.length === 0) return this.notFound();
		const appointments = res.items
			.map((item) => {
				return new Appointment(
					item.id,
					new Date(item.date * 60 * 1000 || ""),
					Number(item.price || ""),
					Number(item.paid || ""),
					item.prescriptions || []
				);
			})
			.sort((a, b) => {
				return a.date.getTime() - b.date.getTime();
			});

		const photos: Photo[] = await Promise.all(
			res.items
				.reduce(
					(arr, item) => [
						...arr,
						...(item.imgs as string[]).map(
							(photoName) =>
								`${this.state.server}/api/files/${res.items[0].collectionId}/${item.id}/${photoName}`
						),
					],
					[] as string[]
				)
				.map(async (url) => {
					let d: ImageDimensions = { width: 1000, height: 1000 };
					try {
						d = await getImageDimensions(url);
					} catch (_e) {}
					return { src: url, width: d.width, height: d.height };
				})
		);

		// finally .. let's get the settings

		const settings = await pb.collection("data").getFullList();
		const phone =
			settings.find((item) => item.id.startsWith("phone"))?.data?.value || "";
		const currency =
			settings.find((item) => item.id.startsWith("currency"))?.data?.value ||
			"";

		this.setState({ phone: phone });
		this.setState({ currency: currency });

		this.setState({ photos: photos });
		this.setState({ appointments: appointments });
		this.setState({ loaded: true });
	}

	render() {
		return (
			<div className="app">
				{this.state.loaded ? (
					<div>
						<BasicInfo name={this.state.patientName} />
						<Tabs>
							<TabList>
								<Tab>Appointments</Tab>
								<Tab>Photos</Tab>
							</TabList>
							<TabPanel>
								<Appointments
									currency={this.state.currency}
									appointments={this.state.appointments}
								/>
							</TabPanel>
							<TabPanel>
								<Photos photos={this.state.photos}></Photos>
							</TabPanel>
						</Tabs>
						<footer>
							<p>
								For information and booking please call:{" "}
								<a href={"tel:" + this.state.phone}>{this.state.phone}</a>
							</p>
							<i style={{ fontSize: 12 }}>Patient Viewer V1.3</i>
						</footer>
					</div>
				) : (
					<div>Loading data...</div>
				)}
			</div>
		);
	}
}

export default App;
