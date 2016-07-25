## How to cut a release

**!!! Make sure documentation and changelog are up-to-date.**

To publish `next` version

```
npm version 1.0.0-beta.1
git push --follow-tags
npm publish https://github.com/jwarkentin/node-monkey/archive/v1.0.0-beta.1.tar.gz --tag next
```

To move from next to release

```
npm dist-tags add node-monkey@1.0.0-beta.1 latest
```

See [here](https://jbavari.github.io/blog/2015/10/16/using-npm-tags/) for more details on tagging releases.

Don't forget to publish the release on Github as well: https://github.com/jwarkentin/node-monkey/releases