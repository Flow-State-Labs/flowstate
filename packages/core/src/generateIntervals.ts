import {
	SecondsIn,
	millisecondToSecond,
	secondToMillisecond,
	daysInMonth
} from './time'
import type { DateInfo, Granularity, TimeFrame } from './types'

export function generateIntervals(
	timeFrame: TimeFrame,
	granularity: Granularity
): Array<number> {
	switch (granularity) {
		case 'day':
			return generateDayIntervals(timeFrame)
		case 'week':
			return generateWeekIntervals(timeFrame)
		case 'month':
			return generateMonthIntervals(timeFrame)
		case 'year':
			return generateYearIntervals(timeFrame)
	}
}

function generateDayIntervals(timeFrame: TimeFrame): Array<number> {
	const { inSeconds } = timeFrame
	// convert start and end to seconds
	const start = inSeconds
		? timeFrame.start
		: millisecondToSecond(timeFrame.start)
	const end = inSeconds ? timeFrame.end : millisecondToSecond(timeFrame.end)
	let intervals: Array<number> = []
	for (let date = start; date <= end; date += SecondsIn.Day) {
		intervals.push(date)
	}
	return intervals
}

function generateWeekIntervals(timeFrame: TimeFrame): Array<number> {
	const { inSeconds } = timeFrame
	// convert start and end to seconds
	const start = inSeconds
		? timeFrame.start
		: millisecondToSecond(timeFrame.start)
	const end = inSeconds ? timeFrame.end : millisecondToSecond(timeFrame.end)
	let intervals: Array<number> = []
	for (let date = start; date <= end; date += SecondsIn.Week) {
		// if date in seconds, push, else convert to seconds then push
		intervals.push(date)
	}
	return intervals
}

function generateMonthIntervals(timeFrame: TimeFrame): Array<number> {
	const { inSeconds } = timeFrame
	// convert start and end to milliseconds
	// Date object uses milliseconds
	// convert to seconds ONLY when pushing to interval array
	const start = inSeconds
		? secondToMillisecond(timeFrame.start)
		: timeFrame.start
	const end = inSeconds ? secondToMillisecond(timeFrame.end) : timeFrame.end
	let intervals: Array<number> = []
	let dateInfo = getDateInfo(start)
	let intervalIterator = secondToMillisecond(
		(dateInfo.days - dateInfo.date) * SecondsIn.Day
	)
	for (
		let dateIterator = start;
		dateIterator <= end;
		dateIterator += intervalIterator
	) {
		// get next dateInfo
		dateInfo = getDateInfo(dateIterator)
		// get next interval
		intervalIterator = secondToMillisecond(dateInfo.days * SecondsIn.Day)
		// convert date to seconds, then push
		intervals.push(millisecondToSecond(dateIterator))
	}

	return intervals
}

function generateYearIntervals(timeFrame: TimeFrame): Array<number> {
	const { inSeconds } = timeFrame
	const start = inSeconds
		? secondToMillisecond(timeFrame.start)
		: timeFrame.start
	const end = inSeconds ? secondToMillisecond(timeFrame.end) : timeFrame.end
	// convert start and end to milliseconds
	// Date object uses milliseconds
	// convert to seconds ONLY when pushing to interval array
	let intervals: Array<number> = []
	let dateInfo = getDateInfo(start)
	let intervalIterator = secondToMillisecond(
		(dateInfo.isLeapYear ? 366 : 365) * SecondsIn.Day
	)

	for (
		let dateIterator = start;
		dateIterator <= end;
		dateIterator += intervalIterator
	) {
		// get next dateInfo
		dateInfo = getDateInfo(dateIterator)
		// get next interval
		intervalIterator = secondToMillisecond(
			(dateInfo.isLeapYear ? 366 : 365) * SecondsIn.Day
		)
		// push date in seconds to intervals
		intervals.push(millisecondToSecond(dateIterator))
	}

	return intervals
}

function getDateInfo(timestamp: number): DateInfo {
	const timestampDate = new Date(timestamp)
	const year = timestampDate.getFullYear()
	const month = timestampDate.getMonth()
	const date = timestampDate.getDate()
	const isLeapYear = year % 4 === 0
	const days = month === 1 && isLeapYear ? 29 : daysInMonth[month]
	return { year, month, date, days, isLeapYear }
}
