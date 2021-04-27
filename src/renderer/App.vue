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
							text='x-accel, <i>N</i>'
							color='red'
							type='arc'
							:val='dialax'
							:labels='["L", "", "R"]')
						vu-meter(
							text='y-accel, <i>N</i>'
							color='blue'
							type='arc'
							:val='dialay'
							:labels='["B", "", "F"]')
						vu-meter(
							text='z-accel, <i>N</i>'
							color='green'
							type='arc'
							:val='dialaz'
							:labels='["+2", "0", "-2"]')
					.d-flex.justify-content-around
						vu-meter(
							text='Pitch &omega; &deg;/sec'
							color='red'
							type='circle'
							:val='dialgx'
							:labels='["", "F", "", "B"]')
						vu-meter(
							text='Roll &omega; &deg;/sec'
							color='blue'
							type='circle'
							:val='dialgy'
							:labels='["", "R", "", "L"]')
						vu-meter(
							text='Yaw &omega; &deg;/sec'
							color='green'
							type='circle'
							:val='dialgz'
							:labels='["", "CW", "", "CCW"]')
			tr
				td.align-top.p-2
					.d-flex.flex-column
						h5 Motor Adjust
						.mb-2.text-monospace
							div Left&nbsp; &delta; = {{ dl.toFixed(3).padStart(8, "0") }}
							div Right &delta;      = {{ dr.toFixed(3).padStart(8, "0") }}
							div Front &delta;      = {{ df.toFixed(3).padStart(8, "0") }}
							div Back&nbsp; &delta; = {{ db.toFixed(3).padStart(8, "0") }}
						button.mb-2.btn.btn-sm.btn-secondary(@click='stabilize') Turn Stabilization {{ this.isStabilizing ? 'Off' : 'On' }}
				td.align-top.p-2
					h5 Front
					.d-flex.justify-content-center.align-items-stretch
						div
							vu-meter(
								text='Motor 4 Speed'
								color='black'
								type='circle'
								:val='(s4 / 1000) * Math.PI + Math.PI'
								:labels='["0%", "12.5%", "25%", "50%"]')
							vu-meter(
								text='Motor 3 Speed'
								color='black'
								type='circle'
								:val='(s3 / 1000) * Math.PI + Math.PI'
								:labels='["0%", "12.5%", "25%", "50%"]')
						div
							vu-meter(
								text='Motor 2 Speed'
								color='black'
								type='circle'
								:val='(s2 / 1000) * Math.PI + Math.PI'
								:labels='["0%", "12.5%", "25%", "50%"]')
							vu-meter(
								text='Motor 1 Speed'
								color='black'
								type='circle'
								:val='(s1 / 1000) * Math.PI + Math.PI'
								:labels='["0%", "12.5%", "25%", "50%"]')
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
			dl: 0, dr: 0,
			df: 0, db: 0,
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
			dialax: 0,
			dialay: 0,
			dialaz: 0,
			dialgx: 0,
			dialgy: 0,
			dialgz: 0,
		};
	},
	components: {
		'vu-meter': VuMeter,
		'q-rotor': Rotor,
	},
	methods: {
		stop() {
			this.isStabilizing = false;
			this.target = 0;
			// recall 1 = 0 speed armed, 0 = disarmed
			framework.send(`sa ${this.target + 1}\n`);
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
			let K = 100; // aN/T
			/*
			let n1 = this.s1;
			let n2 = this.s2;
			let n3 = this.s3;
			let n4 = this.s4;
			*/
			// L FRNT R
			// E 4  2 I
			// F 3  1 G
			// T REAR H
			let n1 = this.target;
			let n2 = this.target;
			let n3 = this.target;
			let n4 = this.target;
			// ax < 0 = tilting left
			// ax > 0 = tilting right
			if (this.ax < 0) {
				this.db = -1 * (this.ax / K);
				n4 += this.db;
				n3 += this.db;
			} else {
				this.df = this.ax / K;
				n2 += this.df;
				n1 += this.df;
			}
			// ay < 0 = tilting backward
			// ay > 0 = tilting forward
			if (this.ay < 0) {
				this.dl = -1 * (this.ay / K);
				n1 += this.dl;
				n3 += this.dl;
			} else {
				this.dr = this.ay / K;
				n2 += this.dr;
				n4 += this.dr;
			}
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
			this.rawgy = parseInt(parts[4]) * -1; // match the GUI
			this.rawgz = parseInt(parts[5]) * -1; // match the GUI
			this.ax = this.rawax - this.calax;
			this.ay = this.raway - this.calay;
			this.az = this.rawaz - this.calaz;
			this.gx = this.rawgx - this.calgx;
			this.gy = this.rawgy + this.calgy; // match the GUI
			this.gz = this.rawgz + this.calgz; // match the GUI
			this.dialax = Math.PI * ((this.ax / 16384) / 4);
			this.dialay = Math.PI * ((this.ay / 16384) / 4);
			this.dialaz = Math.PI * ((this.az / 16384) / 4);
			this.dialgx = Math.PI * ((this.gx / 131) / 250);
			this.dialgy = Math.PI * ((this.gy / 131) / 250);
			this.dialgz = Math.PI * ((this.gz / 131) / 250);
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
