import * as fs from "fs";
import * as path from "path";
import { DemopageEmpty } from "webpage-templates";

const data = {
    title: "Online TOTP generator",
    description: "Tool to generate TOTP codes online",
    introduction: [
        "TODO",
    ],
    githubProjectName: "totp-generator",
    readme: {
        filepath: path.join(__dirname, "..", "README.md"),
        branchName: "main"
    },
    additionalLinks: [],
    scriptFiles: [
        "script/main.min.js"
    ],
    styleFiles: [
        "css/demo.css"
    ],
    body:
`<div id="error-messages">
    <noscript>You need to enable Javascript to run this experiment.</noscript>
</div>

<div class="section">
    <div class="section-contents">
        <div>
            <div class="controls-block">
                <div class="controls-block-item">
                <div class="control-label">Secret</div>
                <div class="control-container"><input type="text" placeholder="JBSWY3DPEHPK3PXP" value="JBSWY3DPEHPK3PXP" id="secret"></input></div>
            </div>
            <div class="controls-block-item">
                <div class="control-label">Digits</div>
                <div class="control-container"><input type="number" min="1" max="100" value="6" id="digits"></input></div>
            </div>
            <div class="controls-block-item">
                <div class="control-label">Period</div>
                <div class="control-container"><input type="number" min="1" max="360" value="30" id="period"></input><span style="margin-left:.5em">seconds</span></div>
            </div>
                <div class="controls-block-item">
                    <div class="control-label">Algorithm</div>
                    <div class="control-container">
                    <select id="algorithm">
                        <option value="SHA1" selected>SHA-1</option>
                        <option value="SHA256">SHA-256</option>
                        <option value="SHA512">SHA-512</option>
                    </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="results-container">
            <div>
                <span>The code will change in </span>
                <span id="seconds-left">X</span>
                <span> seconds.</span>
            </div>
            <div id="generated-code">
                012345
            </div>
        </div>
    </div>
</div>`,
};

const DEST_DIR = path.resolve(__dirname, "..", "docs");

const buildResult = DemopageEmpty.build(data, DEST_DIR);

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.resolve(__dirname, ".", "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

const sourceCss = path.resolve(__dirname, "static", "css", "demo.css");
const destinationCss = path.resolve(__dirname, "..", "docs", "css", "demo.css");

fs.copyFileSync(sourceCss, destinationCss);
