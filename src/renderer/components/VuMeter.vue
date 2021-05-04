<template lang='pug'>
div(:style='{color}')
	div(v-if='type=="circle"')
		svg(height='140' width='140')
			circle(
				cx='70'
				cy='70'
				r='40'
				:stroke='color'
				stroke-dasharray='2,2'
				stroke-width='0.5'
				fill='none')
			line(x1=25 y1=70 x2=115 y2=70
				:stroke='color'
				stroke-width='0.5'
				fill='none')
			line(x1=70 y1=25 x2=70 y2=115
				:stroke='color'
				stroke-width='0.5'
				fill='none')
			text(x=70 y=20
				:fill='color'
				text-anchor='middle'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[0] }}
			text(x=117.5 y=70
				:fill='color'
				text-anchor='start'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[1] }}
			text(x=70 y=122.5
				:fill='color'
				text-anchor='middle'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[2] }}
			text(x=22.5 y=70
				:fill='color'
				text-anchor='end'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[3] }}
			line(x1=70 y1=70 :x2='x2' :y2='y2' :stroke='color')
	div(v-else)
		svg(height='70' width='120')
			path(
				d="M 20 60 A 40 40 0 0 1 100 60"
				:stroke='color'
				stroke-width='0.5'
				stroke-dasharray='2,2'
				fill='none')
			line(x1=15 y1=60 x2=105 y2=60
				:stroke='color'
				stroke-width='0.5'
				fill='none')
			line(x1=60 y1=15 x2=60 y2=60
				:stroke='color'
				stroke-width='0.5'
				fill='none')
			text(x=60 y=10
				:fill='color'
				text-anchor='middle'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[1] }}
			text(x=0 y=60
				:fill='color'
				text-anchor='start'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[0] }}
			text(x=120 y=60
				:fill='color'
				text-anchor='end'
				font-size='.75rem'
				alignment-baseline='central'
				font-family='consolas') {{ this.labels[2] }}
			line(x1=60 y1=60 :x2='x2' :y2='y2' :stroke='color')
	div.small {{ this.rval.toFixed(prec) }}
	div(v-html='text')
</template>

<script lang='ts'>
import Vue from 'vue';

export default Vue.extend({
	name: 'VuMeter',
	data: function () {
		return {
			x2: 0,
			y2: 0,
		};
	},
	props: [ 'color', 'text', 'type', 'val', 'labels', 'rval', 'prec' ],
	watch: {
		val (l: number) {
			if (this.type == 'circle') {
				this.x2 = Math.cos(l - Math.PI / 2) * 50 + 70;
				this.y2 = Math.sin(l - Math.PI / 2) * 50 + 70;
			} else {
				this.x2 = Math.cos(l - Math.PI / 2) * 50 + 60;
				this.y2 = Math.sin(l - Math.PI / 2) * 50 + 60;
			}
		}
	},
});
</script>

<style scoped>
</style>