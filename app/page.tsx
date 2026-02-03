import { Compare } from "./components/compare"
import { Features } from "./components/features"
import { Foot } from "./components/foot"
import { Hero } from "./components/hero"
import { Native } from "./components/native"
import { Nav } from "./components/nav"
import { Parts } from "./components/parts"

export default function Page() {
	return (
		<main className="min-h-dvh bg-bg text-fg">
			<Nav />
			<Hero />
			<Compare />
			<Features />
			<Native />
			<Parts />
			<Foot />
		</main>
	)
}
