<template lang="pug">
html(lang='en')
	head
		meta(charset='utf-8')
		meta(name='viewport',content='width=device-width,initial-scale=1,shrink-to-fit=no')
		title Fucking fuck fuck ...
	body
		table#app
			tr
				td.align-top.p-2
					.d-flex.flex-column
						select.mb-2.custom-select(v-model='selectedPort' @change='choosePort')
							option(value=-1) --Select a serial port--
							option(v-for='port in ports' :value='port') {{ port }}
						button.mb-2.btn.btn-sm.btn-primary(@click='telemetry') Turn Telemetry {{ this.isTelemetry ? 'Off' : 'On' }}
						button.mb-2.btn.btn-sm.btn-primary(@click='record') Turn Recording {{ this.isRecording ? 'Off' : 'On' }}
						h5 Target
						.d-flex.mb-2.justify-content-center
							.form-inline
								button.btn.btn-sm.btn-primary(@click="saneg") &lt;
								input.form-control.form-control-sm(type="number" v-model='target' disabled).mx-2.text-center
								button.btn.btn-sm.btn-primary(@click="sapos") &gt;
						button.btn.btn-danger(style='height: 5rem;' @click="stop") STOP
				td.align-top.p-2
					.d-flex.justify-content-around
						vu-meter(
							text='x-accel, <i>g</i>'
							color='red'
							type='arc'
							:prec='1'
							:rval='ax'
							:val='Math.PI * ax / (4)'
							:labels='["L", "", "R"]')
						vu-meter(
							text='y-accel, <i>g</i>'
							color='blue'
							type='arc'
							:prec='1'
							:rval='ay'
							:val='Math.PI * ay / (4)'
							:labels='["B", "", "F"]')
						vu-meter(
							text='z-accel, <i>g</i>'
							color='green'
							type='arc'
							:prec='1'
							:rval='az'
							:val='Math.PI * az / (4)'
							:labels='["+2", "0", "-2"]')
					.d-flex.justify-content-around
						vu-meter(
							text='Pitch &omega; &deg;/sec'
							color='red'
							type='circle'
							:prec='0'
							:rval='gx'
							:val='(gx) * (Math.PI / 180)'
							:labels='["", "F", "", "B"]')
						vu-meter(
							text='Roll &omega; &deg;/sec'
							color='blue'
							type='circle'
							:prec='0'
							:rval='gy'
							:val='(gy) * (Math.PI / -180)'
							:labels='["", "R", "", "L"]')
						vu-meter(
							text='Yaw &omega; &deg;/sec'
							color='green'
							type='circle'
							:prec='0'
							:rval='gz'
							:val='(gz) * (Math.PI / -180)'
							:labels='["", "CW", "", "CCW"]')
			tr
				td.align-top.p-2
					.d-flex.flex-column
						h5 Motor Adjust
						.mb-2.text-monospace
							div &delta;1 = {{ d1.toFixed(3).padStart(8, " ") }}
							div &delta;2 = {{ d2.toFixed(3).padStart(8, " ") }}
							div &delta;3 = {{ d3.toFixed(3).padStart(8, " ") }}
							div &delta;4 = {{ d4.toFixed(3).padStart(8, " ") }}
						button.mb-2.btn.btn-sm.btn-secondary(@click='stabilize') Turn Stabilization {{ this.isStabilizing ? 'Off' : 'On' }}
						input.form-control.form-control-sm(type='number' v-model='K')
				td.align-top.p-2
					h5 Front
					.d-flex.justify-content-center.align-items-stretch
						div
							vu-meter(
								text='Motor 4 Speed'
								color='black'
								type='circle'
								:rval='s4 / 20'
								:val='(s4 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
							vu-meter(
								text='Motor 3 Speed'
								color='black'
								type='circle'
								:rval='s3 / 20'
								:val='(s3 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
						div
							vu-meter(
								text='Motor 2 Speed'
								color='black'
								type='circle'
								:rval='s2 / 20'
								:val='(s2 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
							vu-meter(
								text='Motor 1 Speed'
								color='black'
								type='circle'
								:rval='s1 / 20'
								:val='(s1 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
					h5 Rear

</template>

<script>
import VuMeter from './components/VuMeter';
import Rotor from './components/Rotor';
import { framework } from '../framework';
import 'bootstrap/dist/css/bootstrap.min.css';
import Filter from './filter';

const filter_ax = new Filter(10);
const filter_ay = new Filter(10);
const filter_az = new Filter(10);
/*
function pause(ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			return resolve();
		}, ms);
	});
}
*/
export default {
	name: 'app',
	data() {
		return {
			ports: [],
			selectedPort: -1,
			s1: 0, s2: 0, s3: 0, s4: 0,
			target: 0,
			d1: 0,
			d2: 0,
			d3: 0,
			d4: 0,
			isStabilizing: false,
			isBusy: false,
			isTelemetry: false,
			isRecording: false,
			rawax: 0,
			raway: 0,
			rawaz: 0,
			rawgx: 0,
			rawgy: 0,
			rawgz: 0,
			ax: 0,
			ay: 0,
			az: 0,
			gx: 0,
			gy: 0,
			gz: 0,
			calax: 890,
			calay: -566,
			calaz: (-16384+14649), // calibrate to 1g when flat
			calgx: -664,
			calgy: -248,
			calgz: 1107,
			K: 0.01,
		};
	},
	components: {
		'vu-meter': VuMeter,
		'q-rotor': Rotor,
	},
	methods: {
		stop() {
			// RACE CONDITION WITH COMPUTERESPONSE()
			this.isStabilizing = false;
			this.target = 0;
			framework.send(`sa ${this.target}\n`);
			framework.send(`sa ${this.target}\n`);
			framework.send(`sa ${this.target}\n`);
			framework.send(`sa ${this.target}\n`);
		},
		stabilize () {
			this.isStabilizing = !this.isStabilizing;
		},
		record () {
			this.isRecording = !this.isRecording;
			framework.send(`record ${this.isRecording ? '1' : '0'}`);
		},
		async telemetry () {
			console.log(this.rawax, this.raway, this.rawaz);
			console.log(this.rawgx, this.rawgy, this.rawgz);
			this.isTelemetry = !this.isTelemetry;
			await framework.sendAck(`t${this.isTelemetry ? '1' : '0'}\n`);
		},
		sapos() {
			this.target += 10;
			framework.send(`sa ${this.target}\n`);
		},
		saneg() {
			this.target -= 10;
			framework.send(`sa ${this.target}\n`);
		},
		choosePort () {
			framework.send(`start ${this.selectedPort}`);
		},
		async computeResponse () {
			if (this.isStabilizing == false) {
				this.db = this.df = this.dl = this.dr = 0;
				return;
			}
			// L FRNT R
			// E 4  2 I
			// F 3  1 G
			// T REAR H
			let n1 = this.target;
			let n2 = this.target;
			let n3 = this.target;
			let n4 = this.target;

			let d1 = 0, d2 = 0, d3 = 0, d4 = 0;


			let dx = Math.abs(this.gx) / this.K;
			let dy = Math.abs(this.gy) / this.K;
			// gy > 0 = tilting left
			// gy < 0 = tilting right
			if (this.gy > 0) {
				d1 -= dy / 2;
				d2 -= dy / 2;
				d3 += dy / 2;
				d4 += dy / 2;
			} else {
				d1 += dx / 2;
				d2 += dx / 2;
				d3 -= dx / 2;
				d4 -= dx / 2;
			}
			// gx < 0 = tilting backward
			// gx > 0 = tilting forward
			if (this.gx < 0) {
				d1 += dx / 2;
				d2 -= dx / 2;
				d3 += dx / 2;
				d4 -= dx / 2;
			} else {
				d1 -= dx / 2;
				d2 += dx / 2;
				d3 -= dx / 2;
				d4 += dx / 2;
			}

/*
			let dx = Math.abs(this.ax) / this.K;
			let day = Math.abs(this.ay) / this.K;
			// ax < 0 = tilting left
			// ax > 0 = tilting right
			if (this.ax < 0) {
				d1 -= dx / 2;
				d2 -= dx / 2;
				d3 += dx / 2;
				d4 += dx / 2;
			} else {
				d1 += dax / 2;
				d2 += dax / 2;
				d3 -= dax / 2;
				d4 -= dax / 2;
			}
			// ay < 0 = tilting backward
			// ay > 0 = tilting forward
			if (this.ay < 0) {
				d1 += day / 2;
				d2 -= day / 2;
				d3 += day / 2;
				d4 -= day / 2;
			} else {
				d1 -= day / 2;
				d2 += day / 2;
				d3 -= day / 2;
				d4 += day / 2;
			}
*/
			n1 = this.target + d1;
			n2 = this.target + d2;
			n3 = this.target + d3;
			n4 = this.target + d4;
			this.d1 = d1;
			this.d2 = d2;
			this.d3 = d3;
			this.d4 = d4;

			// RACE CONDITION with stop()
			await framework.sendAck(`s1 ${n1.toFixed(0)}\n`);
			await framework.sendAck(`s2 ${n2.toFixed(0)}\n`);
			await framework.sendAck(`s3 ${n3.toFixed(0)}\n`);
			await framework.sendAck(`s4 ${n4.toFixed(0)}\n`);
		}
	},
	mounted () {
		/* TODO: how do we know we don't have backpressure? */
		framework.on('coords', async (parts) => {
			this.rawax = filter_ax.add(parseInt(parts[0]));
			this.raway = filter_ay.add(parseInt(parts[1]));
			this.rawaz = filter_az.add(parseInt(parts[2]));
			this.rawgx = parseInt(parts[3]);
			this.rawgy = parseInt(parts[4]);
			this.rawgz = parseInt(parts[5]);
			// +32768=+2g,-32768=-2g; convert to single Gs
			this.ax = (this.rawax - this.calax) / (32768 / 2);
			this.ay = (this.raway - this.calay) / (32768 / 2);
			this.az = (this.rawaz - this.calaz) / (32768 / 2);
			// +32768=+250deg,-32768=-250deg; convert to single degree
			this.gx = (this.rawgx - this.calgx) / (32768 / 250);
			this.gy = (this.rawgy - this.calgy) / (32768 / 250);
			this.gz = (this.rawgz - this.calgz) / (32768 / 250);
			await this.computeResponse();
		});
		framework.on('speed', parts => {
			this.s1 = parseInt(parts[0]);
			this.s2 = parseInt(parts[1]);
			this.s3 = parseInt(parts[2]);
			this.s4 = parseInt(parts[3]);
		});
		framework.on('error', error => {
			console.error('toplevel framework error', error);
		});
		framework.on('port', port => {
			this.ports.push(port);
		});
		framework.init();
		framework.getPorts();
	}
};
</script>

<style>
	#app {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
	}
</style>
