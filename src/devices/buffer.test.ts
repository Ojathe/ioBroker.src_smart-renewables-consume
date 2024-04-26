import { FourSensorsBuffer } from './buffer';
import { expect } from 'chai';

describe('FourSensorsBuffer', () => {
	it('throws error when sensors differ', () => {
		expect(() => new FourSensorsBuffer({ sensors: [] })).throws;
	});
});