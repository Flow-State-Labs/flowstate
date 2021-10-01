export enum SecondsIn {
	Hour = 3600,
	Day = 86400,
	Week = 604800
	// Month varies
	// Year varies
}

export const millisecondToSecond = (timestamp: number) =>
	Math.floor(timestamp / 1000)

export const secondToMillisecond = (timestamp: number) => timestamp * 1000

// Date.getMonth() returns 0 to 11
export const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
