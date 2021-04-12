<template lang='pug'>
mixin arrows
	div &#x25b2;
	div 0
	div &#x25bc;
div
	.d-flex.flex-row
		div
			svg(height='120' width='120')
				circle(
					cx='60'
					cy='60'
					r='40'
					stroke='black'
					stroke-dasharray='2,2'
					stroke-width='0.5'
					fill='none')
				text(x=60 y=60
					fill='black'
					text-anchor='middle'
					font-size='.75rem'
					alignment-baseline='central'
					font-family='consolas') {{ val }}
	div.small {{ text }}
</template>

<script>
export default {
	name: 'Rotor',
	props: [ 'text',  'val' ]
};
</script>

<style scoped>
</style>