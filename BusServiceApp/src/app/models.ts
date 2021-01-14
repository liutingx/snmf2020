export interface NextBus {
    estimatedArrival: number,
    load: string,
    feature?: string,
    type: string
}
export interface BusArrivalByCode {
    busStopCode: number,
    serviceNo: string,
    operator: string,
    nextBus: NextBus,
    nextBus2: NextBus,
    arriving: boolean,
    timestamp: number
}

export interface Login {
	email: string,
	password: string
}

export interface NewUser {
    username: string,
    email: string,
	password: string
}

export interface BusService {
    serviceNo: string,
    bookmarked: boolean
}