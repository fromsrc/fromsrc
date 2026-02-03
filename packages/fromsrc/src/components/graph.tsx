"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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
	label?: string
}

interface Position {
	x: number
	y: number
}

const NODE_RADIUS = 8
const HIT_RADIUS = NODE_RADIUS + 4

export function Graph({
	nodes,
	links,
	onNodeClick,
	width = 600,
	height = 400,
	label = "Graph visualization",
}: GraphProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [positions, setPositions] = useState<Map<string, Position>>(new Map())
	const [hovered, setHovered] = useState<string | null>(null)
	const [focused, setFocused] = useState<number>(-1)

	useEffect(() => {
		const newPositions = new Map<string, Position>()
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

	const draw = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext("2d")
		if (!ctx) return

		const dpr = window.devicePixelRatio || 1
		canvas.width = width * dpr
		canvas.height = height * dpr
		ctx.scale(dpr, dpr)

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

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i]!
			const pos = positions.get(node.id)
			if (!pos) continue

			const isHovered = hovered === node.id
			const isFocused = focused === i

			ctx.beginPath()
			ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, 2 * Math.PI)
			ctx.fillStyle = isHovered || isFocused ? "#1a1a1a" : "#0a0a0a"
			ctx.fill()
			ctx.strokeStyle = isHovered || isFocused ? "#888" : "#666"
			ctx.lineWidth = isHovered || isFocused ? 3 : 2
			ctx.stroke()

			if (isFocused) {
				ctx.beginPath()
				ctx.arc(pos.x, pos.y, NODE_RADIUS + 4, 0, 2 * Math.PI)
				ctx.strokeStyle = "#4f9"
				ctx.lineWidth = 2
				ctx.stroke()
			}

			ctx.fillStyle = isHovered || isFocused ? "#ccc" : "#999"
			ctx.font = "12px system-ui"
			ctx.textAlign = "center"
			ctx.fillText(node.title, pos.x, pos.y + 24)
		}
	}, [nodes, links, positions, width, height, hovered, focused])

	useEffect(() => {
		draw()
	}, [draw])

	function findNode(x: number, y: number): GraphNode | null {
		for (const node of nodes) {
			const pos = positions.get(node.id)
			if (!pos) continue

			const dx = x - pos.x
			const dy = y - pos.y
			if (dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS) {
				return node
			}
		}
		return null
	}

	function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
		if (!onNodeClick) return

		const rect = canvasRef.current?.getBoundingClientRect()
		if (!rect) return

		const x = e.clientX - rect.left
		const y = e.clientY - rect.top
		const node = findNode(x, y)
		if (node) onNodeClick(node)
	}

	function handleMove(e: React.MouseEvent<HTMLCanvasElement>) {
		const rect = canvasRef.current?.getBoundingClientRect()
		if (!rect) return

		const x = e.clientX - rect.left
		const y = e.clientY - rect.top
		const node = findNode(x, y)
		setHovered(node?.id ?? null)
	}

	function handleLeave() {
		setHovered(null)
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
		if (nodes.length === 0) return

		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault()
			setFocused((prev) => (prev + 1) % nodes.length)
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault()
			setFocused((prev) => (prev - 1 + nodes.length) % nodes.length)
		} else if ((e.key === "Enter" || e.key === " ") && focused >= 0 && onNodeClick) {
			e.preventDefault()
			onNodeClick(nodes[focused]!)
		}
	}

	function handleFocus() {
		if (focused < 0 && nodes.length > 0) {
			setFocused(0)
		}
	}

	function handleBlur() {
		setFocused(-1)
	}

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			onClick={handleClick}
			onMouseMove={handleMove}
			onMouseLeave={handleLeave}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			onBlur={handleBlur}
			tabIndex={onNodeClick ? 0 : -1}
			role="img"
			aria-label={label}
			className="rounded-lg border border-line bg-bg outline-none focus-visible:ring-2 focus-visible:ring-green-400"
			style={{
				cursor: hovered && onNodeClick ? "pointer" : "default",
				width,
				height,
			}}
		/>
	)
}
