#!/usr/bin/env fish

function allow_or_exit
    set -l prompt "$argv[1]"
    if test -z "$prompt"
        set prompt "Continue?"
    end
    if not gum confirm "$prompt"
        echo "Aborting!"
        exit 0
    end
end

argparse \
    "platform=" "version=" "obsidian-version=" help \
    -- $argv
or return

if test -n "$_flag_help"
    echo "
Must be run from the 'main' branch.

Commits the current changes and tags the commit with the specified version.

EXAMPLE:
  bin/tag-release.fish --version 2.3.0 --obsidian-version 1.4.0

FLAGS:
  --version             The full version string for the release (e.g., 2.3.0). REQUIRED.
  --obsidian-version    The minimum obsidian version for this release. REQUIRED.
  --help                This usage description.
"
    exit 0
end

for cmd in git jq gum
    if not command -q "$cmd"
        echo "ERROR: $cmd is required"
        exit 1
    end
end

if test -z "$_flag_version"
    echo "ERROR: --version must be set, exiting"
    exit 1
end

if test -z "$_flag_obsidian_version"
    echo "ERROR: --obsidian-version must be set, exiting"
    exit 1
end

set git_branch (git branch --show-current)
if test "$git_branch" != main
    echo "ERROR: Must be on 'main' branch (currently on '$git_branch'), exiting"
    exit 1
end

if test (count (git status --porcelain)) -gt 0
    echo "ERROR: Working tree must be clean before a release"
    exit 1
end

set release_tag $_flag_version

allow_or_exit "New tag will be named '$release_tag', minimum Obsidian version is $_flag_obsidian_version."

echo "Updating package.json"
set TEMP_FILE (mktemp)
jq ".version |= \"$release_tag\"" package.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" package.json

echo "Updating manifest.json"
set TEMP_FILE (mktemp)
jq ".version |= \"$release_tag\" | .minAppVersion |= \"$_flag_obsidian_version\"" \
    manifest.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" manifest.json

echo "Updating versions.json"
set TEMP_FILE (mktemp)
jq ". += {\"$release_tag\": \"$_flag_obsidian_version\"}" \
    versions.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" versions.json

echo "Updating src/plugin-info.json & src/plugin-info.ts"
set TEMP_FILE (mktemp)
set DATE_NOW (date +%FT%T%z)
jq ".pluginVersion |= \"$release_tag\" | .pluginReleasedAt |= \"$DATE_NOW\"" \
    src/plugin-info.json >"$TEMP_FILE"; or exit 1
mv "$TEMP_FILE" src/plugin-info.json
echo -n "/* File will be overwritten by bin/release.sh! */
export const PLUGIN_INFO = " >src/plugin-info.ts
cat src/plugin-info.json >>src/plugin-info.ts

echo "Committing the following files with a message of '[REL] Release $release_tag':"
echo
git status --porcelain | sed -E "s/^/  /"
echo

allow_or_exit

git add package.json manifest.json versions.json src/plugin-info.json src/plugin-info.ts; or exit 1
git commit -m "[REL] Release $release_tag"; or exit 1
git tag "$release_tag"; or exit 1
echo "Done!"
echo

allow_or_exit "Now pushing the commit and tag to the remote …"

git push; or exit 1
git push --tags; or exit 1
echo "Done!"
echo
