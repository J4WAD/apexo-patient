import React from "react";

export class BasicInfo extends React.Component<{
	name: string;
}> {
	render() {
		return <div>
			<h3>{this.props.name}</h3>
		</div>;
	}
}
