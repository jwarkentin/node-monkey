## How to cut a release

> **IMPORTANT: Make sure documentation and changelog are up-to-date**

To do a production build:

```sh
NODE_ENV=production npm run build
```

To publish `next` version:

```sh
npm version <NEW VERSION>
git push HEAD:master --follow-tags
npm publish --tag next
```

To release after confirming it works:

```sh
npm dist-tags add node-monkey@next latest
```

See [here](https://jbavari.github.io/blog/2015/10/16/using-npm-tags/) for more details on tagging releases.

Don't forget to publish the release on Github as well: <https://github.com/jwarkentin/node-monkey/releases>
