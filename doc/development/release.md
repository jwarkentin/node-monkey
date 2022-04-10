# How to cut a release

> **IMPORTANT: Make sure documentation and changelog are up-to-date**

1. Do a production build:

    ```sh
    NODE_ENV=production npm run build
    ```

2. Draft the new release on Github: <https://github.com/jwarkentin/node-monkey/releases>

3. Publish to npm (defaults to `latest` tag):

    Just use the `do-release` script in the project root:

    ```sh
    $ ./do-release
    Enter the release type [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
    > patch
    ...
    ```

    These are the manual steps:

    ```sh
    npm version [major|minor|patch|<NEW VERSION>]
    git push --follow-tags
    npm publish https://github.com/jwarkentin/node-monkey/archive/refs/tags/v<NEW VERSION>.tar.gz
    ```

    > Note: See [here](https://jbavari.github.io/blog/2015/10/16/using-npm-tags/) for more details on tagging releases.
    >
    > Previousely the `next` tag was being used for pre-releases but currently there isn't enough demand for the added process complexity. If the community grows and needs better production guarantees and support it could be reinroduced.
