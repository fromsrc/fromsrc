"use client"

import { useCallback, useId, useRef, useState } from "react"
import type { JSX, KeyboardEvent } from "react"
import { IconCheck, IconChevronDown } from "./icons"

/**
 * Represents a selectable version option
 */
interface Version {
	/** Unique identifier for the version */
	id: string
	/** Display label for the version */
	label: string
	/** Optional URL to navigate to when selected */
	href?: string
}

/**
 * Props for the VersionSelect component
 */
interface VersionSelectProps {
	/** List of available versions */
	versions: Version[]
	/** ID of the currently selected version */
	current: string
	/** Callback when version changes (for non-href versions) */
	onChange?: (version: string) => void
	/** Accessible label for the dropdown */
	label?: string
}

export function VersionSelect({
	versions,
	current,
	onChange,
	label = "Version",
}: VersionSelectProps): JSX.Element {
	const [open, setOpen] = useState<boolean>(false)
	const [focused, setFocused] = useState<number>(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const instanceId = useId()
	const listboxId = `${instanceId}-listbox`
	const currentVersion = versions.find((v) => v.id === current)
	const currentIndex = versions.findIndex((v) => v.id === current)

	const getOptionId = useCallback(
		(versionId: string): string => `${instanceId}-option-${versionId}`,
		[instanceId],
	)

	const selectVersion = useCallback(
		(version: Version): void => {
			if (version.href) {
				window.location.href = version.href
			} else {
				onChange?.(version.id)
			}
			setOpen(false)
			triggerRef.current?.focus()
		},
		[onChange],
	)

	const close = useCallback((): void => {
		setOpen(false)
		setFocused(-1)
		triggerRef.current?.focus()
	}, [])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLElement>): void => {
			if (!open) {
				if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault()
					setOpen(true)
					setFocused(currentIndex >= 0 ? currentIndex : 0)
				}
				return
			}

			switch (e.key) {
				case "Escape":
					e.preventDefault()
					close()
					break
				case "ArrowDown":
					e.preventDefault()
					setFocused((f) => Math.min(f + 1, versions.length - 1))
					break
				case "ArrowUp":
					e.preventDefault()
					setFocused((f) => Math.max(f - 1, 0))
					break
				case "Enter":
				case " ":
					e.preventDefault()
					if (focused >= 0) {
						const version = versions[focused]
						if (version) selectVersion(version)
					}
					break
				case "Home":
					e.preventDefault()
					setFocused(0)
					break
				case "End":
					e.preventDefault()
					setFocused(versions.length - 1)
					break
				case "Tab":
					close()
					break
				case "PageDown":
					e.preventDefault()
					setFocused((f) => Math.min(f + 5, versions.length - 1))
					break
				case "PageUp":
					e.preventDefault()
					setFocused((f) => Math.max(f - 5, 0))
					break
			}
		},
		[open, currentIndex, versions, focused, selectVersion, close],
	)

	const focusedVersion = focused >= 0 ? versions[focused] : undefined

	const handleClick = useCallback((): void => {
		setOpen(!open)
		if (!open) setFocused(currentIndex >= 0 ? currentIndex : 0)
	}, [open, currentIndex])

	const handleBlur = useCallback(
		(e: React.FocusEvent<HTMLButtonElement>): void => {
			if (!containerRef.current?.contains(e.relatedTarget)) {
				setOpen(false)
				setFocused(-1)
			}
		},
		[],
	)

	const handleBackdropClick = useCallback((): void => {
		close()
	}, [close])

	const handleOptionClick = useCallback(
		(version: Version): void => {
			selectVersion(version)
		},
		[selectVersion],
	)

	const handleOptionMouseEnter = useCallback((index: number): void => {
		setFocused(index)
	}, [])

	return (
		<div className="relative" ref={containerRef}>
			<button
				ref={triggerRef}
				type="button"
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				className="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface border border-line rounded-lg hover:bg-surface/80 transition-colors"
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={open ? listboxId : undefined}
				aria-label={`${label}: ${currentVersion?.label || current}`}
			>
				<span className="text-fg">{currentVersion?.label || current}</span>
				<IconChevronDown
					size={14}
					className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>
			{open && (
				<>
					<div className="fixed inset-0 z-40" onClick={handleBackdropClick} aria-hidden="true" />
					<div
						ref={listRef}
						id={listboxId}
						className="absolute left-0 top-full mt-1 z-50 min-w-[120px] py-1 bg-surface border border-line rounded-lg shadow-lg"
						role="listbox"
						aria-label={label}
						aria-activedescendant={focusedVersion ? getOptionId(focusedVersion.id) : undefined}
					>
						{versions.map((version, i) => (
							<div
								key={version.id}
								id={getOptionId(version.id)}
								role="option"
								aria-selected={version.id === current}
								onClick={() => handleOptionClick(version)}
								onMouseEnter={() => handleOptionMouseEnter(i)}
								className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left cursor-pointer hover:bg-bg transition-colors ${
									i === focused ? "bg-bg" : ""
								}`}
							>
								<span className={version.id === current ? "text-fg" : "text-muted"}>
									{version.label}
								</span>
								{version.id === current && <IconCheck size={14} className="text-accent" />}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

export type { Version, VersionSelectProps }
