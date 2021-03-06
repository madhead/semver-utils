import * as core from '@actions/core'
import {parse, satisfies} from 'semver'

async function run(): Promise<void> {
  try {
    const versionInput = core.getInput('version')
    const version = parse(versionInput)

    if (version === null) {
      return
    }

    core.setOutput('major', version.major)
    core.setOutput('minor', version.minor)
    core.setOutput('patch', version.patch)

    const identifierInput = core.getInput('identifier')
    let identifier = undefined

    if (identifierInput.trim() !== '') {
      identifier = identifierInput
    }

    core.setOutput('inc-major', parse(versionInput)?.inc('major', identifier).format())
    core.setOutput('inc-premajor', parse(versionInput)?.inc('premajor', identifier).format())
    core.setOutput('inc-minor', parse(versionInput)?.inc('minor', identifier).format())
    core.setOutput('inc-preminor', parse(versionInput)?.inc('preminor', identifier).format())
    core.setOutput('inc-patch', parse(versionInput)?.inc('patch', identifier).format())
    core.setOutput('inc-prepatch', parse(versionInput)?.inc('prepatch', identifier).format())
    core.setOutput('inc-prerelease', parse(versionInput)?.inc('prerelease', identifier).format())

    if (version.build.length > 0) {
      core.setOutput('build', version.build.join('.'))
      core.setOutput('build-parts', version.build.length)

      version.build.forEach((buildPart, index) => {
        core.setOutput(`build-${index}`, buildPart)
      })
    }

    if (version.prerelease.length > 0) {
      core.setOutput('prerelease', version.prerelease.join('.'))
      core.setOutput('prerelease-parts', version.prerelease.length)

      version.prerelease.forEach((prereleasePart, index) => {
        core.setOutput(`prerelease-${index}`, prereleasePart)
      })
    }

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
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
