<p align="center">
  <a href="https://github.com/madhead/semver-utils/actions">
    <img alt="madhead/semver-utils status" src="https://github.com/madhead/semver-utils/actions/workflows/default.yml/badge.svg">
  </a>
</p>

# madhead/semver-utils

One-stop shop for working with semantic versions in your GitHub Actions workflows.

## Usage

```yml
- uses: madhead/semver-utils@latest
  id: version
  with:
    # A version to work with
    version: 1.2.3

    # A version to compare against
    compare-to: 2.1.0

    # A range to check agains
    satisfies: 1.x
- run: |
    echo "${{ steps.version.outputs.major }}"             # 1
    echo "${{ steps.version.outputs.minor }}"             # 2
    echo "${{ steps.version.outputs.patch }}"             # 3

    echo "${{ steps.version.outputs.comparison-result }}" # <

    echo "${{ steps.version.outputs.satisfies }}"         # true
```

If any of the inputs cannot be parsed, it is just silently ignored.
This action tries its best not to fail.

See how this action uses itself to check if a PR to main increments the version: [`pr_main.yml`](.github/workflows/pr_main.yml)
