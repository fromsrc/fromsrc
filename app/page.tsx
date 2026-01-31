import { Nav } from "./components/nav"
import { Hero } from "./components/hero"
import { Compare } from "./components/compare"
import { Features } from "./components/features"
import { Native } from "./components/native"
import { Parts } from "./components/parts"
import { Foot } from "./components/foot"

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
