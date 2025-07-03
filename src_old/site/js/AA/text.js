import { newline } from "../globals.js";
import { CalculateAAo } from "./AAo.js"; //must include .js for this to work in the browser
let text_for_copy = "";
export function copy() {
    navigator.clipboard.writeText(text_for_copy);
}
function createWarning(parameter, is_low) {
    let low_or_high_phrase;
    if (is_low) {
        low_or_high_phrase = "is below the 5th percentile";
    }
    else {
        low_or_high_phrase = "is above the 95th percentile";
    }
    return "<font color=\"#ff0000\">Caution: The patient's " + parameter + " " + low_or_high_phrase + " for the study population.</font><br>";
}
export function createText(Age, BSA, ismale) {
    let calc = CalculateAAo(Age, BSA, ismale);
    let Sex;
    if (ismale) {
        Sex = "man";
    }
    else {
        Sex = "woman";
    }
    let text = "For a ";
    text += "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + Sex + "</font>";
    text += " with a body surface area of <b><font color=\"#42f4eb\">" + BSA.toFixed(2) + "</font></b> m<sup>2</sup>,<br>";
    text += "Ascending aortic diameter 95<sup>th</sup> percentile: <b><font color=\"#edca4e\">" + calc.AA95th.toFixed(2) + "</font></b> cm<br>";
    text += "Sinus of Valsalva diameter 95<sup>th</sup> percentile: <b><font color=\"#edca4e\">" + calc.Sinus95th.toFixed(2) + "</font></b> cm<br>";
    text_for_copy = "For a " + Age.toFixed(0) + " year old " + Sex;
    text_for_copy += " with a body surface area of " + BSA.toFixed(2) + " m^2," + newline;
    text_for_copy += "Ascending aortic diameter 95th percentile: " + calc.AA95th.toFixed(2) + " cm" + newline;
    text_for_copy += "Sinus of Valsalva diameter 95th percentile: " + calc.Sinus95th.toFixed(2) + " cm";
    if (ismale) {
        const age_lower_bound_male = 42.9 - 13.6 * 2;
        const age_upper_bound_male = 42.9 + 13.6 * 2;
        const bsa_lower_bound_male = 1.95 - 0.17 * 2;
        const bsa_upper_bound_male = 1.95 + 0.17 * 2;
        if (Age < age_lower_bound_male) {
            text += createWarning("age", true);
        }
        else if (Age > age_upper_bound_male) {
            text += createWarning("age", false);
        }
        if (BSA < bsa_lower_bound_male) {
            text += createWarning("BSA", true);
        }
        else if (BSA > bsa_upper_bound_male) {
            text += createWarning("BSA", false);
        }
    }
    else {
        const age_lower_bound_female = 45.0 - 13.9 * 2;
        const age_upper_bound_female = 45.0 + 13.9 * 2;
        const bsa_lower_bound_female = 1.69 - 0.16 * 2;
        const bsa_upper_bound_female = 1.69 + 0.16 * 2;
        if (Age < age_lower_bound_female) {
            text += createWarning("age", true);
        }
        else if (Age > age_upper_bound_female) {
            text += createWarning("age", false);
        }
        if (BSA < bsa_lower_bound_female) {
            text += createWarning("BSA", true);
        }
        else if (BSA > bsa_upper_bound_female) {
            text += createWarning("BSA", false);
        }
    }
    return text;
}
export function createTextAD(Age, BSA, ADiam, ismale) {
    let Sex;
    if (ismale) {
        Sex = "man";
    }
    else {
        Sex = "woman";
    }
    const line1 = "For a ";
    const line2 = ", an ascending aortic diameter of ";
    const line3 = " cm would be less than the ";
    const line4 = " percentile if the patient's BSA is greater than ";
    let text = line1;
    text = text + "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + Sex + "</font>";
    text = text + line2 + "<b><font color=\"#42f4eb\">" + ADiam.toFixed(2) + "</font></b>";
    text = text + line3 + "95<sup>th</sup>" + line4 + "<b><font color=\"#edca4e\">" + BSA.toFixed(2) + "</font></b> m<sup>2</sup>.";
    document.getElementById("CalculationResult").innerHTML = text;
    text_for_copy = line1;
    text_for_copy += Age.toFixed(0) + " year old " + Sex + line2 + ADiam.toFixed(2) + line3 + "95th" + line4 + BSA.toFixed(2) + " m.";
}
