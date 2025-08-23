#!/bin/bash

if [ $# -eq 0 ]; then
    echo ""
    echo "No page supplied"
    echo ""
elif [ "$1" = "init" ]; then
    echo ""
    echo "initialising"
    echo ""

    # Create a new HTML file with boilerplate code
    echo "Adding index.html..."
    touch ./src/client/pages/index.html
    echo "index.html added successfully!"
    echo ""

    echo "Populating index.html with boilerplate HTML..."
    echo "<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <link rel=\"stylesheet\" href=\"style.css\">
    <title>Introduction</title>
</head>
<body>
    <div class="title">
        <h1>Welcome to the introduction page</h1>
        <p>You have set up the following pages</p>
    </div>

    <div class="directories"></div>

    <script type="module" src="script.ts"></script>
</body>
</html>" > ./src/client/pages/index.html
    echo "HTML boilerplate added successfully!"
    echo ""

    # Create a CSS file for styling
    echo "Adding style.css..."
    touch ./src/client/pages/style.css
    echo "@import url(\"@/assets/fonts.css\");

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    width: 100vw;
    height: 100vh;
    background-color: black;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.title {
    text-align: center;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.directories {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    padding: 2rem;
    gap: 0.5rem;
}

.directory {
    padding: 4rem;
    min-width: calc(33.333% - 0.5rem);
    max-width: calc(33.333% - 0.5rem);
    display: grid;
    place-items: center;
    border: 1px solid gray;
    transition: all 0.2s ease-in;
    border-radius: 5px;
    color: white;
    text-decoration: none;
    text-transform: capitalize;
}

.directory:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.no-directories {
    width: 100%;
    padding: 10rem;
    display: grid;
    place-items: center;
    gap: 0.3rem;
    border: 1px solid gray;
    border-radius: 5px;
    color: white;
}

.no-directories h2 {
    color: rgb(183, 183, 183);
}

.no-directories p {
    color: gray;
}
" > ./src/client/pages/style.css
    echo "style.css added successfully!"
    echo ""

    # Create Typescipt file
    echo "Adding script.ts..."
    touch ./src/client/pages/script.ts
    echo "async function getDirs(): Promise<string[]> {
    const response = await fetch(\"/directories\");
    return await response.json();
}

async function addDirectoryElements() {
    const dirs = await getDirs();
    const container: HTMLDivElement = document.querySelector(\".directories\") as HTMLDivElement;

    if (dirs.length) {
        dirs.forEach((dir) => {
            const a: HTMLAnchorElement = document.createElement(\"a\");
            a.href = dir;
            a.className = \"directory\";
            a.textContent = dir;
            container.appendChild(a);
        });
    } else {
        const div = document.createElement(\"div\");
        div.className = \"no-directories\";

        const title = document.createElement(\"h2\");
        title.textContent = \"You have not added any pages yet\";

        const subtitle = document.createElement(\"p\");
        subtitle.textContent = \"Run 'npm run add-page <page-name>' to get started\";

        div.appendChild(title);
        div.appendChild(subtitle);
        container.appendChild(div);
    }
}

addDirectoryElements();" > ./src/client/pages/script.ts
    echo "script.ts added successfully!"
    echo ""

    echo "-------------------------------------------------------------------"
    echo "| Congrats! public was initialised successfully!             |"
    echo "-------------------------------------------------------------------"
    echo "| directory: src/client/pages                                      |"
    echo "| HTML: src/client/pages/index.html                                |"
    echo "| CSS: src/client/pages/style.css                                  |"
    echo "| TypeScript: src/client/pages/script.ts                           |"
    echo "-------------------------------------------------------------------"
    echo ""
    echo ""
else
    echo ""
    echo "Creating a new app '$1'"
    echo ""

    # Make the directory
    echo "Creating src/client/pages/$1 directory..."
    mkdir ./src/client/pages/$1
    echo "src/client/pages/$1 directory created successfully!"
    echo ""

    # Create a new HTML file with boilerplate code
    echo "Adding index.html..."
    touch ./src/client/pages/$1/index.html
    echo "index.html added successfully!"
    echo ""

    echo "Populating index.html with boilerplate HTML..."
    echo "<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <link rel=\"stylesheet\" href=\"style.css\">
    <title>$1</title>
</head>
<body>
    <h1>Welcome to $1</h1>
    <p>Start editing src/client/pages/$1/index.html to see changes.</p>
    <p>A CSS file has been generated for you at src/client/pages/$1/style.css.</p>
    <p>A TypeScript file has also been generated for you at src/client/pages/$1/script.ts.</p>
    <script type=\"module\" src=\"script.ts\"></script>
</body>
</html>" > ./src/client/pages/$1/index.html
    echo "HTML boilerplate added successfully!"
    echo ""

    # Create a CSS file for styling
    echo "Adding style.css..."
    touch ./src/client/pages/$1/style.css
    echo "@import url(\"@/assets/fonts.css\");

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body { 
    width: 100vw; 
    height: 100vh; 
    background-color: 
    black; 
    color: white; 
}" > ./src/client/pages/$1/style.css
    echo "style.css added successfully!"
    echo ""

    # Create Typescipt file
    echo "Adding script.ts..."
    touch ./src/client/pages/$1/script.ts
    echo "console.log('Welcome to $1')" > ./src/client/pages/$1/script.ts
    echo "script.ts added successfully!"
    echo ""

    echo "-------------------------------------------------------------------"
    echo "| Congrats! $1 created succesfully! Files can be found here: |"
    echo "-------------------------------------------------------------------"
    echo "| directory: src/client/pages/$1                                   |"
    echo "| HTML: src/client/pages/$1/index.html                             |"
    echo "| CSS: src/client/pages/$1/style.css                               |"
    echo "| TypeScript: src/client/pages/$1/script.ts                        |"
    echo "-------------------------------------------------------------------"
    echo ""
    echo ""
fi

code ./src/client/pages/$1/index.html
code ./src/client/pages/$1/style.css
code ./src/client/pages/$1/script.ts