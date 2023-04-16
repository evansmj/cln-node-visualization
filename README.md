# Create CoreLN App

This is a simple boilerplate repo that can be a good starting point for building a web app that connects directly to CoreLN nodes via the encrypted Lightning Network messaging protocol. It uses [Lnmessage](https://github.com/aaronbarnardsound/lnmessage) to establish a websocket connection via a direct connection if a [WS port is exposed](https://docs.corelightning.org/reference/lightningd-config#experimental-options) on the node. Alternatively it can be modified to connect via a trustless WS -> TCP proxy for production deploys.

The frontend tech stack uses [Sveltekit](https://kit.svelte.dev), a web framework built around [Svelte](https://svelte.dev) that can be configured as a [Single Page](https://kit.svelte.dev/docs/glossary#spa) or [Server Side Rendered](https://kit.svelte.dev/docs/glossary#ssr) app or anywhere in between.

TypeScript is configured to enforce types.

I have added a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) with just the basic Svelte recommended offline caching setup as well as a manifest file to make it a [Progressive Web App](https://web.dev/progressive-web-apps/).

For styling [Tailwind CSS](https://tailwindcss.com/) has been added which makes styling and theming pretty easy.

[Playwright](https://playwright.dev/) and [Vite test](https://vitest.dev/) have been setup for testing.

Linting and code formatting are setup with [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) and can be modified as needed.

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
