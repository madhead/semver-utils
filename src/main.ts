import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const compareTo: string = core.getInput('compare-to')

    core.info(`Version: ${version}`)
    core.info(`Compare to: ${compareTo}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
