#!/usr/bin/env node

import { confirm, intro, isCancel, outro, select, spinner, text } from "@clack/prompts"
import { program } from "commander"
import pc from "picocolors"
import { create } from "./index"

program
	.name("create-fromsrc")
	.description("create a new fromsrc documentation site")
	.argument("[name]", "project name")
	.option("-t, --template <template>", "template to use", "next")
	.action(async (name, options) => {
		intro(pc.bold("create-fromsrc"))

		const projectName =
			name ||
			(await text({
				message: "project name",
				placeholder: "my-docs",
				validate: (v) => (v.length === 0 ? "required" : undefined),
			}))

		if (isCancel(projectName)) {
			outro(pc.dim("cancelled"))
			process.exit(0)
		}

		const template =
			options.template ||
			(await select({
				message: "template",
				options: [{ value: "next", label: "next.js", hint: "recommended" }],
			}))

		if (isCancel(template)) {
			outro(pc.dim("cancelled"))
			process.exit(0)
		}

		const install = await confirm({
			message: "install dependencies?",
			initialValue: true,
		})

		if (isCancel(install)) {
			outro(pc.dim("cancelled"))
			process.exit(0)
		}

		const s = spinner()
		s.start("creating project")

		await create({
			name: projectName as string,
			template: template as string,
			install: install as boolean,
		})

		s.stop("project created")

		outro(`cd ${projectName} && bun dev`)
	})

program.parse()
