import * as core from '@actions/core'
import {parse, satisfies} from 'semver'

async function run(): Promise<void> {
  try {
    const versionInput = core.getInput('version')
    const version = parse(versionInput)

    if (version == null) {
      return
    }

    core.setOutput('major', version.major)
    core.setOutput('minor', version.minor)
    core.setOutput('patch', version.patch)

    const compareToInput: string = core.getInput('compare-to')
    const compareTo = parse(compareToInput)

    if (compareTo != null) {
      switch (version.compare(compareTo)) {
        case -1:
          core.setOutput('comparison-result', '<')
          break
        case 0:
          core.setOutput('comparison-result', '=')
          break
        case 1:
          core.setOutput('comparison-result', '>')
          break
      }
    }

    const satisfiesRangeInput: string = core.getInput('satisfies')

    if (satisfiesRangeInput) {
      core.setOutput('satisfies', satisfies(version, satisfiesRangeInput))
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
