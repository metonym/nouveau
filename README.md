# nouveau

[![NPM][npm]][npm-url]
[![Build][build]][build-badge]

> Old school Static Site Generator using Svelte and PostHTML.

`nouveau` enhances your static web pages with JavaScript by using Svelte. No JavaScript is generated if the Svelte markup is purely presentational.

## Install

```bash
yarn add -D nouveau
```

### 1) Folder structure

Create folders and `index.html` files in the `src` folder:

```bash
mkdir src
touch src/index.html
```

Your folder structure should look similar to this:

```bash
├── src
│   ├── index.html
│   └── [folder]/index.html
├── package.json
└── .gitignore
```

### 2) Content

Add the following to your `src/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <svelte>
      <script>
        let count = 0;
      </script>

      <button on:click="{() => { count += 1; }}">
        Increment the count: {count}
      </button>
    </svelte>
  </body>
</html>
```

### 3) Scripts

Add the following scripts to your `package.json`:

```json
// package.json
{
  "scripts": {
    "start": "nouveau --dev",
    "build": "nouveau"
  }
}
```

Run the following command in development:

```bash
yarn start
```

For production, use:

```bash
yarn build
```

## Customization

Customize the `entry` and `outDir` fields in your `package.json`:

```diff
"nouveau": {
  "entry": "src",
- "outDir": "public"
+ "outDir": "dist"
}
```

## License

[MIT](LICENSE)

[npm]: https://img.shields.io/npm/v/nouveau.svg?color=blue
[npm-url]: https://npmjs.com/package/nouveau
[build]: https://travis-ci.com/metonym/nouveau.svg?branch=master
[build-badge]: https://travis-ci.com/metonym/nouveau
