import { calculateAverageValue } from './math';
import { expect } from 'chai';

describe('math', () => {
	describe('calculateAverageValue()', () => {
		it('should return 0 for empty list', () => {
			const result = calculateAverageValue([]);

			expect(result).not.to.be.undefined;
			expect(result.sum).to.eq(0);
			expect(result.count).to.eq(0);
			expect(result.avg).to.eq(0);
		});

		it('should calculate correctly', () => {
			const result = calculateAverageValue([
				{ ts: 1234, val: 2 },
				{ ts: 12345, val: 4 },
				{ ts: 12345, val: 6 },
			]);

			expect(result).not.to.be.undefined;
			expect(result.sum).to.eq(12);
			expect(result.count).to.eq(3);
			expect(result.avg).to.eq(4);
		});
	});
});