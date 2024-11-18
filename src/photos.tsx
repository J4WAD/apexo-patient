import React from "react";
import { Photo, RowsPhotoAlbum } from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "react-photo-album/rows.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export class Photos extends React.Component<{ photos: Array<Photo> }> {
	index: number = -1;
	render() {
		return (
			<div>
				<RowsPhotoAlbum
					photos={this.props.photos}
					targetRowHeight={150}
					onClick={({ index }) => {
						this.index = index;
						this.setState({});
					}}
				/>

				<Lightbox
					slides={this.props.photos}
					open={this.index >= 0}
					index={this.index}
					close={() => {
						this.setState({});
						this.index = -1;
					}}
					plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
				/>
			</div>
		);
	}
}
