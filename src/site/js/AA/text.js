import { CalculateAAo } from "./AAo.js"; //must include .js for this to work in the browser
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
    text = text + "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + Sex + "</font>";
    text = text + " with a body surface area of <b><font color=\"#42f4eb\">" + BSA.toFixed(2) + "</font></b> m<sup>2</sup>:<br>";
    text = text + "Ascending aortic diameter 95<sup>th</sup> percentile is <b><font color=\"#edca4e\">" + calc.AA95th.toFixed(2) + "</font></b> cm.<br>";
    text = text + "Sinus of Valsalva diameter 95<sup>th</sup> percentile is <b><font color=\"#edca4e\">" + calc.Sinus95th.toFixed(2) + "</font></b> cm.<br>";
    if (ismale) {
        const age_lower_bound_male = 42.9 - 13.6 * 2;
        const age_upper_bound_male = 42.9 + 13.6 * 2;
        const bsa_lower_bound_male = 1.95 - 0.17 * 2;
        const bsa_upper_bound_male = 1.95 + 0.17 * 2;
        if (Age < age_lower_bound_male) {
            text = text + createWarning("age", true);
        }
        else if (Age > age_upper_bound_male) {
            text = text + createWarning("age", false);
        }
        if (BSA < bsa_lower_bound_male) {
            text = text + createWarning("BSA", true);
        }
        else if (BSA > bsa_upper_bound_male) {
            text = text + createWarning("BSA", false);
        }
    }
    else {
        const age_lower_bound_female = 45.0 - 13.9 * 2;
        const age_upper_bound_female = 45.0 + 13.9 * 2;
        const bsa_lower_bound_female = 1.69 - 0.16 * 2;
        const bsa_upper_bound_female = 1.69 + 0.16 * 2;
        if (Age < age_lower_bound_female) {
            text = text + createWarning("age", true);
        }
        else if (Age > age_upper_bound_female) {
            text = text + createWarning("age", false);
        }
        if (BSA < bsa_lower_bound_female) {
            text = text + createWarning("BSA", true);
        }
        else if (BSA > bsa_upper_bound_female) {
            text = text + createWarning("BSA", false);
        }
    }
    return text;
}
