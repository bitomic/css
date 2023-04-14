<script>
    import { Stylesheet } from '$lib/Stylesheet';
    import Header from '../lib/components/Header.svelte';
    import Textarea from '../lib/components/Textarea.svelte';

	const combine = async () => {
		const [ first, second, result ] = document.querySelectorAll( 'textarea' )
		const styles1 = new Stylesheet().parse( first.value )
		const styles2 = new Stylesheet().parse( second.value )
		const merged = styles1.compare( styles2 )

		first.value = await styles1.clean()
		second.value = await styles2.clean()
		result.value = await merged.clean()

		const event = new Event( 'input' )
		first.dispatchEvent( event )
		second.dispatchEvent( event )
		result.dispatchEvent( event )
	}
</script>

<Header />

<div class="columns">
	<Textarea label="Desktop" />
	<Textarea label="Mobile" />
</div>
<div class="columns" style="height: unset;">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="button" on:click={ combine }> Combine stylesheets </div>
</div>
<div class="columns">
	<Textarea label="Common" />
</div>

<style>
.columns {
	column-gap: 16px;
	display: flex;
	height: 650px;
	padding: 16px;
}
.button {
	background-color: #0b0b0f;
	border-radius: 5px;
	color: #fff;
	cursor: pointer;
	font-family: Poppins;
	font-size: 24pt;
	padding: 16px 0;
	text-align: center;
	transition: 0.4s;
	width: 100%;
}
.button:hover {
	background-color: #060608;
}
</style>