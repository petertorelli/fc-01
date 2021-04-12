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
			.d-flex.justify-content-center
				.form-inline
					button.btn.btn-sm.btn-primary(@click="saneg") &lt;
					input.form-control.form-control-sm(
						type="number" v-model='target').mx-2.text-center
					button.btn.btn-sm.btn-primary(@click="sapos") &gt;

</template>

<script>
import VuMeter from './components/VuMeter';
import Rotor from './components/Rotor';
import { framework } from '../framework';
import 'bootstrap/dist/css/bootstrap.min.css';

export default {
	name: 'app',
	data() {
		return {
			ax: 0, ay: 0, az: 0,
			gx: 0, gy: 0, gz: 0,
			s1: 0, s2: 0, s3: 0, s4: 0,
			target: 0,
		};
	},
	components: {
		'vu-meter': VuMeter,
		'q-rotor': Rotor,
	},
	methods: {
		sapos() {
			this.target += 10;
			framework.send(`sa ${this.target}\n`);
		},
		saneg() {
			this.target -= 10;
			framework.send(`sa ${this.target}\n`);
		}
	},
	mounted () {
		framework.on('coords', parts => {
			this.ax = parseInt(parts[0]);
			this.ay = parseInt(parts[1]);
			this.az = parseInt(parts[2]);
			this.gx = parseInt(parts[3]);
			this.gy = parseInt(parts[4]);
			this.gz = parseInt(parts[5]);
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
