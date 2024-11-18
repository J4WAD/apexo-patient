import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

export class Appointment {
	id: string = "";
	date: Date = new Date();
	price: number = 0;
	paid: number = 0;
	prescriptions: Array<string> = [];
	constructor(
		id: string,
		date: Date,
		price: number,
		paid: number,
		prescriptions: Array<string>
	) {
		this.id = id;
		this.date = date;
		this.price = price;
		this.paid = paid;
		this.prescriptions = prescriptions;
	}

	get formattedDate() {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const month = months[this.date.getMonth()];
		const day = this.date.getDate();
		const year = this.date.getFullYear();
		const hours = this.date.getHours();
		const minutes = this.date.getMinutes();

		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const period = hours >= 12 ? "PM" : "AM";
		const formattedHours = hours % 12 || 12; // Convert to 12-hour format, and handle midnight as 12.

		return `${month} ${day} ${year} ${formattedHours}:${formattedMinutes} ${period}`;
	}
}

export class Appointments extends React.Component<{
	appointments: Array<Appointment>;
	currency: string;
}> {
	render() {
		return (
			<Table>
				<Thead>
					<Tr>
						<Th>No.</Th>
						<Th>Date</Th>
						<Th>Cost</Th>
						<Th>Paid</Th>
						<Th>Prescriptions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{this.props.appointments.map((appointment, index) => {
						return (
							<Tr key={appointment.id}>
								<Td style={{ padding: 4, backgroundColor: "rgba(0,0,0,0.1)" }}>
									{index + 1}
								</Td>
								<Td style={{ padding: 4, backgroundColor: "rgba(0,0,0,0.2)" }}>
									{appointment.formattedDate}
								</Td>
								<Td
									style={{ padding: 4, backgroundColor: "rgba(255,0,0,0.1)" }}
								>
									{appointment.price} {this.props.currency}
								</Td>
								<Td
									style={{ padding: 4, backgroundColor: "rgba(0,255,0,0.1)" }}
								>
									{appointment.paid} {this.props.currency}
								</Td>
								<Td
									style={{ padding: 4, backgroundColor: "rgba(0,0,255,0.2)" }}
								>
									<ul>
										{appointment.prescriptions.map((prescription) => {
											return <li>{prescription}</li>;
										})}
									</ul>
								</Td>
							</Tr>
						);
					})}
				</Tbody>
				<Tbody>
					<Td></Td>
					<Td></Td>
					<Td style={{ padding: 4, backgroundColor: "rgba(255,0,0,0.4)" }}>
						<b>Total cost</b>
						<br />
						<i>
							{this.props.appointments.reduce(
								(val, item) => val + Number(item.price),
								0
							)}{" "}
							{this.props.currency}
						</i>
					</Td>
					<Td style={{ padding: 4, backgroundColor: "rgba(0,255,0,0.4)" }}>
						<b>Total payments</b>
						<br />
						<i>
							{this.props.appointments.reduce(
								(val, item) => val + Number(item.paid),
								0
							)}{" "}
							{this.props.currency}
						</i>
					</Td>
				</Tbody>
			</Table>
		);
	}
}
