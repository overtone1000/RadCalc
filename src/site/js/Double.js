"use strict";
class Datum {
    constructor(date_input, diameter_input1, diameter_input2, diameter_input3, volume_div) {
        this.date_input = date_input;
        this.diameter_inputs = [diameter_input1, diameter_input2, diameter_input3];
        this.volume_div = volume_div;
        this.volume = null;
        this.date = null;
        this.date_input.addEventListener("change", function () { this.update(); }.bind(this), false);
        for (let d in this.diameter_inputs) {
            let input = this.diameter_inputs[d];
            input.addEventListener("change", function () { this.update(); }.bind(this), false);
        }
        console.debug(this);
    }
    update() {
        let num = 0;
        let denom = 0;
        let vals = new Array();
        let blank = true;
        for (let d in this.diameter_inputs) {
            let input = this.diameter_inputs[d];
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
            this.volume = null;
            this.volume_div.innerHTML = "";
            for (let d in this.diameter_inputs) {
                let input = this.diameter_inputs[d];
                input.setAttribute("placeholder", "Diameter " + (parseInt(d) + 1));
            }
            return;
        }
        let mean_d = num / denom;
        console.debug("Mean diameter = " + mean_d);
        for (let n in vals) {
            let val = vals[n];
            if (Number.isNaN(val)) {
                vals[n] = mean_d;
                let input = this.diameter_inputs[n];
                input.setAttribute("placeholder", mean_d + " (calculated)");
            }
        }
        this.volume = Math.PI / 6;
        for (let val of vals) {
            this.volume *= val;
        }
        this.date = moment(this.date_input.value);
        this.volume_div.innerHTML = this.volume.toFixed(2);
        results.update();
    }
}
class NetResult {
    constructor(div) {
        this.div = div;
        this.data = new Array();
    }
    addDatum(datum) {
        this.data.push(datum);
    }
    update() {
        let temparr = new Array();
        for (const index in this.data) {
            let datum = this.data[index];
            if (datum.volume !== null && datum.date !== null) {
                temparr.push(datum);
            }
        }
        temparr.sort(function (a, b) {
            console.debug(a);
            if (a.date.isBefore(b.date)) {
                return -1;
            }
            else {
                return +1;
            }
            ;
        });
        while (this.div.firstChild) {
            this.div.removeChild(this.div.lastChild);
        }
        for (let n = 0; n < temparr.length - 1; n++) {
            let subresdiv = document.createElement("div");
            let days = temparr[1].date.diff(temparr[0].date, "days");
            let vrat = temparr[1].volume / temparr[0].volume;
            let doublingtime = Math.log(2) * days / Math.log(vrat);
            subresdiv.innerHTML = "Interval " + (n + 1) + " is " + days.toFixed(0) + " days. Volume ratio is " + vrat.toFixed(2) + "." + " Doubling time is " + doublingtime.toFixed(0) + " days.";
            this.div.appendChild(subresdiv);
        }
    }
}
let datum1;
let datum2;
let results;
$(window).on("load", function () {
    datum1 = new Datum(document.getElementById("Date1"), document.getElementById("D11"), document.getElementById("D12"), document.getElementById("D13"), document.getElementById("V1"));
    datum2 = new Datum(document.getElementById("Date2"), document.getElementById("D21"), document.getElementById("D22"), document.getElementById("D23"), document.getElementById("V2"));
    results = new NetResult(document.getElementById("CalculationResult"));
    datum1.update();
    datum2.update();
    results.addDatum(datum1);
    results.addDatum(datum2);
    results.update();
});
