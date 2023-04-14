<script lang="ts">
	const update = ( e: Event & { currentTarget: EventTarget & HTMLTextAreaElement } ) => {
		const event = e.currentTarget as HTMLTextAreaElement

		const code = event.nextElementSibling?.firstElementChild as HTMLPreElement
		code.innerHTML = event.value.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' )
		// @ts-expect-error
		Prism.highlightElement( code )
	}

	const syncScroll = ( e: Event & { currentTarget: EventTarget & HTMLTextAreaElement } ) => {
		const event = e.currentTarget as HTMLTextAreaElement

		const pre = event.nextElementSibling!
		pre.scrollTop = event.scrollTop
		pre.scrollLeft = event.scrollLeft
	}

	export let label: string | null = null
	export let onUpdate: null | ( ( e: unknown ) => void ) = null
</script>

<div>
	{ #if label }
		<h2> { label } </h2>
	{ /if }
	<textarea spellcheck="false" on:change={ onUpdate } on:input={ update } on:input={ syncScroll } on:scroll={ syncScroll }></textarea>
	<pre class="highlight" aria-hidden="true"><code class="language-css highlight__content"></code></pre>
</div>

<style>
div {
	position: relative;
	width: 100%;
}
h2 {
	color: #83828b;
	font-family: Poppins;
	font-size: 0.85em;
}
textarea, pre {
	background-color: #1e1e1e;
	border: 0;
	border-radius: 5px;
	outline: 0;
  margin: 10px;
  padding: 10px;
  border: 0;
  width: calc(100% - 32px);
  height: 600px;
  position: absolute;
  top: 28px;
  left: 0;
  overflow: auto;
  white-space: pre;
}
textarea, pre, pre * {
  font-size: 15pt;
  font-family: monospace;
  line-height: 20pt;
}
textarea {
	z-index: 1;
  color: transparent;
  background: transparent;
  caret-color: white; /* Or choose your favorite color */
  resize: none;
}
pre {
	z-index: 0;
}
</style>