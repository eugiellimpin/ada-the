# Running

## API

```
cd api/
yarn install
yarn start
```

## Frontend application

```sh
cd frontend/
yarn install
yarn start
```

This should automatically open `localhost:3000` in your default browser.

# Implementation details

## Challenge 1: Sidebar

- I limited the node tree depth to 2 consciously after I noticed the some
nodes are connected in a cyclical manner (the app sketch also shows the same
number tree depth). This has the disadvantage that the user would need to
click a top-level node when they get to the leaves of the tree since these
leaves don't open to show further connections. If the user should be able to
open nodes without limit I don't think a tree UI would be appropriate.
- If there are a lot of nodes that needs to be displayed in the sidebar (more
than, say, 200vh) a "Load more" mechanism would be useful.
- All text contents are sanitized with
[DOMPurify](https://www.npmjs.com/package/dompurify) and URLs (image src)
with [@braintree/sanitize-url](https://github.com/braintree/sanitize-url) to
avoid XSS attacks

## Challenge 2: Search

- Like the decision to use existing open source libraries to avoid XSS
attacks above I opted to do the same to highlight search terms (using a
[mark.js](https://www.npmjs.com/package/mark.js) lib fork,
[mark.ts](https://www.npmjs.com/package/mark.ts)). Most of the time I would
prefer to use a pre-existing solution (don't reinvent the wheel) instead of
building from scratch unless nothing exists for the intended use case. Open
source has a lot of advantages over a custom solution–most issues have been
reported by the users and most probably fixed if the lib is popular enough,
less maintenance, battle-tested, etc.
If had to do it from scratch I would probably have the same
solution as the one for Challenge 3: Content template strings
- I updated the /search endpoint to return the contents of matches nodes to
avoid separate requests to fetch content data for each matches nodes.
- Search requests are debounced (using lodash-es for smaller bundle size) so
they only fire when the user stops typing for more than 500ms as opposed to firing on each keystroke.
- Blank strings don't trigger search requests (API returns 400 errors
for this too)

## Challenge 3: Content template strings