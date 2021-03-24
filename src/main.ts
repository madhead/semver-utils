import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')

    core.info(`Version: ${version}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
