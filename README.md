# Demo

![test](https://user-images.githubusercontent.com/431442/94356002-128cc880-00bc-11eb-9fb9-9ccaf37b3e56.gif)


# Running

## API

```sh
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

## Tests

Integration tests written with [React Testing
Library](https://github.com/testing-library/react-testing-library) can be
found in `App.test.tsx`. They closely resemble how a user would interact with
the application (versus having unit tests that cover implementation details).

To run them:

```sh
cd frontend/
yarn test
```

# Review guide

- The code related to sidebar (node tree and search) are all in `App.tsx`
- Search results (highlighting) implementation in `components/SearchResults.tsx`
- Detail view (template strings) implementation is in `components/Details.tsx`
- Integration tests are all in `App.test.tsx`
- Styles in `index.css`

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
- I updated the `/search` endpoint to return the contents of matched nodes to
avoid separate requests to fetch content data for each matched nodes.
- Search requests are debounced (using lodash-es for smaller bundle size) so
they only fire when the user stops typing for more than 500ms as opposed to firing on each keystroke.
- Blank strings don't trigger search requests (API returns 400 errors
for this too)

## Challenge 3: Content template strings

- My implementation is a simple process:
   1. Check if there are variables in the content (just render it with a `<p/>` if there's none)
   2. For each variable, add the string before it to the array of
   `React.Nodes` to render and build a `<Variable />` component that displays
   the value of the corresponding variable from the context (fetched
   variables) or its default value
   3. Add any leftover string after the last variable to the array of
   `React.Node`s

   The resulting `<Template />` component is memoized to avoid unnecessary
   re-renders when given the same context object.
- If there are a lot of variables the API endpoint could be improved by
having it accept a list of variable ids to return. The frontend could then
determine in advance which variables it needs and request only for those.

# Areas of improvement

I've pointed out some areas of improvement in the Implementation details
section but here are some more that I would have tackled to make the app
production-ready if I had more time

1. Improve UX by handling UI states (empty, loading and error, etc.).
2. Have e2e tests for critical user flows in addition to integration tests
3. Improve application performance by caching assets, minimizing bundle size
as much as possible (code-splitting, image optimization, run lighthouse audit
to see performance problems and fix them), etc.
4. Improve Accessibility. Admittedly, my experience with this is limited to
creating responsive apps, using semantic HTML, having labels for form inputs
and other common accessibility best practices. Making the app keyboard
accessible, good color contrast, and having support for screen-readers would
be a good improvement path.
5. Clean up code. Some components have been extracted to their own modules
for maintainability and loose-coupling but there's a lot of room for
improvement. `<App />`, for example, is doing a lot (sidebar node tree,
search) so I would clean this up and have separate components and move other
unrelated code to their own modules (e.g. helper functions to utils.ts).
