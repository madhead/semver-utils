import { execPath } from 'process'
import { execFileSync } from 'child_process'
import { join } from 'path'
import { coerce } from 'semver'

const data = [
  { version: 'Forty-two', valid: false },
  { version: '1.2', valid: false },
  { version: '1', valid: false },
  { version: '1', valid: false, compareTo: '0.0.0' },
  { version: '0.0.0', valid: true, major: 0, minor: 0, patch: 0 },
  { version: '0.0.1', valid: true, major: 0, minor: 0, patch: 1 },
  { version: '0.1.1', valid: true, major: 0, minor: 1, patch: 1 },
  { version: '1.0.0', valid: true, major: 1, minor: 0, patch: 0 },
  { version: '1.2.3', valid: true, major: 1, minor: 2, patch: 3 },

  {
    version: '1.2.3',
    valid: true,
    compareTo: '0.0',
    compareToValid: false,
    major: 1,
    minor: 2,
    patch: 3
  },
  {
    version: '1.2.3',
    valid: true,
    compareTo: '0.0.0',
    compareToValid: true,
    major: 1,
    minor: 2,
    patch: 3,
    comparisonResult: '>'
  },
  {
    version: '1.2.3',
    valid: true,
    compareTo: '1.2.3',
    compareToValid: true,
    major: 1,
    minor: 2,
    patch: 3,
    comparisonResult: '='
  },
  {
    version: '1.2.3',
    valid: true,
    compareTo: '2.0.0',
    compareToValid: true,
    major: 1,
    minor: 2,
    patch: 3,
    comparisonResult: '<'
  }
]

data.forEach(item => {
  test(`${item.version} / ${item.compareTo}`, () => {
    const stdout = execFileSync(
      execPath,
      [join(__dirname, '..', 'lib', 'main.js')],
      {
        env: {
          INPUT_VERSION: item.version,
          'INPUT_COMPARE-TO': item.compareTo
        }
      }
    ).toString()

    if (item.valid) {
      if (item.compareToValid) {
        expect(stdout).toBe(`::set-output name=major::${item.major}
::set-output name=minor::${item.minor}
::set-output name=patch::${item.patch}
::set-output name=comparison-result::${item.comparisonResult}
`)
      } else {
        expect(stdout).toBe(`::set-output name=major::${item.major}
::set-output name=minor::${item.minor}
::set-output name=patch::${item.patch}
`)
      }
    } else {
      expect(stdout).toBe('')
    }
  })
})

const satisfiesData = [
  { version: '1.2.3', range: '', result: undefined },

  { version: '1.2.3', range: '*', result: true },
  { version: '1.2.3', range: '>1.0.0', result: true },
  { version: '1.2.3', range: '<2.0.0', result: true },
  { version: '1.2.3', range: '>=1.2.3', result: true },
  { version: '1.2.3', range: '<=1.2.3', result: true },
  { version: '1.2.3', range: '=1.2.3', result: true },
  { version: '1.2.3', range: '>1.0.0 <2.0.0', result: true },
  { version: '1.2.3', range: '1.2.x', result: true },
  { version: '1.2.3', range: '1.x', result: true },

  { version: '2.2.3', range: '<2.0.0', result: false },
  { version: '2.2.3', range: '=1.2.3', result: false },
  { version: '2.2.3', range: '>1.0.0 <2.0.0', result: false },
  { version: '2.2.3', range: '1.2.x', result: false },
  { version: '2.2.3', range: '1.x', result: false },
]

satisfiesData.forEach(item => {
  test(`satisfies(${item.version}, ${item.range})`, () => {
    const stdout = execFileSync(
      execPath,
      [join(__dirname, '..', 'lib', 'main.js')],
      {
        env: {
          INPUT_VERSION: item.version,
          INPUT_SATISFIES: item.range
        }
      }
    ).toString()

    if (item.result !== undefined) {
      expect(stdout).toContain(`::set-output name=satisfies::${item.result}`)
    } else {
      expect(stdout).not.toContain('satisfies')
    }
  })
})
