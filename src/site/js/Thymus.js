"use strict";
function Calculate_Thymus() {
    var thymus_in = parseFloat(document.getElementById("thymus_in").value);
    var thymus_out = parseFloat(document.getElementById("thymus_out").value);
    var muscle_in = parseFloat(document.getElementById("muscle_in").value);
    var muscle_out = parseFloat(document.getElementById("muscle_out").value);
    var CSR = (thymus_out / muscle_out) / (thymus_in / muscle_in);
    var SSI_muscle = (muscle_in - muscle_out) / muscle_in * 100.0;
    var SSI_thymus = (thymus_in - thymus_out) / thymus_in * 100.0;
    text = "Muscular signal intensity index is <b><font color=\"#edca4e\">" + SSI_muscle.toFixed(0) + "</font></b>.<br>";
    text += "Thymic signal intensity index is <b><font color=\"#edca4e\">" + SSI_thymus.toFixed(0) + "</font></b>.<br>";
    text += "Chemical shift ratio is <b><font color=\"#edca4e\">" + CSR.toFixed(3) + "</font></b>.<br>";
    document.getElementById("CalculationResult").innerHTML = text;
}
$(window).on("load", function () {
    window.Calculate_Thymus();
});
