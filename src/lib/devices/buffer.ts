import { XidNumber } from '../values/xid';

export interface BufferConfig {
	sensors: Array<XidNumber>;
}

export interface Buffer {

}

export class FourSensorsBuffer implements Buffer {
	constructor(config: BufferConfig) {
		console.log(config);
	}
}
