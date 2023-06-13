import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { DemopageEmpty } from "webpage-templates";

const data = {
    title: "Online TOTP generator",
    description: "Tool to generate TOTP codes online",
    introduction: [
        "This is an online tool to generate TOTP codes like an app such as Google Authenticator would do.",
        "You can bookmark this page to remember the secret. Keep in mind that it is safer to use a dedicated app.",
    ],
    githubProjectName: "totp-generator",
    readme: {
        filepath: path.join(__dirname, "..", "README.md"),
        branchName: "main"
    },
    additionalLinks: [],
    scriptFiles: [
        "script/qrcode.js",
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
        <div class="block">
            <div class="controls-block">
                <div class="controls-block-item">
                <div class="control-label">Secret</div>
                <div class="control-container"><input type="text" placeholder="HVR4CFHAFOWFGGFAGSA5JVTIMMPG6GMT" value="HVR4CFHAFOWFGGFAGSA5JVTIMMPG6GMT" id="secret" pattern="[a-zA-Z2-7=]+"></input></div>
            </div>
            <div class="controls-block-item">
                <div class="control-label">Digits</div>
                <div class="control-container"><input type="number" min="1" max="100" value="6" id="digits" plaholder="6"></input></div>
            </div>
            <div class="controls-block-item">
                <div class="control-label">Period</div>
                <div class="control-container"><input type="number" min="1" max="360" value="30" id="period"  plaholder="30"></input><span style="margin-left:.5em">seconds</span></div>
            </div>
                <div class="controls-block-item">
                    <div class="control-label">Algorithm</div>
                    <div class="control-container">
                    <select id="algorithm">
                        <option value= "SHA-1" selected>SHA-1</option>
                        <option value= "SHA-224">SHA-224</option>
                        <option value= "SHA-256">SHA-256</option>
                        <option value= "SHA-384">SHA-384</option>
                        <option value= "SHA-512">SHA-512</option>
                        <option value= "SHA3-224">SHA3-224</option>
                        <option value= "SHA3-256">SHA3-256</option>
                        <option value= "SHA3-384">SHA3-384</option>
                        <option value= "SHA3-512">SHA3-512</option>
                    </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="block results-container">
            <div id="generated-code-container">
                <span id="generated-code">012345</span>
                <button id="copy-generated-code">Copy</button>
            </div>
            <div class="countdown-section">
                <div>
                    <span>This code will expire in </span>
                    <span id="seconds-left">X</span>
                    <span> seconds.</span>
                </div>
                <div>
                    <progress id="countdown" max="100" value="100"></progress>
                </div>
            </div>
        </div>
        <div class="block qrcode-container">
            <canvas id="qrcode" width="300" height="300"></canvas>
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

fse.copySync(path.resolve(__dirname, "static"), path.resolve(__dirname, "..", "docs"));
