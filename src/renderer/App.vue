<template lang="pug">
html(lang='en')
	head
		meta(charset='utf-8')
		meta(name='viewport',content='width=device-width,initial-scale=1,shrink-to-fit=no')
		title Fucking fuck fuck ...
	body
		div#app
			.d-flex.justify-content-around.my-5
				vu-meter(text='x-accel, <i>N</i>' color='red' type='arc' :val='ax')
				vu-meter(text='y-accel, <i>N</i>' color='blue' type='arc' :val='ay')
				vu-meter(text='z-accel, <i>N</i>' color='green' type='arc' :val='az')
			.d-flex.justify-content-around.my-5
				vu-meter(text='x-axis &omega; &deg;/sec' color='red' type='circle' :val='gx')
				vu-meter(text='y-axis &omega; &deg;/sec' color='blue' type='circle' :val='gy')
				vu-meter(text='z-axis &omega; &deg;/sec' color='green' type='circle' :val='gz')
			.d-flex.justify-content-center.my-5
				div
					q-rotor(text='Speed, #1' :val='s1')
					q-rotor(text='Speed, #2' :val='s2')
				div
					q-rotor(text='Speed, #3' :val='s3')
					q-rotor(text='Speed, #4' :val='s4')
			center.m-2
				button.btn.btn-secondary(@click='stabilize') Stabilization {{ this.isStabilizing ? 'On' : 'Off' }}
			.d-flex.justify-content-center
				.form-inline
					button.btn.btn-sm.btn-primary(@click="saneg") &lt;
					input.form-control.form-control-sm(
						type="number" v-model='target').mx-2.text-center
					button.btn.btn-sm.btn-primary(@click="sapos") &gt;
			center.m-2
				button.btn.btn-danger(style='height: 5rem; width: 5rem;' @click="stop") STOP
			.d-flex.justify-content-around
				div Left &delta; = {{ dl }}
				div Right &delta; = {{ dr }}
				div Front &delta; = {{ df }}
				div Back &delta; = {{ db }}

</template>

<script>
import VuMeter from './components/VuMeter';
import Rotor from './components/Rotor';
import { framework } from '../framework';
import 'bootstrap/dist/css/bootstrap.min.css';

function pause(ms) {
	return new Promise(resolve => {
		setTimeout(() => {
			return resolve();
		}, ms);
	});
}

export default {
	name: 'app',
	data() {
		return {
			ax: 0, ay: 0, az: 0,
			gx: 0, gy: 0, gz: 0,
			s1: 0, s2: 0, s3: 0, s4: 0,
			target: 0,
			dl: 0, dr: 0,
			df: 0, db: 0,
			isStabilizing: false,
			isBusy: false,
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
			framework.send(`sa ${this.target}\n`);
		},
		stabilize () {
			this.isStabilizing = !this.isStabilizing;
		},
		sapos() {
			this.target += 10;
			framework.send(`sa ${this.target}\n`);
		},
		saneg() {
			this.target -= 10;
			framework.send(`sa ${this.target}\n`);
		},
		async computeResponse () {
			if (this.isStabilizing == false) {
				this.db = this.df = this.dl = this.dr = 0;
				return;
			}
			// Marvin's Ass is the cable, tilting back is -x, forward is +x
			// left tilt = -y, right tilt = +y
			// want ax & ay to be zero 1g=16384
			// so... let's say 100 off axis = 10 thrust on opposite side?
			let K = 10; // aN/T
			/*
			let n1 = this.s1;
			let n2 = this.s2;
			let n3 = this.s3;
			let n4 = this.s4;
			*/
			let n1 = this.target;
			let n2 = this.target;
			let n3 = this.target;
			let n4 = this.target;
			if (this.ax < 0) {
				this.db = this.ax / K;
				n2 += this.db;
				n4 += this.db;
			} else {
				this.df = this.ax / K;
				n1 += this.df;
				n3 += this.df;
			}
			if (this.ay < 0) {
				this.dl = this.ay / K;
				n1 += this.dl;
				n2 += this.dl;
			} else {
				this.dr = this.ay / K;
				n3 += this.dr;
				n4 += this.dr;
			}
			await framework.sendAck(`s1 ${n1.toFixed(0)}\n`);
			await framework.sendAck(`s2 ${n2.toFixed(0)}\n`);
			await framework.sendAck(`s3 ${n3.toFixed(0)}\n`);
			await framework.sendAck(`s4 ${n4.toFixed(0)}\n`);
		}
	},
	mounted () {
		framework.on('coords', async (parts) => {
			this.ax = parseInt(parts[0]);
			this.ay = parseInt(parts[1]);
			this.az = parseInt(parts[2]);
			this.gx = parseInt(parts[3]);
			this.gy = parseInt(parts[4]);
			this.gz = parseInt(parts[5]);
			await this.computeResponse();
		});
		framework.on('speed', parts => {
			this.s1 = parseInt(parts[0]);
			this.s2 = parseInt(parts[1]);
			this.s3 = parseInt(parts[2]);
			this.s4 = parseInt(parts[3]);
		});
		framework.on('error', error => {
			console.error(error);
		});
		framework.init();
		framework.send('start');
	}
};
</script>

<style>
	#app {
		font-family: 'Consolas', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}
</style>
