# Gianna Framework

> ⚠️ **Warning**
>
> Gianna Framework is under active development. Internal APIs and behavior may change frequently. If something worked yesterday but stops working after an update, the framework core has likely changed and your application may require adjustments.

---

# What is Gianna Framework?

**Gianna Framework** is a JavaScript framework designed to simplify and accelerate frontend application logic development.

Its primary goal is to act as the application's core shell, managing its lifecycle and internal processes. Visual design and styling are intentionally left to the developer.

---

# Why was this project created?

The project started as an experiment and a way to improve programming skills. Over time, it evolved into a more mature framework and became publicly available on GitHub.

---

# Features

Currently, Gianna Framework provides:

- XML-based templates (`*.gtpl`)
- Built-in multilingual support
- Page routing
- **Gianna Garbage Collector** for automatic resource cleanup
- IndexedDB support out of the box
- Custom click and event handling system
- Plugin support
- Application lifecycle management
- Template directives such as conditions and loops
- Secure communication between templates and the server through the framework core

For example, a template can request a user's friend list, but it cannot directly perform network requests. All communication goes through the framework core.

---

# Planned Features

Future versions may include:

- **Instant Updates** — targeted UI updates without heavy reactive computations
- JSON with comment support

```json
{
  /* comment */
}
```

---

# Project Philosophy

I am tired of heavy and overcomplicated solutions.

I want to be able to fix a template quickly, even on low-powered devices such as smartwatches, kiosks, or embedded systems.

Gianna Framework is not intended to compete with existing frameworks. Its purpose is to simplify development and help create more resource-efficient applications.

The framework focuses on reducing unnecessary computations and lowering the overall resource consumption of web applications.

Visual design is outside the scope of the framework. For example, implementing a dark theme is the designer's responsibility. Gianna Framework focuses on minimizing CPU usage and expensive operations.

---

# Quick Start

The following examples assume that the `gianna-framework` directory is available on your server.

## index.html

Main application entry point.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Document</title>
</head>
<body>
    <div id="index"></div>

    <script src="./main.js" type="module"></script>
</body>
</html>
```

The `#index` element is the container where the application will be rendered.

You may use any selector name you prefer, such as:

- `#root`
- `#app`
- `#main`

---

## index.gtpl

Application startup template.

```xml
<template>
    <config>
    </config>

    <meta>
    </meta>

    <content>
        <header>
            <p>MyApp</p>
        </header>

        <main>
            <h1>Hello World</h1>
        </main>

        <footer>
            <p>Copyright</p>
        </footer>
    </content>
</template>
```

### Template Structure

| Tag | Description |
|------|------|
| `<template>` | Root template element. Required. |
| `<config>` | Template-specific configuration. |
| `<meta>` | Metadata section. |
| `<content>` | Main template content. |

If these sections are not needed, you can use a simplified template:

```xml
<template>
    <h1>Hello World</h1>
</template>
```

---

## main.js

Minimal application bootstrap example.

```javascript
import { $gn, $gianna } from "./gianna-framework/gf.js";

(async () => {
    try {
        await $gn.loadConfig({
            lang: "en"
        });

        await $gn.view.render(
            "#index",
            "index.gtpl",
            true
        );
    } catch (e) {
        console.error(e);
    }
})();
```

### Parameters

#### `$gn.loadConfig()`

Loads the application configuration.

It accepts either:

- A configuration object
- A URL pointing to a JSON configuration file

#### `$gn.view.render()`

```javascript
$gn.view.render(selector, template, clearContainer);
```

| Parameter | Description |
|-----------|-------------|
| `selector` | Target container CSS selector |
| `template` | Path to the `.gtpl` template |
| `clearContainer` | Whether to clear the container before rendering |

---

Congratulations! You have created your first Gianna Framework application.

This is only a minimal example. The framework already contains many more features that will be covered in future documentation.
