<p align="center">
  <a href="https://github.com/madhead/semver/actions">
    <img alt="madhead/semver status" src="https://github.com/actions/madhead/semver/default/badge.svg">
  </a>
</p>

# madhead/semver

One-stop shop for working with semantic versions in your GitHub Actions workflows.

## Usage

```yml
- uses: madhead/semver@latest
  id: version
  with:
    # A version to work with
    version: 1.2.3

    # A version to compare against
    compare-to: 2.1.0
- run: |
    echo "${{ steps.version.outputs.major }}"             # 1
    echo "${{ steps.version.outputs.minor }}"             # 2
    echo "${{ steps.version.outputs.patch }}"             # 3
    echo "${{ steps.version.outputs.comparison-result }}" # <
```

If any of the inputs (`version` or `compare-to`) cannot be parsed, it is just silently ignored. This action tries its best not to fail.
