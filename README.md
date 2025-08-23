# Codepen

### Features

-   TypeScript on both the frontend and backend
-   Express server
-   File-based routing
-   HMR via Vite

### Description

It consists of a client and a server directory. The server is hooked up with Vite to provide HMR. The client is where you add your pens/pages.

You can use the following script to quickly add a new page:

```bash
npm run add-page {page-name}
```

This then adds a directory {page-name} into `src/client/pages` and initialises it with the following:

-   index.html
-   style.css
-   script.ts

This project uses file-based routing based on the `src/client/pages` directory, so any directory inside of that one becomes a route, i.e. `src/client/pages/dashboard` will then be accessible at `localhost:3000/dashboard` as long as there is an `index.html` file in that directory.

By default, the root page http://localhost:3000/ shows you the current pages that you have created and provides a link to each one.
