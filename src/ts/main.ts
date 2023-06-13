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
        generatedCodeSpan.textContent = "";
        while (generatedCodeSpan.childElementCount > 0) {
            generatedCodeSpan.removeChild(generatedCodeSpan.childNodes[0]);
        }
        let tokenLeft = token;
        while (tokenLeft.length > 0) {
            const span = document.createElement("span");
            span.className = "generated-code-part";
            span.textContent = tokenLeft.substring(0, 3);
            tokenLeft = tokenLeft.substring(3);
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
        const secret = secretInput.value.trim();
        const digits = +digitsInput.value.trim();
        const period = +periodInput.value.trim();

        const url = `otpauth://totp/TOTPgenerator?secret=${secret}&digits=${digits}&period=${period}`;
        QRCode.toCanvas(qrCodeCanvas, url, (error: unknown): void => {
            if (error) {
                console.error(error);
            }
        });
        qrCodeCanvas.title = url;
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

