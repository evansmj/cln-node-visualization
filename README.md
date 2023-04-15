# Create CoreLN App

This is a simple boilerplate repo that can be a good starting point for building a web app that connects directly to CoreLN nodes via the encrypted Lightning Network messaging protocol. It uses [Lnmessage]() to establish a websocket connection via a direct connection if a [WS port is exposed]() on the node. Alternatively it can be modified to connect via a trustless WS -> TCP proxy for production deploys.

The frontend tech stack uses [Sveltekit](), a web framework built around [Svelte]() that can be configured as a [Single Page]() or [Server Side Rendered]() app or anywhere in between.

TypeScript is configured to enforce types.

I have added a [service worker]() with just the basic Svelte recommended offline caching setup as well as a manifest file to make it a [Progressive Web App]().

For styling [Tailwind CSS]() has been added which makes styling and theming pretty easy.

[Playwright]() and [Vite test]() have been setup for testing.

Linting and code formatting are setup with [EsLint]() and [Prettier]() and can be modified as needed.

## Get started

1. Clone (or Fork) the repo

```bash
git clone https://github.com/aaronbarnardsound/create-coreln-app.git
cd create-core-ln-app
```

2. Install the dependencies

```bash
npm i
```

3. Start the app in dev mode

```bash
npm run dev
```

4. Open up [http://localhost:5173](http://localhost:5371) in your browser
