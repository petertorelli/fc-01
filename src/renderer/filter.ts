export default class Filter {
    private data: Array<number>;
    private position: number;
    private sum: number;
    private N: number;
    constructor (depth: number) {
        this.N = depth;
        this.data = Array<number>(this.N).fill(0);
        this.position = 0;
        this.sum = 0;
    }
    public add (point: number): number {
        this.sum -= this.data[this.position];
        this.data[this.position] = point / this.N;
        this.sum += this.data[this.position];
        this.position += 1;
        if (this.position >= this.N) {
            this.position = 0;
        }
        return this.sum;
    }
}
