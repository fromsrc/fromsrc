"use client"

import Image from "next/image"
import { type ReactNode, type JSX, memo } from "react"

/**
 * Props for the Avatar component.
 */
export interface AvatarProps {
	/** Image source URL */
	src?: string
	/** User's display name, used for initials fallback and accessibility */
	name: string
	/** Avatar size variant */
	size?: "sm" | "md" | "lg"
}

const sizes = {
	sm: "w-8 h-8 text-xs",
	md: "w-10 h-10 text-sm",
	lg: "w-12 h-12 text-base",
}

const pixelSizes = {
	sm: 32,
	md: 40,
	lg: 48,
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2)
}

function AvatarBase({ src, name, size = "md" }: AvatarProps): JSX.Element {
	if (src) {
		return (
			<div
				className={`${sizes[size]} rounded-full overflow-hidden relative`}
				role="img"
				aria-label={name}
			>
				<Image
					src={src}
					alt=""
					fill
					sizes={`${pixelSizes[size]}px`}
					className="object-cover"
					aria-hidden="true"
				/>
			</div>
		)
	}

	return (
		<div
			className={`${sizes[size]} rounded-full bg-surface border border-line flex items-center justify-center font-medium text-muted`}
			role="img"
			aria-label={name}
		>
			<span aria-hidden="true">{getInitials(name)}</span>
		</div>
	)
}

export const Avatar = memo(AvatarBase)

/**
 * Props for the AvatarGroup component.
 */
export interface AvatarGroupProps {
	/** Avatar elements to display */
	children: ReactNode
	/** Accessible label describing the group */
	label: string
}

function AvatarGroupBase({ children, label }: AvatarGroupProps): JSX.Element {
	return (
		<div className="flex -space-x-2" role="group" aria-label={label}>
			{children}
		</div>
	)
}

export const AvatarGroup = memo(AvatarGroupBase)

/**
 * Props for the User component.
 */
export interface UserProps {
	/** User's display name */
	name: string
	/** Avatar image URL */
	avatar?: string
	/** User's role or title */
	role?: string
}

function UserBase({ name, avatar, role }: UserProps): JSX.Element {
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

export const User = memo(UserBase)
