import { type Atrule, generate, parse, type Rule, walk } from 'css-tree'
import postcss from 'postcss'
import postcssDiscardEmpty from 'postcss-discard-empty'
import prettier from 'prettier'
import parseCss from 'prettier/parser-postcss'

export class Stylesheet {
	public nodes: Array<Rule | Atrule> = []

	public parse( text: string ): this {
		const css = parse( text )

		let isAtRule = false
		let atRuleCounter = 0

		walk( css, node => {
			if ( node.type === 'Atrule' ) {
				isAtRule = true
			} else if ( node.type === 'Block' && isAtRule ) {
				atRuleCounter = node.children.size
				isAtRule = false
				return
			} else if ( node.type === 'Rule' && atRuleCounter ) {
				--atRuleCounter
				return
			}

			if ( node.type === 'Rule' || node.type === 'Atrule' ) {
				this.nodes.push( node )
			}
		} )

		return this
	}

	public async clean() {
		const result = await postcss( postcssDiscardEmpty ).process( this.nodes.map( i => generate( i ) ).join( '' ), {
			from: undefined as unknown as string
		} )
		return prettier.format( result.css, {
			parser: 'css',
			plugins: [ parseCss ],
			semi: true,
			useTabs: true
		} )
	}

	public compare( stylesheet: Stylesheet ) {
		const merged = new Stylesheet()

		for ( const node of this.nodes ) {
			if ( node.type === 'Rule' ) {
				this.handleRule( node, stylesheet, merged )
			}
		}

		return merged
	}

	protected handleRule( node: Rule, stylesheet: Stylesheet, merged: Stylesheet ) {
		const selector = generate( node.prelude )
		const match = stylesheet.nodes.find( n => n.type === 'Rule' && generate( n.prelude ) === selector )
		if ( !match || match.type !== 'Rule' ) return

		const properties = new Set<string>()
		const otherProperties = match.block.children.toArray().filter( i => i.type === 'Declaration' )
			.map( i => generate( i ) )

		for ( const property of node.block.children ) {
			if ( property.type !== 'Declaration' ) {
				throw new Error( 'Unexpected token where property was expected.' )
			}

			const line = generate( property )
			const match = otherProperties.find( p => p === line )
			if ( match ) {
				properties.add( match )
			}
		}

		node.block.children = node.block.children.filter( n => !properties.has( generate( n ) ) )
		match.block.children = match.block.children.filter( n => !properties.has( generate( n ) ) )

		const styles = [ ...properties ].join( ';' )
		const rule = parse( `${ selector } { ${ styles } }`, { context: 'rule' } ) as Rule
		merged.nodes.push( rule )
	}
}
