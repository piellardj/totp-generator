function main(): void {
    const secretInput = document.querySelector<HTMLInputElement>("input#secret")!;
    const digitsInput = document.querySelector<HTMLInputElement>("input#digits")!;
    const periodInput = document.querySelector<HTMLInputElement>("input#period")!;
    const algorithmSelect = document.querySelector<HTMLSelectElement>("select#algorithm")!;

    const secondsLeftSpan = document.getElementById("seconds-left")!;
    const generatedCodeSpan = document.getElementById("generated-code")!;

    function updateResult(): void {
        const secret = secretInput.value.trim();
        const digits = +digitsInput.value;
        const period = +periodInput.value;
        const algorithm = algorithmSelect.value;

        secondsLeftSpan.textContent = "5";
        generatedCodeSpan.textContent = "555666";
    }

    updateResult();
}

main();
