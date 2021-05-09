<!--
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
-->
<template lang="pug">
html(lang='en')
	head
		meta(charset='utf-8')
		meta(name='viewport',content='width=device-width,initial-scale=1,shrink-to-fit=no')
		title Fucking fuck fuck ...
	body
		table#app
			tr
				td.align-top
					.d-flex.justify-content-around
						vu-meter(
							text='Pitch &omega; &deg;/sec'
							color='red'
							type='circle'
							:prec='3'
							:rval='gx'
							:val='(gx) * (Math.PI / 180)'
							:labels='["", "F", "", "B"]')
						vu-meter(
							text='Roll &omega; &deg;/sec'
							color='blue'
							type='circle'
							:prec='3'
							:rval='gy'
							:val='(gy) * (Math.PI / -180)'
							:labels='["", "R", "", "L"]')
						vu-meter(
							text='Yaw &omega; &deg;/sec'
							color='green'
							type='circle'
							:prec='3'
							:rval='gz'
							:val='(gz) * (Math.PI / -180)'
							:labels='["", "CW", "", "CCW"]')
					.d-flex.justify-content-around
						vu-meter(
							text='y-accel, <i>g</i>'
							color='blue'
							type='circle'
							:prec='3'
							:rval='ay'
							:val='Math.PI * ay / (4) * 5'
							:labels='["", "F", "", "B"]')
						vu-meter(
							text='x-accel, <i>g</i>'
							color='red'
							type='circle'
							:prec='3'
							:rval='ax'
							:val='Math.PI * ax / (4) * 5'
							:labels='["", "R", "", "L"]')
						vu-meter(
							text='z-accel, <i>g</i>'
							color='green'
							type='circle'
							:prec='3'
							:rval='az'
							:val='Math.PI * az / (4) * 5'
							:labels='["0", "+2", "", "-2"]')
				td.align-top
					.d-flex.justify-content-center.align-items-stretch
						div
							vu-meter(
								text='Motor 4 FL'
								color='black'
								type='circle'
								:rval='s4'
								:val='(s4 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
							vu-meter(
								text='Motor 3 RL'
								color='black'
								type='circle'
								:rval='s3'
								:val='(s3 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
						div
							vu-meter(
								text='Motor 2 FR'
								color='black'
								type='circle'
								:rval='s2'
								:val='(s2 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
							vu-meter(
								text='Motor 1 RR'
								color='black'
								type='circle'
								:rval='s1'
								:val='(s1 / 2000) * 2 * Math.PI + Math.PI'
								:labels='["50%", "75%", "0%", "25%"]')
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
								button.btn.btn-sm.btn-primary(@click="changeTarget(-10)") &lt;
								input.form-control.form-control-sm(type="number" v-model='target' disabled).mx-2.text-center
								button.btn.btn-sm.btn-primary(@click="changeTarget(+10)") &gt;
						button.btn.btn-danger(style='height: 5rem;' @click="stop") STOP
						small Trim 1
						input.form-control.form-control-sm.text-right(type='number' v-model='trim1')
						small Trim 2
						input.form-control.form-control-sm.text-right(type='number' v-model='trim2')
						small Trim 3
						input.form-control.form-control-sm.text-right(type='number' v-model='trim3')
						small Trim 4
						input.form-control.form-control-sm.text-right(type='number' v-model='trim4')

				td.align-top.p-2
					.d-flex.flex-column
						h5 Motor Adjust
						.mb-2.text-monospace
							div &delta;1 = {{ d1.toFixed(3).padStart(8, " ") }}
							div &delta;2 = {{ d2.toFixed(3).padStart(8, " ") }}
							div &delta;3 = {{ d3.toFixed(3).padStart(8, " ") }}
							div &delta;4 = {{ d4.toFixed(3).padStart(8, " ") }}
						button.mb-2.btn.btn-sm.btn-secondary(@click='stabilize') Turn Stabilization {{ this.isStabilizing ? 'Off' : 'On' }}
						input.form-control.form-control-sm(type='number' v-model='Kp')
						input.form-control.form-control-sm(type='number' v-model='Ki')
				td.align-top.p-2
					.d-flex.flex-column
						b Calibration
						small ax
						input.form-control.form-control-sm.text-right(type='number' v-model='calax')
						small ay
						input.form-control.form-control-sm.text-right(type='number' v-model='calay')
						small az
						input.form-control.form-control-sm.text-right(type='number' v-model='calaz')
						small gx (pitch)
						input.form-control.form-control-sm.text-right(type='number' v-model='calgx')
						small gy (roll)
						input.form-control.form-control-sm.text-right(type='number' v-model='calgy')
						small gz (yaw)
						input.form-control.form-control-sm.text-right(type='number' v-model='calgz')


</template>

<script>
import VuMeter from './components/VuMeter';
import Rotor from './components/Rotor';
import { framework } from '../framework';
import 'bootstrap/dist/css/bootstrap.min.css';
import Filter from './filter';

function CLIPCLAMP(v, n, x) {
	if (v > x) {
		return x;
	}
	if (v < n) {
		return n;
	}
	return v;
}
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
			Kp: 20,
			Ki: 0.0,
			trim1: 0,
			trim2: 0,
			trim3: 0,
			trim4: 0,

			phi_dot_integral: 0,
			theta_dot_integral: 0,
			ay_integral: 0,
			ax_integral: 0,

			d1: 0, d2: 0, d3: 0, d4: 0,

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
			framework.send(`sa 0 0 0 0\n`);
		},
		stabilize () {
			this.isStabilizing = !this.isStabilizing;
		},
		record () {
			this.isRecording = !this.isRecording;
			framework.send(`record ${this.isRecording ? '1' : '0'}`);
		},
		telemetry () {
			console.log(this.rawax, this.raway, this.rawaz);
			console.log(this.rawgx, this.rawgy, this.rawgz);
			this.isTelemetry = !this.isTelemetry;
			framework.send(`t${this.isTelemetry ? '1' : '0'}\n`);
		},
		changeTarget (val) {
			this.target = CLIPCLAMP(this.target + val, 0, 2000);
			let n1 = this.target + this.trim1 * 1;
			let n2 = this.target + this.trim2 * 1;
			let n3 = this.target + this.trim3 * 1;
			let n4 = this.target + this.trim4 * 1;
			framework.send(`sa ${n1} ${n2} ${n3} ${n4}\n`);
		},
		choosePort () {
			framework.send(`start ${this.selectedPort}`);
		},
		computeResponse () {
			if (this.isStabilizing == false) {
				this.db = this.df = this.dl = this.dr = 0;
				return;
			}

			/*
			The sensor on marvin isn't oriented to the NED (north, east, down)
			notation that you see in all the online docs.

			Our sensor is mounted (almost in the middle), use right hand rule

			x ; west is positive
			y ; south is positive
			z ; down is positive -- CORRECT!

			ugh.

			Motors are

			NORTH
			4   2
			3   1
			*/
			// Gyros have been converted to degrees/second
			// Accelerometers have been converted to Newtons
			// our sensor is read every 10ms (100hz), so dt = 0.010 sec.
			//let dt = 0.010;
			// Rename all our telemetry into standard NED/Euler
			// Gyroscopes report dynamic rotation, 0 when idle
			//let dyn_psi = this.gz * dt;
			//let dyn_psi_dit = this.gz;
			//let dyn_theta = this.gx * dt * -1;
			let dyn_theta_dot = this.gx * -1;
			//let dyn_phi = this.gy * dt * -1;
			let dyn_phi_dot = this.gy * -1;
			// Accellerometers can be static Eulers OR dynamic translation
			let ax = this.ay * -1;
			let ay = this.ax * -1;
			//let az = this.az;

			/* Goal is to have phi_dot=theta_dot=psi_dot=0; ax=ay=0; az=g */

			/* Ignoring YAW for now */

			/*
			What do you do when the phi and theta derviatives are zero but the
			quad is tilted so it drifts? Should it use AX/AY/AZ data?
			If az=g then the device is "sliding". If az<>g then it is tilted
			and translating... which are opposite corrections!
			Do I need a magnetometer?
			*/

			let m1_d = 0;
			let m2_d = 0;
			let m3_d = 0;
			let m4_d = 0;

			let Kp = this.Kp;
			let Ki = this.Ki;

			// maybe i'll play with PI... but P is doing ok...

			this.phi_dot_integral += dyn_phi_dot;
			this.theta_dot_integral += dyn_theta_dot;
			this.ax_integral += ax;
			this.ay_integral += ay;
			if (dyn_phi_dot > 0) {
				m1_d += dyn_phi_dot * Kp + this.phi_dot_integral * Ki;
				m2_d += dyn_phi_dot * Kp + this.phi_dot_integral * Ki;
			} else {
				m3_d -= dyn_phi_dot * Kp + this.phi_dot_integral * Ki;
				m4_d -= dyn_phi_dot * Kp + this.phi_dot_integral * Ki;
			}

			if (dyn_theta_dot < 0) {
				m1_d += dyn_theta_dot * Kp + this.theta_dot_integral * Ki;
				m3_d += dyn_theta_dot * Kp + this.theta_dot_integral * Ki;
			} else {
				m2_d -= dyn_theta_dot * Kp + this.theta_dot_integral * Ki;
				m4_d -= dyn_theta_dot * Kp + this.theta_dot_integral * Ki;
			}
			/*
			if (ax > 0) {
				m1_d += ax * Kp + this.ax_integral * Ki;
				m3_d += ax * Kp + this.ax_integral * Ki;
			} else {
				m2_d -= ax * Kp + this.ax_integral * Ki;
				m4_d -= ax * Kp + this.ax_integral * Ki;
			}

			if (ay > 0) {
				m3_d += ay * Kp + this.ay_integral * Ki;
				m4_d += ay * Kp + this.ay_integral * Ki;
			} else {
				m1_d -= ay * Kp + this.ay_integral * Ki;
				m2_d -= ay * Kp + this.ay_integral * Ki;
			}
			*/

			// These are the new motor speed settings from 0 to 1999
			this.d1 = m1_d;
			this.d2 = m2_d;
			this.d3 = m3_d;
			this.d4 = m4_d;
			//console.log({m1_d, m2_d, m3_d, m4_d});

			let n1 = CLIPCLAMP(this.target + m1_d, 0, 1999);
			let n2 = CLIPCLAMP(this.target + m2_d, 0, 1999);
			let n3 = CLIPCLAMP(this.target + m3_d, 0, 1999);
			let n4 = CLIPCLAMP(this.target + m4_d, 0, 1999);
			//console.log({n1, n2, n3, n4});


			// TODO: RACE CONDITION with stop()
			let cmd =
				`sa ` +
				`${n1.toFixed(0)} ` +
				`${n2.toFixed(0)} ` +
				`${n3.toFixed(0)} ` +
				`${n4.toFixed(0)}\n`;
			framework.send(cmd);
		}
	},
	mounted () {
		/* TODO: how do we know we don't have backpressure? */
		framework.on('telemetry', parts => {
			this.rawax = filter_ax.add(parseInt(parts[0]));
			this.raway = filter_ay.add(parseInt(parts[1]));
			this.rawaz = filter_az.add(parseInt(parts[2]));
			this.rawgx = parseInt(parts[3]);
			this.rawgy = parseInt(parts[4]);
			this.rawgz = parseInt(parts[5]);
			this.s1 = (parseInt(parts[6]) >> 5) - 47;
			this.s2 = (parseInt(parts[7]) >> 5) - 47;
			this.s3 = (parseInt(parts[8]) >> 5) - 47;
			this.s4 = (parseInt(parts[9]) >> 5) - 47;
			// +32768=+2g,-32768=-2g; convert to single Gs
			this.ax = (this.rawax - this.calax) / (32768 / 2);
			this.ay = (this.raway - this.calay) / (32768 / 2);
			this.az = (this.rawaz - this.calaz) / (32768 / 2);
			// +32768=+250deg,-32768=-250deg/s; convert to single degree/s
			this.gx = (this.rawgx - this.calgx) / (32768 / 250);
			this.gy = (this.rawgy - this.calgy) / (32768 / 250);
			this.gz = (this.rawgz - this.calgz) / (32768 / 250);
			this.computeResponse();
		});
		framework.on('error', error => {
			console.error('toplevel framework error', error);
		});
		framework.on('port', port => {
			this.ports.push(port);
		});
		framework.init();
		framework.getPorts();
		// not sure why v-on:keydown on body isn't working...
		window.onkeydown = (event) => {
			switch (event.key) {
				case '[': this.changeTarget(-10); break;
				case ']': this.changeTarget(+10); break;
				case '{': this.changeTarget(-100); break;
				case '}': this.changeTarget(+100); break;
				case 'x':
				case 'X': this.stop(); break;
				default: break;
			}
		};
	}
};
</script>

<style>
	#app {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		font-family: monospace;
	}
</style>
