/*
An experimental playground for testing quadrotor flight control.
Copyright (C) 2021 Peter J. Torelli <peter.j.torelli@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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
