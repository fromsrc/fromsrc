"use client"

import Image from "next/image"
import type { ReactNode } from "react"

export interface AvatarProps {
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
			<div className={`${sizes[size]} rounded-full overflow-hidden relative`}>
				<Image src={src} alt={name} fill className="object-cover" />
			</div>
		)
	}

	return (
		<div
			className={`${sizes[size]} rounded-full bg-surface border border-line flex items-center justify-center font-medium text-muted`}
			role="img"
			aria-label={name}
		>
			{getInitials(name)}
		</div>
	)
}

export interface AvatarGroupProps {
	children: ReactNode
	label: string
}

export function AvatarGroup({ children, label }: AvatarGroupProps) {
	return (
		<div className="flex -space-x-2" role="group" aria-label={label}>
			{children}
		</div>
	)
}

export interface UserProps {
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
