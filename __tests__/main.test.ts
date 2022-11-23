import { execFile } from 'child_process'
import { readFile } from 'fs/promises'
import os from 'os'
import { join } from 'path'
import { execPath } from 'process'
import { diff, parse, satisfies, sort } from 'semver'
import { FileResult, fileSync as tmpFile } from 'tmp'
import { promisify } from 'util'

const exec = promisify(execFile)

interface TestData {
  version: string
  compareTo?: string
  diffWith?: string
  satisfies?: string
  identifier?: string
  lenient?: boolean
}

const data: TestData[] = [
  { version: 'Forty-two' },
  { version: 'Forty-two', lenient: true },
  { version: 'Forty-two', lenient: false },
  { version: '1.2' },
  { version: '1' },

  { version: '0.0.0', satisfies: '' },
  { version: '0.0.0', satisfies: '', identifier: 'alpha' },
  { version: '0.0.0', satisfies: '', identifier: 'alpha.0' },
  { version: '0.0.0', satisfies: '', identifier: 'alpha.beta' },
  { version: '0.0.0', compareTo: '0.0.0', satisfies: '*' },
  { version: '0.0.0', compareTo: '0.0' },
  { version: '0.0.0', compareTo: '0' },
  { version: '0.0.0', compareTo: '' },
  { version: '0.0.0', compareTo: 'Forty-two' },
  { version: '0.0.1' },
  { version: '0.0.1', compareTo: '0.0.2' },
  { version: '0.1.2' },
  { version: '0.1.2', compareTo: '0.2.0' },
  { version: '0.1.2', compareTo: '0.1.1' },
  { version: '1.2.3' },
  { version: '1.2.3', identifier: 'snapshot' },
  { version: '1.2.3', identifier: 'snapshot.alpha' },
  { version: '1.2.3', identifier: 'snapshot.0' },
  { version: '1.2.3', identifier: 'snapshot.1.2' },
  { version: '1.2.3', identifier: '' },
  { version: '1.2.3', identifier: ' ' },
  { version: '1.2.3', identifier: '  ' },
  { version: '1.2.3', compareTo: '1.2.3', diffWith: '1.2.4' },
  { version: '1.2.3', compareTo: '1.2.3', diffWith: '1.3.0' },
  { version: '1.2.3', compareTo: '1.2.3', diffWith: '2.0.0' },
  { version: '1.2.3', compareTo: '1.2.3+42' },
  { version: '1.2.3', compareTo: '1.2.3+42.24' },
  { version: '1.2.3', compareTo: '1.2.3-42' },
  { version: '1.2.3', compareTo: '1.2.3-42.24' },
  { version: '1.2.3', compareTo: '1.2.3-alpha' },
  { version: '1.2.3', compareTo: '1.2.3-beta' },
  { version: '1.2.3', compareTo: '1.2.4-alpha+3' },
  { version: '1.2.3', compareTo: '1.2.4' },
  { version: '1.2.3', compareTo: '1.3.0' },
  { version: '1.2.3', compareTo: '2.0.0' },
  { version: '1.2.3', compareTo: '1.2.2' },
  { version: '1.2.3', compareTo: '1.1.99' },
  { version: '1.2.3', compareTo: '0.99.99' },
  { version: '1.2.3', compareTo: '' },
  { version: '1.2.3', compareTo: '    ' },
  { version: '1.2.3', diffWith: '1.2.4' },
  { version: '1.2.3', diffWith: '1.3.0' },
  { version: '1.2.3', diffWith: '2.0.0' },
  { version: '2.0.0', diffWith: '1.2.3' },
  { version: '2.0.0', diffWith: '1.3.0' },
  { version: '1.2.3', diffWith: '1.2.3-alpha' },
  { version: '1.2.3', diffWith: '1.2.4-alpha' },
  { version: '1.2.3-alpha', diffWith: '1.2.3' },
  { version: '1.2.4-alpha', diffWith: '1.2.3' },
  { version: '1.2.3', diffWith: '1.2.3+42' },
  { version: '1.2.3+42', diffWith: '1.2.3' },
  { version: '1.2.3', diffWith: '1.2.4+42' },
  { version: '1.2.4+42', diffWith: '1.2.3' },
  { version: '1.2.3', diffWith: '1.3.0+42' },
  { version: '1.3.0+42', diffWith: '1.2.3' },
  { version: '1.3.0+42', diffWith: '' },
  { version: '1.3.0+42', diffWith: '             ' },
  { version: '1.2.3', compareTo: 'XXX' },
  { version: '1.2.3', satisfies: '>1.0.0' },
  { version: '1.2.3-alpha', satisfies: '>1.0.0' },
  { version: '1.2.3', satisfies: '<2.0.0' },
  { version: '1.2.3-alpha', satisfies: '<2.0.0' },
  { version: '1.2.3', satisfies: '>=1.2.3' },
  { version: '1.2.3-alpha', satisfies: '>=1.2.3' },
  { version: '1.2.3', satisfies: '<=1.2.3' },
  { version: '1.2.3-alpha', satisfies: '<=1.2.3' },
  { version: '1.2.3', satisfies: '=1.2.3' },
  { version: '1.2.3', satisfies: '>1.0.0 <2.0.0' },
  { version: '1.2.3', satisfies: '1.2.x' },
  { version: '1.2.3', satisfies: '1.x' },
  { version: '2.2.3', satisfies: '<2.0.0' },
  { version: '2.2.3', satisfies: '<=2.0.0' },
  { version: '2.2.3', satisfies: '=1.2.3' },
  { version: '2.2.3', satisfies: '>1.0.0 < 2.0.0' },
  { version: '2.2.3', satisfies: '1.2.x' },
  { version: '2.2.3', satisfies: '1.x' },
  { version: '2.2.3', satisfies: '' },
  { version: '2.2.3', satisfies: ' ' },
  { version: '2.2.3', satisfies: '  ' },
  { version: '2.2.3', satisfies: 'XXX' },
  { version: '1.2.3+alpha' },
  { version: '1.2.3+alpha.beta' },
  { version: '1.2.3+42' },
  { version: '1.2.3+42.24' },
  { version: '1.2.3-alpha' },
  { version: '1.2.3-alpha.beta' },
  { version: '1.2.3-42' },
  { version: '1.2.3-42.24' },
  { version: '1.2.3-alpha+42.24' },
  { version: '1.2.3-alpha.beta+123456' },
  { version: '1.2.3-42+24' },
  { version: '1.2.3-42.24+24.42' },
  { version: '1.2.3-alpha.gamma+4.5.6', satisfies: '1.x' }
]

async function validate(env: NodeJS.ProcessEnv, validate: (githubOutput: FileResult) => Promise<void>) {
  try {
    const githubOutput = tmpFile()

    await exec(execPath, [join(__dirname, '..', 'lib', 'main.js')], {
      env: {
        ...env,
        GITHUB_OUTPUT: githubOutput.name
      }
    })
    await validate(githubOutput)
  } catch (e: any) {
    expect(env).toHaveProperty('INPUT_LENIENT', 'false')
  }
}

describe('parse', () => {
  data.forEach(item => {
    const env: NodeJS.ProcessEnv = {
      INPUT_VERSION: item.version
    }

    if (item.lenient === false) {
      env['INPUT_LENIENT'] = 'false'
    }

    test(`parse(${item.version} (lenient: ${env['INPUT_LENIENT']})`, async () => {
      await validate(env, async (githubOutput: FileResult) => {
        const output = await readFile(githubOutput.name, 'utf8')
        const parsedVersion = parse(item.version)

        if (parsedVersion) {
          expect(output).toMatch(
            new RegExp(`release<<.+${os.EOL}${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}${os.EOL}`)
          )
          expect(output).toMatch(new RegExp(`major<<.+${os.EOL}${parsedVersion.major}${os.EOL}`))
          expect(output).toMatch(new RegExp(`minor<<.+${os.EOL}${parsedVersion.minor}${os.EOL}`))
          expect(output).toMatch(new RegExp(`patch<<.+${os.EOL}${parsedVersion.patch}${os.EOL}`))
          if (parsedVersion.build.length > 0) {
            expect(output).toMatch(new RegExp(`build<<.+${os.EOL}${parsedVersion.build.join('.')}${os.EOL}`))
            expect(output).toMatch(new RegExp(`build-parts<<.+${os.EOL}${parsedVersion.build.length}${os.EOL}`))
            parsedVersion.build.forEach((buildPart, index) => {
              expect(output).toMatch(new RegExp(`build-${index}<<.+${os.EOL}${buildPart}${os.EOL}`))
            })
          }
          if (parsedVersion.prerelease.length > 0) {
            expect(output).toMatch(new RegExp(`prerelease<<.+${os.EOL}${parsedVersion.prerelease.join('.')}${os.EOL}`))
            expect(output).toMatch(new RegExp(`prerelease-parts<<.+${os.EOL}${parsedVersion.prerelease.length}${os.EOL}`))
            parsedVersion.build.forEach((prereleasePart, index) => {
              expect(output).toMatch(new RegExp(`build-${index}<<.+${os.EOL}${prereleasePart}${os.EOL}`))
            })
          }
        } else {
          expect(output).not.toMatch(new RegExp(`release<<.+${os.EOL}.+${os.EOL}`))
          expect(output).not.toMatch(new RegExp(`major<<.+${os.EOL}.+${os.EOL}`))
          expect(output).not.toMatch(new RegExp(`minor<<.+${os.EOL}.+${os.EOL}`))
          expect(output).not.toMatch(new RegExp(`patch<<.+${os.EOL}.+${os.EOL}`))
          expect(output).not.toMatch(new RegExp(`build<<.+${os.EOL}.+${os.EOL}`))
          expect(output).not.toMatch(new RegExp(`prerelease<<.+${os.EOL}.+${os.EOL}`))
        }

        expect(output).not.toMatch(new RegExp(`comparison-result`))
        expect(output).not.toMatch(new RegExp(`diff-result`))
      })
    })
  })
})

describe('compare', () => {
  data.forEach(item => {
    if (item.compareTo !== undefined) {
      test(`compare(${item.version}, ${item.compareTo})`, async () => {
        await validate(
          {
            INPUT_VERSION: item.version,
            'INPUT_COMPARE-TO': item.compareTo,
            'INPUT_DIFF-WITH': item.diffWith
          },
          async (githubOutput: FileResult) => {
            const output = await readFile(githubOutput.name, 'utf8')

            if (item.compareTo) {
              const parsedCompareTo = parse(item.compareTo)

              if (parsedCompareTo) {
                if (parsedCompareTo.compare(item.version) === 0) {
                  expect(output).toMatch(new RegExp(`comparison-result<<.+${os.EOL}=${os.EOL}`))
                } else if (parsedCompareTo.compare(item.version) === -1) {
                  expect(output).toMatch(new RegExp(`comparison-result<<.+${os.EOL}>${os.EOL}`))
                } else if (parsedCompareTo.compare(item.version) === 1) {
                  expect(output).toMatch(new RegExp(`comparison-result<<.+${os.EOL}<${os.EOL}`))
                }

                if (item.diffWith) {
                  expect(output).toMatch(new RegExp(`diff-result<<.+${os.EOL}${diff(item.version, item.diffWith) || ''}${os.EOL}`))
                } else {
                  expect(output).toMatch(new RegExp(`diff-result<<.+${os.EOL}${diff(item.version, item.compareTo) || ''}${os.EOL}`))
                }
              }
            } else {
              expect(output).not.toMatch(new RegExp(`comparison-result<<.+${os.EOL}.+${os.EOL}`))
            }
          }
        )
      })
    }
  })
})

describe('diff', () => {
  data.forEach(item => {
    if (item.diffWith !== undefined) {
      test(`diff(${item.version}, ${item.diffWith})`, async () => {
        await validate(
          {
            INPUT_VERSION: item.version,
            'INPUT_DIFF-WITH': item.diffWith
          },
          async (githubOutput: FileResult) => {
            const output = await readFile(githubOutput.name, 'utf8')

            if (item.diffWith) {
              const parsedDiffTo = parse(item.diffWith)

              if (parsedDiffTo) {
                expect(output).toMatch(new RegExp(`diff-result<<.+${os.EOL}${diff(item.version, parsedDiffTo) || ''}${os.EOL}`))
              }
            } else {
              expect(output).not.toMatch(new RegExp(`diff-result<<.+${os.EOL}.+${os.EOL}`))
            }
          }
        )
      })
    }
  })
})

describe('satisfies', () => {
  data.forEach(item => {
    if (item.satisfies !== undefined) {
      test(`satisfies(${item.version}, ${item.satisfies})`, async () => {
        await validate(
          {
            INPUT_VERSION: item.version,
            INPUT_SATISFIES: item.satisfies
          },
          async (githubOutput: FileResult) => {
            const output = await readFile(githubOutput.name, 'utf8')
            const parsedVersion = parse(item.version)

            if (parsedVersion && item.satisfies?.trim() !== '') {
              if (satisfies(parsedVersion, item.satisfies!!)) {
                expect(output).toMatch(new RegExp(`satisfies<<.+${os.EOL}true${os.EOL}`))
              } else {
                expect(output).toMatch(new RegExp(`satisfies<<.+${os.EOL}false${os.EOL}`))
              }
            } else {
              expect(output).not.toMatch(new RegExp(`satisfies<<.+${os.EOL}.+${os.EOL}`))
            }
          }
        )
      })
    }
  })
})

describe('inc', () => {
  data.forEach(item => {
    if (item.identifier !== undefined) {
      test(`inc(${item.version}, ${item.identifier})`, async () => {
        await validate(
          {
            INPUT_VERSION: item.version,
            INPUT_IDENTIFIER: item.identifier
          },
          async (githubOutput: FileResult) => {
            const output = await readFile(githubOutput.name, 'utf8')
            let identifier: string | undefined = undefined

            if (item.identifier?.trim() !== '') {
              identifier = item.identifier
            }
            expect(output).toMatch(new RegExp(`inc-major<<.+${os.EOL}${parse(item.version)?.inc('major', identifier).format()}${os.EOL}`))
            expect(output).toMatch(
              new RegExp(`inc-premajor<<.+${os.EOL}${parse(item.version)?.inc('premajor', identifier).format()}${os.EOL}`)
            )
            expect(output).toMatch(new RegExp(`inc-minor<<.+${os.EOL}${parse(item.version)?.inc('minor', identifier).format()}${os.EOL}`))
            expect(output).toMatch(
              new RegExp(`inc-preminor<<.+${os.EOL}${parse(item.version)?.inc('preminor', identifier).format()}${os.EOL}`)
            )
            expect(output).toMatch(new RegExp(`inc-patch<<.+${os.EOL}${parse(item.version)?.inc('patch', identifier).format()}${os.EOL}`))
            expect(output).toMatch(
              new RegExp(`inc-prepatch<<.+${os.EOL}${parse(item.version)?.inc('prepatch', identifier).format()}${os.EOL}`)
            )
            expect(output).toMatch(
              new RegExp(`inc-prerelease<<.+${os.EOL}${parse(item.version)?.inc('prerelease', identifier).format()}${os.EOL}`)
            )
          }
        )
      })
    }
  })
})
