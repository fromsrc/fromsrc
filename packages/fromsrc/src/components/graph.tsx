"use client"

import { useEffect, useRef, useState } from "react"

export interface GraphNode {
	id: string
	title: string
	group?: string
}

export interface GraphLink {
	source: string
	target: string
}

export interface GraphProps {
	nodes: GraphNode[]
	links: GraphLink[]
	onNodeClick?: (node: GraphNode) => void
	width?: number
	height?: number
}

export function Graph({ nodes, links, onNodeClick, width = 600, height = 400 }: GraphProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

	useEffect(() => {
		const newPositions = new Map<string, { x: number; y: number }>()
		nodes.forEach((node, i) => {
			const angle = (2 * Math.PI * i) / nodes.length
			const radius = Math.min(width, height) * 0.35
			newPositions.set(node.id, {
				x: width / 2 + radius * Math.cos(angle),
				y: height / 2 + radius * Math.sin(angle),
			})
		})
		setPositions(newPositions)
	}, [nodes, width, height])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		ctx.clearRect(0, 0, width, height)

		ctx.strokeStyle = "#333"
		ctx.lineWidth = 1

		for (const link of links) {
			const source = positions.get(link.source)
			const target = positions.get(link.target)
			if (!source || !target) continue

			ctx.beginPath()
			ctx.moveTo(source.x, source.y)
			ctx.lineTo(target.x, target.y)
			ctx.stroke()
		}

		ctx.fillStyle = "#0a0a0a"
		ctx.strokeStyle = "#666"
		ctx.lineWidth = 2

		for (const node of nodes) {
			const pos = positions.get(node.id)
			if (!pos) continue

			ctx.beginPath()
			ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI)
			ctx.fill()
			ctx.stroke()

			ctx.fillStyle = "#999"
			ctx.font = "12px system-ui"
			ctx.textAlign = "center"
			ctx.fillText(node.title, pos.x, pos.y + 24)
			ctx.fillStyle = "#0a0a0a"
		}
	}, [nodes, links, positions, width, height])

	function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
		if (!onNodeClick) return

		const rect = canvasRef.current?.getBoundingClientRect()
		if (!rect) return

		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		for (const node of nodes) {
			const pos = positions.get(node.id)
			if (!pos) continue

			const dx = x - pos.x
			const dy = y - pos.y
			if (dx * dx + dy * dy < 100) {
				onNodeClick(node)
				break
			}
		}
	}

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			onClick={handleClick}
			className="rounded-lg border border-line bg-bg"
			style={{ cursor: onNodeClick ? "pointer" : "default" }}
		/>
	)
}
