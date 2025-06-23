import { newline } from "./globals.js";
window.onload = () => {
    document.getElementById("form_intensities").onchange = Calculate_Thymus;
    document.getElementById("copy-button").onclick = copy;
    Calculate_Thymus();
};
let text_for_copy = "";
function copy() {
    navigator.clipboard.writeText(text_for_copy);
}
function Calculate_Thymus() {
    let thymus_in = parseFloat(document.getElementById("thymus_in").value);
    let thymus_out = parseFloat(document.getElementById("thymus_out").value);
    let muscle_in = parseFloat(document.getElementById("muscle_in").value);
    let muscle_out = parseFloat(document.getElementById("muscle_out").value);
    let values_not_ready = [];
    if (Number.isNaN(thymus_in)) {
        values_not_ready.push("Thymic Intensity on In-Phase");
    }
    if (Number.isNaN(thymus_out)) {
        values_not_ready.push("Thymic Intensity on Out-of-Phase");
    }
    if (Number.isNaN(muscle_in)) {
        values_not_ready.push("Muscle Intensity on In-Phase");
    }
    if (Number.isNaN(muscle_out)) {
        values_not_ready.push("Muscle Intensity on Out-of-Phase");
    }
    let text;
    if (values_not_ready.length > 0) {
        document.getElementById("copy-button").disabled = true;
        text = "Please provide ";
        if (values_not_ready.length == 1) {
            text += values_not_ready[0] + ".";
        }
        else if (values_not_ready.length == 2) {
            text += values_not_ready[0] + " and " + values_not_ready[1];
        }
        else {
            for (let n = 0; n < values_not_ready.length - 1; n++) {
                text += values_not_ready[n] + ", ";
            }
            text += " and " + values_not_ready[values_not_ready.length - 1] + ".";
        }
    }
    else {
        document.getElementById("copy-button").disabled = false;
        let CSR = (thymus_out / muscle_out) / (thymus_in / muscle_in);
        let SSI_muscle = (muscle_in - muscle_out) / muscle_in * 100.0;
        let SSI_thymus = (thymus_in - thymus_out) / thymus_in * 100.0;
        const line1 = "Muscular signal intensity index is ";
        const line2 = "Thymic signal intensity index is ";
        const line3 = "Chemical shift ratio is ";
        text = line1 + "<b><font color=\"#edca4e\">" + SSI_muscle.toFixed(0) + "</font></b>.<br>";
        text += line2 + "<b><font color=\"#edca4e\">" + SSI_thymus.toFixed(0) + "</font></b>.<br>";
        text += line3 + "<b><font color=\"#edca4e\">" + CSR.toFixed(3) + "</font></b>.<br>";
        text_for_copy = line1 + SSI_muscle.toFixed(0) + newline + ".";
        text_for_copy += line2 + SSI_thymus.toFixed(0) + newline + ".";
        text_for_copy += line3 + CSR.toFixed(3) + ".";
    }
    document.getElementById("CalculationResult").innerHTML = text;
}
