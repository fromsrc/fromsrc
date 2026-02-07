"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ComponentPropsWithoutRef, useCallback, useRef } from "react"

type Props = ComponentPropsWithoutRef<typeof Link>

export function PreLink(props: Props) {
	const router = useRouter()
	const timer = useRef<ReturnType<typeof setTimeout>>(null)
	const href = typeof props.href === "string" ? props.href : props.href.pathname || ""

	const enter = useCallback(() => {
		timer.current = setTimeout(() => {
			router.prefetch(href)
		}, 65)
	}, [router, href])

	const leave = useCallback(() => {
		if (timer.current) clearTimeout(timer.current)
	}, [])

	return <Link {...props} onMouseEnter={enter} onMouseLeave={leave} />
}
