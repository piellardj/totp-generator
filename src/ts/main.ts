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

    function emptyElement(element: HTMLElement): void {
        element.textContent = "";
        while (element.childElementCount > 0) {
            element.removeChild(element.childNodes[0]);
        }
    }

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
        const secret = secretInput.value.trim();
        const digits = +digitsInput.value.trim();
        const period = +periodInput.value.trim();
        const algorithm = algorithmSelect.value as TotpAlgorithm;

        const options = {
            period,
            algorithm,
            digits,
        };

        const token = getToken(secret, options);
        emptyElement(generatedCodeSpan);
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
        secondsLeftSpan.textContent = secondsLeft.toString();
        countdownProgress.value = 100 * secondsLeft / period;
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

        const onDigitsChange = (): void => {
            if (digitsInput.value === "") {
                digitsInput.value = "6";
            }
            onControlChange();
        };
        digitsInput.addEventListener("change", onDigitsChange);
        digitsInput.addEventListener("keyup", onDigitsChange);

        const onPeriodChange = (): void => {
            if (periodInput.value === "") {
                periodInput.value = "30";
            }
            onControlChange();
        };
        periodInput.addEventListener("change", onPeriodChange);
        periodInput.addEventListener("keyup", onPeriodChange);

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

