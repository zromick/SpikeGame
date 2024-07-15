# Spike Game

A game avoiding spikes and racking up a great score! More bonuses for reaching the other side and landong on colored spikes.

This app was developed with the help of [Claude Sonnet 3.5](https://claude.ai).

The server for this app was created using [Vite](https://vitejs.dev/guide/).
Specifically, this template: `npm create vite@latest spike-game -- --template react-swc-ts`

Enabled by gh-pages (configured in package.json at this homepage): https://zromick.github.io/SpikeGame

To see all of my projects: https://zromick.github.io

Also, check out this [gh-pages tutorial.](https://www.youtube.com/watch?v=Q9n2mLqXFpU&t=2m2s)

## Getting Started
First, install the NPM libraries.
  `npm install`

To run this project locally:
  `npm run start`

To deploy changes to the project:
  `npm run deploy`

# About React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
