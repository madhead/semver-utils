import {execPath} from 'process'
import {execFileSync} from 'child_process'
import {join} from 'path'
import {parse, satisfies} from 'semver'
import {type} from 'os'

interface TestData {
  version: string
  compareTo?: string
  satisfies?: string
  identifier?: string
  lenient?: boolean
}

const data: TestData[] = [
  {version: 'Forty-two'},
  {version: 'Forty-two', lenient: true},
  {version: 'Forty-two', lenient: false},
  {version: '1.2'},
  {version: '1'},

  {version: '0.0.0', satisfies: ''},
  {version: '0.0.0', satisfies: '', identifier: 'alpha'},
  {version: '0.0.0', satisfies: '', identifier: 'alpha.0'},
  {version: '0.0.0', satisfies: '', identifier: 'alpha.beta'},
  {version: '0.0.0', compareTo: '0.0.0', satisfies: '*'},
  {version: '0.0.0', compareTo: '0.0'},
  {version: '0.0.0', compareTo: '0'},
  {version: '0.0.0', compareTo: ''},
  {version: '0.0.0', compareTo: 'Forty-two'},
  {version: '0.0.1'},
  {version: '0.0.1', compareTo: '0.0.2'},
  {version: '0.1.2'},
  {version: '0.1.2', compareTo: '0.2.0'},
  {version: '0.1.2', compareTo: '0.1.1'},
  {version: '1.2.3'},
  {version: '1.2.3', identifier: 'snapshot'},
  {version: '1.2.3', identifier: 'snapshot.alpha'},
  {version: '1.2.3', identifier: 'snapshot.0'},
  {version: '1.2.3', identifier: 'snapshot.1.2'},
  {version: '1.2.3', identifier: ''},
  {version: '1.2.3', identifier: ' '},
  {version: '1.2.3', identifier: '  '},
  {version: '1.2.3', compareTo: '1.2.3'},
  {version: '1.2.3', compareTo: '1.2.3+42'},
  {version: '1.2.3', compareTo: '1.2.3+42.24'},
  {version: '1.2.3', compareTo: '1.2.3-42'},
  {version: '1.2.3', compareTo: '1.2.3-42.24'},
  {version: '1.2.3', compareTo: '1.2.3-alpha'},
  {version: '1.2.3', compareTo: '1.2.3-beta'},
  {version: '1.2.3', compareTo: '1.2.4-alpha+3'},
  {version: '1.2.3', compareTo: '1.2.4'},
  {version: '1.2.3', compareTo: '1.3.0'},
  {version: '1.2.3', compareTo: '2.0.0'},
  {version: '1.2.3', compareTo: '1.2.2'},
  {version: '1.2.3', compareTo: '1.1.99'},
  {version: '1.2.3', compareTo: '0.99.99'},
  {version: '1.2.3', compareTo: ''},
  {version: '1.2.3', compareTo: '    '},
  {version: '1.2.3', compareTo: 'XXX'},
  {version: '1.2.3', satisfies: '>1.0.0'},
  {version: '1.2.3-alpha', satisfies: '>1.0.0'},
  {version: '1.2.3', satisfies: '<2.0.0'},
  {version: '1.2.3-alpha', satisfies: '<2.0.0'},
  {version: '1.2.3', satisfies: '>=1.2.3'},
  {version: '1.2.3-alpha', satisfies: '>=1.2.3'},
  {version: '1.2.3', satisfies: '<=1.2.3'},
  {version: '1.2.3-alpha', satisfies: '<=1.2.3'},
  {version: '1.2.3', satisfies: '=1.2.3'},
  {version: '1.2.3', satisfies: '>1.0.0 <2.0.0'},
  {version: '1.2.3', satisfies: '1.2.x'},
  {version: '1.2.3', satisfies: '1.x'},
  {version: '2.2.3', satisfies: '<2.0.0'},
  {version: '2.2.3', satisfies: '<=2.0.0'},
  {version: '2.2.3', satisfies: '=1.2.3'},
  {version: '2.2.3', satisfies: '>1.0.0 < 2.0.0'},
  {version: '2.2.3', satisfies: '1.2.x'},
  {version: '2.2.3', satisfies: '1.x'},
  {version: '2.2.3', satisfies: ''},
  {version: '2.2.3', satisfies: ' '},
  {version: '2.2.3', satisfies: '  '},
  {version: '2.2.3', satisfies: 'XXX'},
  {version: '1.2.3+alpha'},
  {version: '1.2.3+alpha.beta'},
  {version: '1.2.3+42'},
  {version: '1.2.3+42.24'},
  {version: '1.2.3-alpha'},
  {version: '1.2.3-alpha.beta'},
  {version: '1.2.3-42'},
  {version: '1.2.3-42.24'},
  {version: '1.2.3-alpha+42.24'},
  {version: '1.2.3-alpha.beta+123456'},
  {version: '1.2.3-42+24'},
  {version: '1.2.3-42.24+24.42'},
  {version: '1.2.3-alpha.gamma+4.5.6', satisfies: '1.x'}
]

function validate(env: NodeJS.ProcessEnv, validate: (stdout: string) => void) {
  try {
    validate(
      execFileSync(execPath, [join(__dirname, '..', 'lib', 'main.js')], {
        env: env
      }).toString()
    )
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

    test(`parse(${item.version} (lenient: ${env['INPUT_LENIENT']})`, () => {
      validate(env, (stdout: string) => {
        const parsedVersion = parse(item.version)
        if (parsedVersion) {
          expect(stdout).toContain(`::set-output name=release::${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`)
          expect(stdout).toContain(`::set-output name=major::${parsedVersion.major}`)
          expect(stdout).toContain(`::set-output name=minor::${parsedVersion.minor}`)
          expect(stdout).toContain(`::set-output name=patch::${parsedVersion.patch}`)
          if (parsedVersion.build.length > 0) {
            expect(stdout).toContain(`::set-output name=build::${parsedVersion.build.join('.')}`)
            expect(stdout).toContain(`::set-output name=build-parts::${parsedVersion.build.length}`)
            parsedVersion.build.forEach((buildPart, index) => {
              ;`::set-output name=build-${index}::${buildPart}`
            })
          }
          if (parsedVersion.prerelease.length > 0) {
            expect(stdout).toContain(`::set-output name=prerelease::${parsedVersion.prerelease.join('.')}`)
            expect(stdout).toContain(`::set-output name=prerelease-parts::${parsedVersion.prerelease.length}`)
            parsedVersion.build.forEach((prereleasePart, index) => {
              ;`::set-output name=prerelease-${index}::${prereleasePart}`
            })
          }
        } else {
          expect(stdout).not.toContain(`::set-output name=release::`)
          expect(stdout).not.toContain(`::set-output name=major::`)
          expect(stdout).not.toContain(`::set-output name=minor::`)
          expect(stdout).not.toContain(`::set-output name=patch::`)
          expect(stdout).not.toContain(`::set-output name=build`)
          expect(stdout).not.toContain(`::set-output name=prerelease`)
        }
      })
    })
  })
})

describe('compare', () => {
  data.forEach(item => {
    if (item.compareTo !== undefined) {
      test(`compare(${item.version}, ${item.compareTo})`, () => {
        validate(
          {
            INPUT_VERSION: item.version,
            'INPUT_COMPARE-TO': item.compareTo
          },
          (stdout: string) => {
            if (item.compareTo) {
              const parsedCompareTo = parse(item.compareTo)

              if (parsedCompareTo) {
                if (parsedCompareTo.compare(item.version) === 0) {
                  expect(stdout).toContain(`::set-output name=comparison-result::=`)
                } else if (parsedCompareTo.compare(item.version) === -1) {
                  expect(stdout).toContain(`::set-output name=comparison-result::>`)
                } else if (parsedCompareTo.compare(item.version) === 1) {
                  expect(stdout).toContain(`::set-output name=comparison-result::<`)
                }
              }
            } else {
              expect(stdout).not.toContain(`::set-output name=comparison-result::`)
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
      test(`satisfies(${item.version}, ${item.satisfies})`, () => {
        validate(
          {
            INPUT_VERSION: item.version,
            INPUT_SATISFIES: item.satisfies
          },
          (stdout: string) => {
            const parsedVersion = parse(item.version)

            if (parsedVersion && item.satisfies?.trim() !== '') {
              if (satisfies(parsedVersion, item.satisfies!!)) {
                expect(stdout).toContain(`::set-output name=satisfies::true`)
              } else {
                expect(stdout).toContain(`::set-output name=satisfies::false`)
              }
            } else {
              expect(stdout).not.toContain(`::set-output name=satisfies::`)
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
      test(`inc(${item.version}, ${item.identifier})`, () => {
        validate(
          {
            INPUT_VERSION: item.version,
            INPUT_IDENTIFIER: item.identifier
          },
          (stdout: string) => {
            let identifier = undefined

            if (item.identifier?.trim() !== '') {
              identifier = item.identifier
            }

            expect(stdout).toContain(`::set-output name=inc-major::${parse(item.version)?.inc('major', identifier).format()}`)
            expect(stdout).toContain(`::set-output name=inc-premajor::${parse(item.version)?.inc('premajor', identifier).format()}`)
            expect(stdout).toContain(`::set-output name=inc-minor::${parse(item.version)?.inc('minor', identifier).format()}`)
            expect(stdout).toContain(`::set-output name=inc-preminor::${parse(item.version)?.inc('preminor', identifier).format()}`)
            expect(stdout).toContain(`::set-output name=inc-patch::${parse(item.version)?.inc('patch', identifier).format()}`)
            expect(stdout).toContain(`::set-output name=inc-prepatch::${parse(item.version)?.inc('prepatch', identifier).format()}`)
            expect(stdout).toContain(`::set-output name=inc-prerelease::${parse(item.version)?.inc('prerelease', identifier).format()}`)
          }
        )
      })
    }
  })
})
