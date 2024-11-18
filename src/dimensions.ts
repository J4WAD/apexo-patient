type ImageDimensions = {
	width: number;
	height: number;
};

export async function getImageDimensions(url: string): Promise<ImageDimensions> {
	// Fetch the first 16KB (enough for most formats' headers)
	const response = await fetch(url, {
		headers: { Range: "bytes=0-16383" },
	});

	if (!response.ok) {
		throw new Error("Failed to fetch image metadata");
	}

	const arrayBuffer = await response.arrayBuffer();
	const dataView = new DataView(arrayBuffer);

	// Determine the format from the header
	const format = detectFormat(dataView);

	if (!format) {
		throw new Error("Unsupported image format");
	}

	// Parse dimensions based on format
	switch (format) {
		case "JPEG":
			return parseJPEG(dataView);
		case "PNG":
			return parsePNG(dataView);
		case "GIF":
			return parseGIF(dataView);
		case "BMP":
			return parseBMP(dataView);
		case "WEBP":
			return parseWebP(dataView);
		default:
			throw new Error("Unsupported image format");
	}
}

// Detect image format based on magic numbers
function detectFormat(dataView: DataView) {
	const magicNumbers = [
		{ format: "JPEG", bytes: [0xff, 0xd8] }, // JPEG magic number
		{ format: "PNG", bytes: [0x89, 0x50, 0x4e, 0x47] }, // PNG magic number
		{ format: "GIF", bytes: [0x47, 0x49, 0x46] }, // GIF magic number
		{ format: "BMP", bytes: [0x42, 0x4d] }, // BMP magic number
		{ format: "WEBP", bytes: [0x52, 0x49, 0x46, 0x46] }, // WebP magic number
	];

	for (const { format, bytes } of magicNumbers) {
		const matches = bytes.every(
			(byte, index) => dataView.getUint8(index) === byte
		);
		if (matches) return format;
	}

	return null;
}

// Parsers for different formats
function parseJPEG(dataView: DataView) {
	let offset = 2; // Skip the JPEG header
	while (offset < dataView.byteLength) {
		if (dataView.getUint16(offset) === 0xffc0) {
			// SOF marker
			return {
				height: dataView.getUint16(offset + 5),
				width: dataView.getUint16(offset + 7),
			};
		}
		offset += 2 + dataView.getUint16(offset + 2);
	}
	throw new Error("Failed to extract dimensions from JPEG");
}

function parsePNG(dataView: DataView) {
	// IHDR chunk starts at byte 8 and is 25 bytes long
	if (dataView.getUint32(12, false) !== 0x49484452) {
		// 'IHDR' chunk
		throw new Error("Invalid PNG file");
	}
	return {
		width: dataView.getUint32(16, false),
		height: dataView.getUint32(20, false),
	};
}

function parseGIF(dataView: DataView) {
	// Logical Screen Descriptor starts at byte 6
	return {
		width: dataView.getUint16(6, true),
		height: dataView.getUint16(8, true),
	};
}

function parseBMP(dataView: DataView) {
	// DIB Header starts at byte 14
	return {
		width: dataView.getInt32(18, true),
		height: Math.abs(dataView.getInt32(22, true)), // BMP height can be negative
	};
}

function parseWebP(dataView: DataView) {
	// 'VP8 ' chunk starts at byte 12 for VP8-based WebP
	if (dataView.getUint32(12, true) !== 0x20585056) {
		// 'VP8 ' magic number
		throw new Error("Invalid WebP file");
	}
	return {
		width: dataView.getUint16(26) & 0x3fff, // 14 bits
		height: dataView.getUint16(28) & 0x3fff, // 14 bits
	};
}