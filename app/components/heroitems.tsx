import { heroauth } from "./heroauth"
import { heroconfig } from "./heroconfig"

export const files = [heroauth, heroconfig]

export const stats = [
	{ value: "<20ms", label: "search" },
	{ value: "3k+", label: "files ok" },
	{ value: "0", label: "abstraction" },
	{ value: "100%", label: "open source" },
]
