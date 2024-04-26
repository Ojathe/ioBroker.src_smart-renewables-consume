import { XidNumber } from '../values/xid';

export interface Device {

}

export interface BufferConfig {
	sensors: Array<XidNumber>;
}

export interface Buffer extends Device {

}

export class FourSensorsBuffer implements Buffer {
	constructor(config: BufferConfig) {
		console.log(config);
	}
}
