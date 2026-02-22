const blockednode = ["fs", "path", "child_process", "worker_threads", "module", "os", "crypto"];

export function isnodeblocked(target) {
	if (target.startsWith("node:")) return true;
	return blockednode.includes(target);
}
