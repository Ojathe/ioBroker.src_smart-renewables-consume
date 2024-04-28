import { Device } from './device';
import { ExtXidNumber } from '../values/extXId';

export interface BufferConfig {
	sensors: Array<ExtXidNumber>;
}

export interface Buffer extends Device {
	temperatures: Array<Promise<number>>;
	isCold: Promise<boolean>;
	isHot: Promise<boolean>;
}