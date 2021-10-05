export interface DateInfo {
	year: number
	month: number
	date: number
	days: number
	isLeapYear: boolean
}

export interface TimeFrame {
	start: number
	end: number
	inSeconds?: boolean
}

export type Granularity = 'day' | 'week' | 'month' | 'year'

export enum FlowUpdateType {
	Created = 0,
	Updated = 1,
	Deleted = 2
}

export interface FlowUpdate {
	flowId: string
	timestamp: number
	flowRate: string
	oldFlowRate: string
	type: FlowUpdateType
	sender: string
	recipient: string
	transactionHash: string
	token: string
}

export interface FlowStateParams {
	timeFrame: TimeFrame
	flowUpdates: Array<FlowUpdate>
	granularity?: Granularity
}

export interface FlowState {
	flowId: string
	updates: Array<number>
	amount: string
	sender: string
	recipient: string
	transactionHash: string
	token: string
}
