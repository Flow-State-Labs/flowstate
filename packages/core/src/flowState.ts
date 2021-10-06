import { generateIntervals } from './generateIntervals'
import { FlowUpdateType, FlowUpdate, FlowStateParams, FlowState } from './types'
import BN from 'bn.js'

export function getFlowState({
	timeFrame,
	flowUpdates,
	granularity = 'day'
}: FlowStateParams): Array<FlowState> {
	// ALWAYS returns intervals in seconds
	const intervals = generateIntervals(timeFrame, granularity)
	let flowState: Array<FlowState> = []
	// loop the intervals
	console.log('flowState start')
	for (let index = 0; index < intervals.length - 1; ++index) {
		const intervalFlowState = getIntervalFlowState({
			timeFrame: {
				start: intervals[index],
				end: intervals[index] + 1
			},
			flowUpdates
		})
		flowState = flowState.concat(intervalFlowState)
	}
	return flowState
}

export function getIntervalFlowState({
	timeFrame,
	flowUpdates
}: FlowStateParams): Array<FlowState> {
	const { start, end } = timeFrame

	// loop flowUpdates to split:
	// beginning of arr to startTime, startTime to endTime
	console.log('split')
	let startIndex, endIndex, iterator
	for (iterator = 0; iterator < flowUpdates.length; ++iterator) {
		if (flowUpdates[iterator].timestamp >= start) {
			// last index before startTime
			startIndex = iterator - 1
		} else if (flowUpdates[iterator].timestamp >= end) {
			// last index before endTime
			endIndex = iterator - 1
		}
	}
	const flowUpdatesBeforeStart = flowUpdates.slice(0, startIndex)
	const flowUpdatesStartToEnd = flowUpdates.slice(startIndex, endIndex)

	// flowUpdates without a closing update
	let openFlows: Array<FlowUpdate> = []

	// loop flowUpdates to find flows opened and updated but NOT closed before start
	console.log('before')
	for (const flowUpdate of flowUpdatesBeforeStart) {
		switch (flowUpdate.type) {
			case FlowUpdateType.Created:
				openFlows.push(flowUpdate)
				break
			case FlowUpdateType.Updated:
				const updateIndex = openFlows.findIndex(
					flow => flow.flowId === flowUpdate.flowId
				)
				openFlows[updateIndex] = flowUpdate
				break
			case FlowUpdateType.Deleted:
				const deleteIndex = openFlows.findIndex(
					flow => flow.flowId === flowUpdate.flowId
				)
				openFlows.splice(deleteIndex, 1)
				break
			default:
				throw Error(`Unexpected flowUpdate type: ${flowUpdate.type}`)
		}
	}

	// loop openFlows to push open flows to the flowState before looping
	console.log('open -> flowState')
	let flowState: Array<FlowState> = openFlows.map(openFlow => ({
		flowId: openFlow.flowId,
		updates: [openFlow.timestamp],
		amount: '0',
		sender: openFlow.sender,
		recipient: openFlow.recipient,
		transactionHash: openFlow.transactionHash,
		token: openFlow.token
	}))

	// loop flowUpdates to handle events throughout the timeFrame
	console.log('during')
	for (const flowUpdate of flowUpdatesStartToEnd) {
		const flowStateIndex = flowState.findIndex(
			flow => flow.flowId === flowUpdate.flowId
		)
		switch (flowUpdate.type) {
			case FlowUpdateType.Created:
				if (flowStateIndex !== -1) {
					flowState.push({
						flowId: flowUpdate.flowId,
						updates: [flowUpdate.timestamp],
						amount: '0',
						sender: flowUpdate.sender,
						recipient: flowUpdate.recipient,
						transactionHash: flowUpdate.transactionHash,
						token: flowUpdate.token
					})
					openFlows.push(flowUpdate)
				}
				break
			case FlowUpdateType.Updated:
				const openFlowIndex = openFlows.findIndex(
					flow => flow.flowId === flowUpdate.flowId
				)
				if (flowStateIndex === -1)
					throw Error(
						`flow update called on non existent flow: ${flowUpdate.flowId}, ${flowUpdate.timestamp}`
					)
				// code block due to naming collisions between update and delete
				{
					// amount += lastSum + oldFlowRate * (timestamp - lastTimestamp)
					const { amount: lastSum, updates: lastUpdates } =
						flowState[flowStateIndex]
					const lastTimestamp = lastUpdates[lastUpdates.length - 1]
					const streamedSinceLastUpdate = new BN(
						flowUpdate.oldFlowRate
					).mul(new BN(flowUpdate.timestamp - lastTimestamp))
					// calculate updates
					const amount = new BN(lastSum)
						.add(streamedSinceLastUpdate)
						.toString()
					const updates = [...lastUpdates, flowUpdate.timestamp]
					// update amount and updates on the flowState object
					Object.assign(flowState[flowStateIndex], {
						amount,
						updates
					})
					// on update, update openFlows to latest flowUpdate
					// this is for a loop over openFlows
					openFlows[openFlowIndex] = flowUpdate
				}
				break

			case FlowUpdateType.Deleted:
				// code block due to naming collisions between update and delete
				{
					const openFlowIndex = openFlows.findIndex(
						flow => flow.flowId === flowUpdate.flowId
					)
					if (flowStateIndex === -1)
						throw Error(
							`flow close called on non existent flow: ${flowUpdate.flowId}, ${flowUpdate.timestamp}`
						)
					// amount += lastSum + oldFlowRate * (timestamp - lastTimestamp)
					const { amount: lastSum, updates: lastUpdates } =
						flowState[flowStateIndex]
					const lastTimestamp = lastUpdates[lastUpdates.length - 1]
					const streamedSinceLastUpdate = new BN(
						flowUpdate.oldFlowRate
					).mul(new BN(flowUpdate.timestamp - lastTimestamp))
					// calculate updates
					const amount = new BN(lastSum)
						.add(streamedSinceLastUpdate)
						.toString()
					const updates = [...lastUpdates, flowUpdate.timestamp]
					Object.assign(flowState[flowStateIndex], {
						amount,
						updates
					})
					// on delete, delete flowUpdate from openFlows
					// this is for a loop over openFlows
					openFlows.splice(openFlowIndex, 1)
				}
				break
			default:
				throw Error(`Unexpected flowUpdate type: ${flowUpdate.type}`)
		}
	}

	// final pass over flows not closed before the end of the day
	console.log('finishing up')
	for (const openFlow of openFlows) {
		const flowStateIndex = flowState.findIndex(
			flow => flow.flowId === openFlow.flowId
		)
		if (flowStateIndex === -1)
			throw Error(`flow not found ${openFlow.flowId}`)
		if (
			flowState[flowStateIndex].updates.length === 1 &&
			flowState[flowStateIndex].updates[0] < start
		) {
			// open before day, not updated during day
			// get total of day, update flowState element
			const amount = new BN(openFlow.flowRate)
				.mul(new BN(end - start))
				.toString()
			Object.assign(flowState[flowStateIndex], {
				amount
			})
		} else {
			const { updates: lastUpdates, amount: lastAmount } =
				flowState[flowStateIndex]
			const updates = [...lastUpdates, end]
			const amount = new BN(lastAmount)
				.add(
					new BN(openFlow.flowRate).mul(
						new BN(end - openFlow.timestamp)
					)
				)
				.toString()
			Object.assign(flowState[flowStateIndex], {
				updates,
				amount
			})
		}
	}

	console.log('done')
	return flowState
}
