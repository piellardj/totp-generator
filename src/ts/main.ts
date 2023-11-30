import getToken from "totp-generator";

type TotpAlgorithm =
    | 'SHA-1'
    | 'SHA-224'
    | 'SHA-256'
    | 'SHA-384'
    | 'SHA-512'
    | 'SHA3-224'
    | 'SHA3-256'
    | 'SHA3-384'
    | 'SHA3-512';

declare const QRCode: {
    toCanvas: (canvas: HTMLCanvasElement, data: string, callback: (error: unknown) => void) => void;
};

function emptyElement(element: HTMLElement): void {
    element.textContent = "";
    while (element.childElementCount > 0) {
        element.removeChild(element.childNodes[0]);
    }
}

function tryParsePositiveInteger(input: string): number | null {
    input = input.trim();
    if (input === "") {
        return null;
    }
    const asNumber = +input;
    if (isNaN(asNumber) || asNumber <= 0 || !Number.isInteger(asNumber)) {
        return null;
    }
    return asNumber;
}

function main(): void {
    const secretInput = document.querySelector<HTMLInputElement>("input#secret")!;
    const digitsInput = document.querySelector<HTMLInputElement>("input#digits")!;
    const periodInput = document.querySelector<HTMLInputElement>("input#period")!;
    const algorithmSelect = document.querySelector<HTMLSelectElement>("select#algorithm")!;

    const generatedCodeSpan = document.getElementById("generated-code")!;
    const copyGeneratedCodeButton = document.querySelector<HTMLButtonElement>("button#copy-generated-code")!;

    const secondsLeftSpan = document.getElementById("seconds-left")!;
    const countdownProgress = document.querySelector<HTMLProgressElement>("progress#countdown")!;

    const qrCodeCanvas = document.querySelector<HTMLCanvasElement>("canvas#qrcode")!;
    const qrCodeWarnings = document.getElementById("qrcode-warnings")!;

    const secretUrlParameter = "secret";
    const digitsUrlParameter = "digits";
    const periodUrlParameter = "period";
    const algorithmUrlParameter = "algorithm";

    function loadUrlParameters(): void {
        const parameters = new URLSearchParams(window.location.search);

        function loadFromUrl(name: string, input: HTMLInputElement | HTMLSelectElement): void {
            const fromUrl = parameters.get(name);
            if (fromUrl) {
                input.value = fromUrl;
            }
        }

        loadFromUrl(secretUrlParameter, secretInput);
        loadFromUrl(digitsUrlParameter, digitsInput);
        loadFromUrl(periodUrlParameter, periodInput);
        loadFromUrl(algorithmUrlParameter, algorithmSelect);
    }

    function storeUrlParameters(): void {
        const parameters = new URLSearchParams();
        parameters.set(secretUrlParameter, secretInput.value);
        parameters.set(digitsUrlParameter, digitsInput.value);
        parameters.set(periodUrlParameter, periodInput.value);
        parameters.set(algorithmUrlParameter, algorithmSelect.value);

        const newUrl = new URL(window.location.href);
        newUrl.search = parameters.toString();
        window.history.replaceState("", "", newUrl);
    }

    function updateResult(): void {
        const secret = secretInput.value.trim().replace(/\s/g, "");
        const digitsString = digitsInput.value.trim();
        const digits = tryParsePositiveInteger(digitsString);
        const periodString = periodInput.value.trim();
        const period = tryParsePositiveInteger(periodString);
        const algorithm = algorithmSelect.value as TotpAlgorithm;

        const secretIsValid = (secret !== "");
        const digitsAreValid = digits !== null;
        const periodIsValid = period !== null;

        emptyElement(generatedCodeSpan);

        if (secretIsValid && digitsAreValid && periodIsValid) {
            const options = {
                period,
                algorithm,
                digits,
            };

            const token = getToken(secret, options);
            let splitCount = 3;
            if (digits === 4) {
                splitCount = 4;
            } else if (digits === 8) {
                splitCount = 4;
            }

            let tokenLeft = token;
            while (tokenLeft.length > 0) {
                const span = document.createElement("span");
                span.className = "generated-code-part";
                span.textContent = tokenLeft.substring(0, splitCount);
                tokenLeft = tokenLeft.substring(splitCount);
                generatedCodeSpan.appendChild(span);
            }

            const secondsSinceEpoch = Math.ceil(Date.now() / 1000) - 1;
            const secondsLeft = period - (secondsSinceEpoch % period);
            secondsLeftSpan.textContent = `This code will expire in ${secondsLeft} seconds.`;
            countdownProgress.value = 100 * secondsLeft / period;
            countdownProgress.style.display = "";
            copyGeneratedCodeButton.style.display = "";

        } else {
            generatedCodeSpan.textContent = "Invalid input.";
            secondsLeftSpan.textContent = "";
            countdownProgress.style.display = "none";
            copyGeneratedCodeButton.style.display = "none";
        }
    }

    function copyToClipboard(): void {
        const generatedCode = generatedCodeSpan.textContent?.trim();
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
        }
    }

    function updateQrCode(): void {
        const issuer = "TOTPgenerator";
        const secret = secretInput.value.trim();
        const digits = +digitsInput.value.trim();
        const period = +periodInput.value.trim();
        const algorithmRaw = algorithmSelect.value;
        const algorithm = algorithmRaw.replace("-", "");

        const url = `otpauth://totp/${issuer}?issuer=${issuer}&secret=${secret}&digits=${digits}&period=${period}&algorithm=${algorithm}`;
        QRCode.toCanvas(qrCodeCanvas, url, (error: unknown): void => {
            if (error) {
                console.error(error);
            }
        });
        qrCodeCanvas.title = url;

        const warnings: string[] = [];
        if (![6, 8].includes(digits)) {
            warnings.push(`Uncommon digits value "${digits}" is not supported by all authenticator apps.`);
        }
        if (algorithm !== "SHA1") {
            warnings.push(`Uncommon algorithm "${algorithmRaw}" is not supported by all authenticator apps.`);
        }
        if (period !== 30) {
            warnings.push(`Uncommon period "${period}" is not supported by all authenticator apps.`);
        }

        emptyElement(qrCodeWarnings);
        if (warnings.length > 0) {
            qrCodeWarnings.style.display = "block";
            for (const warning of warnings) {
                const div = document.createElement("div");
                div.textContent = `⚠ ${warning}`;
                qrCodeWarnings.appendChild(div);
            }
        } else {
            qrCodeWarnings.style.display = "";
        }
    }

    function onControlChange(): void {
        updateResult();
        storeUrlParameters();
        updateQrCode();
    }

    function bindEvents(): void {
        const onSecretUpdate = (): void => {
            secretInput.value = secretInput.value.trim().toUpperCase();
            onControlChange();
        };
        secretInput.addEventListener("change", onSecretUpdate);
        secretInput.addEventListener("keyup", onSecretUpdate);

        function setDefaultIfNeeded(this: HTMLInputElement): void {
            if (tryParsePositiveInteger(this.value) === null) {
                const defaultValue = this.getAttribute("placeholder");
                if (defaultValue) {
                    this.value = this.defaultValue;
                    onControlChange();
                }
            }
        }

        digitsInput.addEventListener("change", onControlChange);
        digitsInput.addEventListener("keyup", onControlChange);
        digitsInput.addEventListener("blur", setDefaultIfNeeded);

        periodInput.addEventListener("change", onControlChange);
        periodInput.addEventListener("keyup", onControlChange);
        periodInput.addEventListener("blur", setDefaultIfNeeded);

        algorithmSelect.addEventListener("change", onControlChange);

        copyGeneratedCodeButton.addEventListener("click", copyToClipboard);
    }

    loadUrlParameters();
    bindEvents();
    updateResult();
    updateQrCode();
    setInterval(updateResult, 500);
}

main();

