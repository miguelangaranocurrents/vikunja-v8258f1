import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

/**
 * Serializes a copied slice as plain text for the text/plain clipboard format.
 * ProseMirror's default only separates blocks, which loses the structure of lists,
 * so list items get their bullet or number markers back.
 */
export function serializeSliceAsText(slice: Slice): string {
	const lines: string[] = []
	slice.content.forEach(node => lines.push(...blockLines(node)))
	return lines.join('\n')
}

function blockLines(node: ProseMirrorNode): string[] {
	if (node.isTextblock) {
		return [node.textContent]
	}

	if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
		const ordered = node.type.name === 'orderedList'
		const lines: string[] = []
		let number = 1
		node.forEach(item => {
			const marker = ordered ? `${number++}. ` : '- '
			const continuation = ' '.repeat(marker.length)
			blockLines(item).forEach((line, index) => {
				lines.push((index === 0 ? marker : continuation) + line)
			})
		})
		return lines
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...blockLines(child)))
	return lines
}
