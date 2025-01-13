
function getFibonacci(N: number): number {
    
    if (N === null || N === undefined || !Number.isInteger(N)) {
        throw new Error("N must be an integer");
    }

    if (N <= 0) {
        throw new Error("N cannot be smaller than 1");
    }

    if (N > 9999) {
        throw new Error("N too large. Should be smaller than 10000");
    }
	
    if(N === 1)
        return 0;

    if(N === 2)
        return 1;

    return getFibonacci(N - 2) + getFibonacci(N - 1);
}

console.log(getFibonacci(7));