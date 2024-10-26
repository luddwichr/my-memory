# My memory

## What is the project about?

This project is a very simple implementation of the memory game

## TODO

- more sets
  - e.g. numbers and chars (A-Za-z0-9!?+-<>*/)
  - shapes with different colors (3-6 corners, round, star, etc.)
- add coloring for hover/pressed elements
- add aria-roles grid/row etc. (maybe switch to table layout?)
- invert logic of dark mode toggle?

## Use website locally

This project relies on `<script type=module>` which requires CORS.
Simply opening `index.html` locally in a browser would yield errors due to the used `file://` protocol.

To work around this limitation you need to run a local HTTP server that serves the content:

- Ensure you have Nodes.js/npm installed
- By executing the following command on the command line, you can start a local HTTP server on port 8080
- and open the website in your default browser: `npx -y http-server ./ -p 8080 -o`

## Licenses for images

- `images/traffic-signs`: see `images/traffic-signs/license-notes.txt` (not under license)
- `images/back-side.webp` was created with DALL-E 3 (i.e. not under license)