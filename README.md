<p align="center">
  <a href="https://github.com/madhead/semver-utils/actions">
    <img alt="madhead/semver-utils status" src="https://github.com/madhead/semver-utils/actions/workflows/default.yml/badge.svg">
  </a>
</p>

# madhead/semver-utils

One-stop shop for working with semantic versions in your GitHub Actions workflows.
A wrapper around [semver](https://www.npmjs.com/package/semver), so read [its docs](https://github.com/npm/node-semver#functions) to know more about supported operations.

## Usage

```yml
- uses: madhead/semver-utils@latest
  id: version
  with:
    # A version to work with
    version: 1.2.3+42.24

    # A version to compare against
    compare-to: 2.1.0

    # A range to check against
    satisfies: 1.x
- run: |
    echo "${{ steps.version.outputs.release }}"           # 1.2.3
    echo "${{ steps.version.outputs.major }}"             # 1
    echo "${{ steps.version.outputs.minor }}"             # 2
    echo "${{ steps.version.outputs.patch }}"             # 3
    echo "${{ steps.version.outputs.build }}"             # 42.24
    echo "${{ steps.version.outputs.build-parts }}"       # 2
    echo "${{ steps.version.outputs.build-0 }}"           # 42
    echo "${{ steps.version.outputs.build-1 }}"           # 24
    echo "${{ steps.version.outputs.comparison-result }}" # <
    echo "${{ steps.version.outputs.satisfies }}"         # true
    echo "${{ steps.version.outputs.inc-major }}"         # 2.0.0
    echo "${{ steps.version.outputs.inc-premajor }}"      # 2.0.0-0
    echo "${{ steps.version.outputs.inc-minor }}"         # 1.3.0
    echo "${{ steps.version.outputs.inc-preminor }}"      # 1.3.0-0
    echo "${{ steps.version.outputs.inc-patch }}"         # 1.2.4
    echo "${{ steps.version.outputs.inc-prepatch }}"      # 1.2.4-0
    echo "${{ steps.version.outputs.inc-prerelease }}"    # 1.2.4-0
```

If the version cannot be parsed, all the outputs [will be equal to an empty string](.github/workflows/default.yml#L27-L35), unless `lenient` is set to `false` explicitly.
If `lenient` is `false`, the action [will fail](.github/workflows/default.yml#L18-L25).

```yml
- uses: madhead/semver-utils@latest
  id: lenient
  with:
    version: invalid
- run: |
    echo "${{ steps.lenient.outputs.release }}"           # (empty string)

- uses: madhead/semver-utils@latest
  id: strict
  with:
    version: invalid
    lenient: false
  continue-on-error: true                                 # failure is expected and acceptable for this example
- run: |
    echo "${{ steps.strict.outcome }}"                    # failure
```

To see the list of available versions (`latest` in the example above), navigate to the [Releases & Tags](https://github.com/madhead/semver-utils/tags) page of this repo.
Whenever a new version is released, corresponding tags are created / updated.
`latest` tag always points to the latest release (i.e. it's the same as using `main` branch).
There are also `$major` and `$major.$minor` tags pointing to the latest matching version (i.e. tag `1` always points to the latest `1.x` version, and tag `1.1` — to the latest `1.1.x` version).

To learn more the inputs / outpus look at the comprehensive test suit: [`main.test.ts`](__tests__/main.test.ts).

To see this action… in action check its integration test: [`default.yml`](.github/workflows/default.yml).

See how this action uses itself to check if a PR to the `main` branch increments the version: [`pr_main.yml`](.github/workflows/pr_main.yml).
