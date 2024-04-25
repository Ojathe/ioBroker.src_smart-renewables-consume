export function calculateAverageValue(values: { val: number; ts: number }[]): {
	sum: number;
	count: number;
	avg: number;
} {
	const sum = round(values.map((item) => item.val).reduce((prev, curr) => prev + curr, 0));
	const count = values.length != 0 ? values.length : 0;
	const avg = round(sum / (count > 0 ? count : 1));

	return { sum, count, avg };
}


export function round(val: number): number {
	return Math.round(val * 100) / 100;
}