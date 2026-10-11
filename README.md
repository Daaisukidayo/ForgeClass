<div align="center">

# ForgeClass

Classes for ForgeScript: fields, methods, constructors and inheritance.

<a href="https://github.com/Daaisukidayo/ForgeClass/"><img src="https://img.shields.io/github/package-json/v/Daaisukidayo/ForgeClass/main?label=forge.class&color=5c16d4" alt="forge.class"></a>
<a href="https://github.com/tryforge/ForgeScript/"><img src="https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4" alt="@tryforge/forgescript"></a>
<a href="https://discord.gg/yFW5Ju6JP8"><img src="https://img.shields.io/discord/997899472610795580?logo=discord" alt="Discord"></a>

</div>

---

## Contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Functions](#functions)
4. [How it works](#how-it-works)
5. [Private members](#private-members)
6. [Class files](#class-files)
7. [Keeping instances](#keeping-instances)

<h3 align="center">Installation</h3><hr>

1. Install the package.

   **From npm** - the stable release:
   ```bash
   npm i forge.class
   ```

   **From GitHub:**
   ```bash
   npm i github:Daaisukidayo/ForgeClass#main
   ```

   It needs **ForgeScript 1.4.0** and **Node.js 22** or newer.

2. Here's an example of how your main file should look:

   ```js
   const { ForgeClient } = require("@tryforge/forgescript")
   const { ForgeClass } = require("forge.class")

   const client = new ForgeClient({
       ...options, // Change that to the options you currently have
       extensions: [
           new ForgeClass(),
           // Add other extensions you installed here
       ]
   })

   client.login("YourToken")
   ```

<h3 align="center">Quick start</h3><hr>

```
$class[Player;
    $field[name]
    $field[hp;100]
    $constructor[$setField[this;name;$env[name]];name]
    $method[damage;
        $setField[this;hp;$math[$getField[this;hp]-$env[amount]]]
        $return[$getField[this;hp]]
    ;amount]
]

$new[p;Player;Steve]
$callMethod[p;damage;30]   → 70
$getField[p;hp]            → 70
$instanceOf[p;Player]      → true
```

<h3 align="center">Functions</h3><hr>

### Declaring a class

All but `$class` work only inside its body.

| Function | What it does |
|---|---|
| **`$class[name;body]`** | Declares a class. The body outputs nothing. |
| **`$field[name;default?]`** | Declares a field. The default is code run for every new instance, empty without one. |
| **`$method[name;code;...params]`** | Declares a method. |
| **`$constructor[code;...params]`** | Declares the constructor, which `$new` runs. |
| **`$extends[parent]`** | Sets the parent class. |
| **`$param[name;type;required?;rest?]`** | Declares a typed param, among the params of `$method` or `$constructor`. |

### Working with instances

| Function | Returns | What it does |
|---|---|---|
| **`$new[variable;class;...args]`** | — | Creates an instance in a variable. |
| **`$callMethod[variable;method;...args]`** | what the method returns | Calls a method. |
| **`$super[method;...args]`** | what the method returns | Inside a method, calls the parent class's one on the same instance. `$super[constructor;...]` runs the parent's constructor. |
| **`$getField[variable;field]`** | the value | Reads a field. |
| **`$setField[variable;field;value]`** | — | Sets a field the class declares. |
| **`$hasField[variable;field]`** | boolean | Whether the class declares the field. |
| **`$instanceFields[variable]`** | JSON object | The fields, without `__class`. |
| **`$className[variable]`** | string | The class of the instance. |
| **`$instanceOf[variable;class]`** | boolean | Whether it is of that class or of one extending it. |
| **`$isInstance[variable]`** | boolean | Whether the variable holds an instance. |

### Classes

| Function | Returns | What it does |
|---|---|---|
| **`$classExists[class]`** | boolean | Whether the class is declared. |
| **`$classFields[class]`** | JSON array | Its fields, inherited ones included. |
| **`$classMethods[class]`** | JSON array | Its methods, inherited ones included, without the constructor. |
| **`$classParent[class]`** | string | The class it extends, empty when none. |
| **`$deleteClass[class]`** | boolean | Deletes the class unless another one extends it. Says whether there was one. |

<h3 align="center">How it works</h3><hr>

**Instances** are plain objects in a variable, with the class name in a `__class` field that can't be changed.

**Field values** are stored as numbers, `true`, `false` or JSON when they are one, and as text otherwise. A number that wouldn't read back the same, like a Discord ID or `007`, stays text, so IDs stay exact.

**Methods**
- The instance is `this`: `$getField[this;hp]`, `$callMethod[this;other]`.
- Arguments are read with `$env[param]`. A plain param gets the text as it is, a `$param` one is converted the way ForgeScript converts its own functions' arguments:
  ```
  $method[give;$return[$env[target;username] gets $arrayJoin[items;, ]];$param[target;User];$param[items;String;false;true]]
  ```
  An optional param may be left out, and a rest one takes the remaining arguments as an array.
- A method returns what `$return` gives, or else what it outputs.

**Inheritance**
- Fields and methods come from every parent up the chain.
- A field declared again keeps its place, with the child's default.
- A class without a constructor uses its parent's.

<h3 align="center">Private members</h3><hr>

A `#` before a field or method name makes it private, as in JavaScript:

```
$class[Wallet;
    $field[#pin;1234]
    $method[#check;$if[$env[pin]==$getField[this;#pin];true;false];pin]
    $method[unlock;$callMethod[this;#check;$env[pin]];pin]
]

$new[w;Wallet]
$callMethod[w;unlock;1234]   → true
$getField[w;#pin]            → error
```

- Only the methods of the class that declares it reach it, on any instance of that class. A child class doesn't, and neither does `$super`.
- A parent's `#x` and a child's `#x` are different members, and `#x` and `x` can live side by side.
- It isn't kept on the instance, so `$env`, `$instanceFields`, `$classFields` and `$classMethods` don't show it.

<h3 align="center">Class files</h3><hr>

For classes used everywhere, load them from a folder before the client logs in:

```js
client.classes.load("./classes")
```

A file exports one class or an array of them:

```js
module.exports = {
    name: "Player",
    extends: "Entity",
    fields: { hp: "100", name: "" },
    methods: {
        constructor: {
            params: ["name"],
            code: `
                $setField[this;name;$env[name]]
            `,
        },
        damage: {
            params: [{ name: "amount", type: "Number" }],
            code: `
                $setField[this;hp;$math[$getField[this;hp]-$env[amount]]]
            `,
        },
        greet: "Hi, $getField[this;name]!",
    },
}
```

A param is either a name or a `{ name, type, required, rest }` object. `client.classes.add({ ... })` takes the same objects. When one class can't be used, it throws and none of them is added.

<h3 align="center">Keeping instances</h3><hr>

An instance lives as long as the command, but it comes back from its own JSON. Save `$env[p]` anywhere and load it in another command:

```
$jsonLoad[p;the saved JSON]
$callMethod[p;greet]   → Hi, Steve!
```

[Private](#private-members) `#` fields aren't in the JSON.
