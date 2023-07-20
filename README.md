![](https://badgen.net/badge/CodeX%20Editor/v2.0/blue)

# Raw HTML Tool for Editor.js with render mode

The default raw Tool for the [Editor.js](https://codex.so/editor) works great, but... Wouldn't be nice to be able to preview how the code you're inserting will look like?

Now you can! ✨

![example.gif](docs%2Fexample.gif)

Oh, and it also supports i18n!

![](https://capella.pics/5195d944-966d-40cf-8f86-78c6349d94cb.jpg)

## Load from CDN

You can load specific version of package from [jsDelivr CDN](https://www.jsdelivr.com/package/npm/@editorjs/raw).

`https://cdn.jsdelivr.net/gh/naroh091/editorjs-raw-with-render-mode@latest/dist/bundle.js`

Require this script on a page with CodeX Editor.

```html
<script src="..."></script>
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
let editor = new EditorJS({
  ...
  
  tools: {
    ...
    raw: RawTool,
  }
  
  ...
});
```

## i18n

You can translate the Tool's UI by passing `i18n` object with custom translations to the Editor.js instance.

```javascript
i18n: {
    messages: {
        tools: {
            Raw: {
                'Enter HTML code': 'Introduce código HTML',
                'Switch to render mode': 'Cambiar a modo visual',
                'Switch to HTML mode': 'Cambiar a modo HTML'
            }
        }
    }
}
```


## Output data

This Tool returns raw HTML code.

```json
{
    "type" : "raw",
    "data" : {
        "html": "<div style=\"background: #000; color: #fff; font-size: 30px; padding: 50px;\">Any HTML code</div>",
    }
}
```

