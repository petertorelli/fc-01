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