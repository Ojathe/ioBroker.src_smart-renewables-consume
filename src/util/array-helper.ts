export const sortBy = <T>(array: T[], direction: 'asc' | 'desc', selector: (obj: T) => number): T[] => {
	return [...array].sort((a, b) => {
		if (selector(a) < selector(b)) {
			return direction == 'asc' ? -1 : 1;
		}

		if (selector(a) > selector(b)) {
			return direction == 'asc' ? 1 : -1;
		}

		return 0;
	});
};