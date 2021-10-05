export interface QueryFlowUpate {
	id: string
	transactionHash: string
	timestamp: string
	blockNumber: string
	superTokenAddress: string
	sender: string
	recipient: string
	flowRate: string
	oldFlowRate: string
	type: number
	flow: {
		id: string
	}
}

export interface QueryData {
	flowUpdates: Array<QueryFlowUpate>
}
