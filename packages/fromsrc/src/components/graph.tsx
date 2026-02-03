"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { JSX, KeyboardEvent, MouseEvent } from "react"

/** Node in the graph visualization */
export interface GraphNode {
	/** Unique identifier for the node */
	id: string
	/** Display title shown below the node */
	title: string
	/** Optional grouping category */
	group?: string
}

/** Connection between two nodes */
export interface GraphLink {
	/** ID of the source node */
	source: string
	/** ID of the target node */
	target: string
}

/** Props for the Graph component */
export interface GraphProps {
	/** Array of nodes to display */
	nodes: GraphNode[]
	/** Array of links connecting nodes */
	links: GraphLink[]
	/** Callback when a node is clicked or activated */
	onNodeClick?: (node: GraphNode) => void
	/** Canvas width in pixels */
	width?: number
	/** Canvas height in pixels */
	height?: number
	/** Accessible label for the graph */
	label?: string
}

/** Internal position coordinates */
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
}: GraphProps): JSX.Element {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [positions, setPositions] = useState<Map<string, Position>>(new Map())
	const [hovered, setHovered] = useState<string | null>(null)
	const [focused, setFocused] = useState<number>(-1)

	useEffect((): void => {
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

	const draw = useCallback((): void => {
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

	useEffect((): void => {
		draw()
	}, [draw])

	const findNode = useCallback(
		(x: number, y: number): GraphNode | null => {
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
		},
		[nodes, positions],
	)

	const handleClick = useCallback(
		(e: MouseEvent<HTMLCanvasElement>): void => {
			if (!onNodeClick) return

			const rect = canvasRef.current?.getBoundingClientRect()
			if (!rect) return

			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			const node = findNode(x, y)
			if (node) onNodeClick(node)
		},
		[onNodeClick, findNode],
	)

	const handleMove = useCallback(
		(e: MouseEvent<HTMLCanvasElement>): void => {
			const rect = canvasRef.current?.getBoundingClientRect()
			if (!rect) return

			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			const node = findNode(x, y)
			setHovered(node?.id ?? null)
		},
		[findNode],
	)

	const handleLeave = useCallback((): void => {
		setHovered(null)
	}, [])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLCanvasElement>): void => {
			if (nodes.length === 0) return

			switch (e.key) {
				case "ArrowRight":
				case "ArrowDown":
				case "Tab": {
					if (e.key === "Tab" && e.shiftKey) {
						e.preventDefault()
						setFocused((prev) => (prev - 1 + nodes.length) % nodes.length)
					} else if (e.key === "Tab") {
						e.preventDefault()
						setFocused((prev) => (prev + 1) % nodes.length)
					} else {
						e.preventDefault()
						setFocused((prev) => (prev + 1) % nodes.length)
					}
					break
				}
				case "ArrowLeft":
				case "ArrowUp": {
					e.preventDefault()
					setFocused((prev) => (prev - 1 + nodes.length) % nodes.length)
					break
				}
				case "Home": {
					e.preventDefault()
					setFocused(0)
					break
				}
				case "End": {
					e.preventDefault()
					setFocused(nodes.length - 1)
					break
				}
				case "Enter":
				case " ": {
					if (focused >= 0 && onNodeClick) {
						e.preventDefault()
						onNodeClick(nodes[focused]!)
					}
					break
				}
				case "Escape": {
					e.preventDefault()
					setFocused(-1)
					canvasRef.current?.blur()
					break
				}
			}
		},
		[nodes, focused, onNodeClick],
	)

	const handleFocus = useCallback((): void => {
		if (focused < 0 && nodes.length > 0) {
			setFocused(0)
		}
	}, [focused, nodes.length])

	const handleBlur = useCallback((): void => {
		setFocused(-1)
	}, [])

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
