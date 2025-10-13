# My memory

## What is the project about?

This project is a simple implementation of the memory game

## TODO

- more sets
  - e.g. numbers and chars (A-Za-z0-9!?+-<>*/)
  - shapes with different colors (3-6 corners, round, star, etc.)
- add a score counter (how many guesses were needed to find all pairs)
- add coloring for hover/pressed/touched elements
- disable buttons for face-up cards
- add aria-roles grid/row etc. (maybe switch to table layout?)
- in landscape viewport content scrolls vertically instead of scaling down
- add github link to repo
- show party image in success message box
- show error icon in error box
- provide translations

## Use website locally

This project relies on `<script type=module>` which requires CORS.
Simply opening `index.html` locally in a browser would yield errors due to the used `file://` protocol.

One way to work around this limitation is to run a local HTTP server that serves the website content:

- Ensure you have Nodes.js/npm installed
- Run `npx -y http-server ./ -p 8080 -o` on the command line to start a local HTTP server on port 8080 and open the
  website in your default browser (alternatively, simply run `scripts/start-local-server.sh`)

## Licenses for images

- `images/traffic-signs`: see `images/traffic-signs/license-notes.txt` (not under license)
- `images/back-side.webp` was created with DALL-E 3 (i.e., not under license)