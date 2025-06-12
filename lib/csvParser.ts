export interface MoodData {
	type: string;
	severity: number;
	ISO_DateTime: string;
	notes: string;
	DateOnly: string;
	TimeOnly: string;
}

export const parseCsvData = (csvText: string): MoodData[] => {
	const lines = csvText.trim().split("\n");
	const headers = lines[0].split(",");

	return lines.slice(1).map((line) => {
		const values = line.split(",");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data: any = {};

		headers.forEach((header, index) => {
			data[header] = values[index] || "";
		});

		return {
			type: data.type,
			severity: parseInt(data.severity),
			ISO_DateTime: data.ISO_DateTime,
			notes: data.notes,
			DateOnly: data.DateOnly,
			TimeOnly: data.TimeOnly,
		};
	});
};

export const getDataDateRange = (
	data: MoodData[]
): { earliest: Date; latest: Date } => {
	if (data.length === 0) {
		const now = new Date();
		return { earliest: now, latest: now };
	}

	const dates = data
		.map((item) => new Date(item.ISO_DateTime))
		.filter((date) => !isNaN(date.getTime()));
	if (dates.length === 0) {
		const now = new Date();
		return { earliest: now, latest: now };
	}

	const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
	const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

	return { earliest, latest };
};

export const filterDataByTimeRange = (
	data: MoodData[],
	range: string,
	startDate?: Date,
	endDate?: Date
): MoodData[] => {
	if (range === "custom") {
		if (startDate && endDate) {
			const startOfDay = new Date(startDate);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(endDate);
			endOfDay.setHours(23, 59, 59, 999);

			return data.filter((item) => {
				const itemDate = new Date(item.ISO_DateTime);
				if (isNaN(itemDate.getTime())) return false;
				return itemDate >= startOfDay && itemDate <= endOfDay;
			});
		} else {
			return [];
		}
	}

	const { latest } = getDataDateRange(data);

	if (isNaN(latest.getTime())) {
		console.error("Invalid latest date found in data");
		return data;
	}

	let startDateRange: Date;
	let endDateRange: Date;

	switch (range) {
		case "today":
			startDateRange = new Date(latest);
			startDateRange.setHours(0, 0, 0, 0);

			endDateRange = new Date(latest);
			endDateRange.setHours(23, 59, 59, 999);
			break;

		case "lastWeek":
			startDateRange = new Date(latest);
			startDateRange.setDate(latest.getDate() - 6);
			startDateRange.setHours(0, 0, 0, 0);

			endDateRange = new Date(latest);
			endDateRange.setHours(23, 59, 59, 999);
			break;

		case "lastMonth":
			startDateRange = new Date(latest);
			startDateRange.setDate(latest.getDate() - 29);
			startDateRange.setHours(0, 0, 0, 0);

			endDateRange = new Date(latest);
			endDateRange.setHours(23, 59, 59, 999);
			break;

		default:
			return data;
	}

	console.log(
		`Filtering for ${range}: from ${startDateRange.toISOString()} to ${endDateRange.toISOString()}`
	);

	return data.filter((item) => {
		const itemDate = new Date(item.ISO_DateTime);
		if (isNaN(itemDate.getTime())) return false;
		return itemDate >= startDateRange && itemDate <= endDateRange;
	});
};

export const calculateAverage = (data: MoodData[], type: string): number => {
	const typeData = data.filter((item) => item.type === type);
	if (typeData.length === 0) return 0;

	const sum = typeData.reduce((acc, item) => acc + item.severity, 0);
	return Math.round((sum / typeData.length) * 10) / 10;
};

export const getDateRangeDescription = (
	range: string,
	data: MoodData[],
	startDate?: Date,
	endDate?: Date
): string => {
	if (range === "customRange") {
		if (startDate && endDate) {
			return `Showing data from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
		} else {
			return "Please select start and end dates to view data";
		}
	}

	if (data.length === 0) return "No data available";

	const { earliest, latest } = getDataDateRange(data);

	// Validate dates before using them
	if (isNaN(earliest.getTime()) || isNaN(latest.getTime())) {
		return "No valid data available";
	}

	const latestDate = latest.toLocaleDateString();

	switch (range) {
		case "lastDay":
			return `Showing data for ${latestDate}`;
		case "lastWeek":
			const weekStart = new Date(latest);
			weekStart.setDate(latest.getDate() - 6);
			if (isNaN(weekStart.getTime())) return "Invalid date range";
			return `Showing data from ${weekStart.toLocaleDateString()} to ${latestDate}`;
		case "lastMonth":
			const monthStart = new Date(latest);
			monthStart.setDate(latest.getDate() - 29);
			if (isNaN(monthStart.getTime())) return "Invalid date range";
			return `Showing data from ${monthStart.toLocaleDateString()} to ${latestDate}`;
		default:
			return `Showing all data from ${earliest.toLocaleDateString()} to ${latestDate}`;
	}
};
