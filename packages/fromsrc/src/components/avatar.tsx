"use client"

import type { ReactNode } from "react"

interface AvatarProps {
	src?: string
	name: string
	size?: "sm" | "md" | "lg"
}

const sizes = {
	sm: "w-8 h-8 text-xs",
	md: "w-10 h-10 text-sm",
	lg: "w-12 h-12 text-base",
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2)
}

export function Avatar({ src, name, size = "md" }: AvatarProps) {
	if (src) {
		return (
			<img
				src={src}
				alt={name}
				className={`${sizes[size]} rounded-full object-cover`}
			/>
		)
	}

	return (
		<div
			className={`${sizes[size]} rounded-full bg-surface border border-line flex items-center justify-center font-medium text-muted`}
		>
			{getInitials(name)}
		</div>
	)
}

interface AvatarGroupProps {
	children: ReactNode
	max?: number
}

export function AvatarGroup({ children, max = 5 }: AvatarGroupProps) {
	return (
		<div className="flex -space-x-2">
			{children}
		</div>
	)
}

interface UserProps {
	name: string
	avatar?: string
	role?: string
}

export function User({ name, avatar, role }: UserProps) {
	return (
		<div className="inline-flex items-center gap-2">
			<Avatar src={avatar} name={name} size="sm" />
			<div className="flex flex-col">
				<span className="text-sm font-medium text-fg">{name}</span>
				{role && <span className="text-xs text-muted">{role}</span>}
			</div>
		</div>
	)
}
