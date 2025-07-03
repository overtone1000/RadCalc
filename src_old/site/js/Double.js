import { newline } from "./globals.js";
let data;
let text_for_copy = "";
const ms_per_year = 1000 * 60 * 60 * 24;
window.onload = () => {
    document.getElementById("copy-button").onclick = copy;
    data = [
        {
            date_input: document.getElementById("Date1"),
            diameter_inputs: [
                document.getElementById("D11"),
                document.getElementById("D12"),
                document.getElementById("D13")
            ],
            volume_div: document.getElementById("V1"),
        },
        {
            date_input: document.getElementById("Date2"),
            diameter_inputs: [
                document.getElementById("D21"),
                document.getElementById("D22"),
                document.getElementById("D23")
            ],
            volume_div: document.getElementById("V2"),
        }
    ];
    for (const datum of data) {
        initialize_Datum(datum);
        update_Datum(datum);
    }
    update_result();
};
function initialize_Datum(datum) {
    let update_func = () => { update_Datum(datum); };
    datum.date_input.addEventListener("change", update_func, false);
    for (let di of datum.diameter_inputs) {
        di.addEventListener("change", update_func, false);
    }
}
function update_Datum(datum) {
    let num = 0;
    let denom = 0;
    let vals = [];
    let blank = true;
    for (let input of datum.diameter_inputs) {
        let val = parseFloat(input.value);
        vals.push(val);
    }
    for (let val of vals) {
        if (!Number.isNaN(val)) {
            num += val;
            denom += 1;
            blank = false;
        }
    }
    if (blank) {
        datum.volume = undefined;
        datum.volume_div.innerHTML = "";
        for (let d in datum.diameter_inputs) {
            let input = datum.diameter_inputs[d];
            input.setAttribute("placeholder", "Diameter " + (parseInt(d) + 1));
        }
        return;
    }
    let mean_d = num / denom;
    for (let n in vals) {
        let val = vals[n];
        if (Number.isNaN(val)) {
            vals[n] = mean_d;
            let input = datum.diameter_inputs[n];
            input.setAttribute("placeholder", mean_d + " (calculated estimate)");
        }
    }
    datum.volume = Math.PI / 6;
    for (let val of vals) {
        datum.volume *= val;
    }
    datum.date = datum.date_input.valueAsDate;
    datum.volume_div.innerHTML = datum.volume.toFixed(2);
    update_result();
}
function update_result() {
    const result_div = document.getElementById("CalculationResult");
    while (result_div.lastChild) {
        result_div.removeChild(result_div.lastChild);
    }
    for (const datum of data) {
        if (!datum.volume || !datum.date) {
            let subresdiv = document.createElement("div");
            subresdiv.innerHTML = "Complete the table to get a result.";
            result_div.appendChild(subresdiv);
            document.getElementById("copy-button").disabled = true;
            return;
        }
    }
    data.sort(function (a, b) {
        if (a.date < b.date) {
            return -1;
        }
        else {
            return +1;
        }
        ;
    });
    for (let n = 0; n < data.length - 1; n++) {
        let subresdiv = document.createElement("div");
        let milliseconds = data[1].date.getTime() - data[0].date.getTime();
        let days = milliseconds / ms_per_year;
        let vrat = data[1].volume / data[0].volume;
        let doublingtime = Math.log(2) * days / Math.log(vrat);
        let change_description;
        if (vrat > 1) {
            let unit;
            if (doublingtime === 1) {
                unit = " day.";
            }
            else {
                unit = " days.";
            }
            change_description = "increased by " + ((vrat - 1) * 100).toFixed(0) + "%. Volumetric doubling time is " + doublingtime.toFixed(0) + unit;
        }
        else if (vrat === 1) {
            change_description = "did not change.";
        }
        else {
            change_description = "decreased by " + ((1 - vrat) * 100).toFixed(0) + "%.";
        }
        let text = "In " + days.toFixed(0) + " days, the volume " + change_description;
        text_for_copy += text + newline;
        subresdiv.innerHTML += text;
        result_div.appendChild(subresdiv);
        document.getElementById("copy-button").disabled = false;
    }
}
export function copy() {
    navigator.clipboard.writeText(text_for_copy);
}
