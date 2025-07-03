import { newline } from "../globals.js";

let data:[Datum,Datum];
let text_for_copy:string="";

const ms_per_year=1000*60*60*24;

window.onload = ()=>{
	(document.getElementById("copy-button") as HTMLFormElement).onclick=copy;

	data = [
		{
			date_input:document.getElementById("Date1") as HTMLFormElement,
			diameter_inputs:[
				document.getElementById("D11") as HTMLFormElement,
				document.getElementById("D12") as HTMLFormElement,
				document.getElementById("D13") as HTMLFormElement],
			volume_div:document.getElementById("V1") as HTMLElement,
		},
		{
			date_input:document.getElementById("Date2") as HTMLFormElement,
			diameter_inputs:[
				document.getElementById("D21") as HTMLFormElement,
				document.getElementById("D22") as HTMLFormElement,
				document.getElementById("D23") as HTMLFormElement],
			volume_div:document.getElementById("V2") as HTMLElement,
		}
	];

	for(const datum of data)
	{
		initialize_Datum(datum);
		update_Datum(datum);
	}

	update_result();	
};

type Datum = {
	date_input:HTMLFormElement,
	diameter_inputs:[HTMLFormElement,HTMLFormElement,HTMLFormElement],
	volume_div:HTMLElement,
	volume?:number,
	date?:Date
}

function initialize_Datum(datum:Datum)
{
	let update_func = ()=>{update_Datum(datum);};
	datum.date_input.addEventListener("change", update_func, false);
	for(let di of datum.diameter_inputs)
	{
		di.addEventListener("change", update_func, false);
	}	
}

function update_Datum(datum:Datum)
{
	let num=0;
	let denom=0;
	let vals:number[] = [];
	let blank=true;

	for(let input of datum.diameter_inputs)
	{
		let val = parseFloat(input.value);
		vals.push(val);
	}

	for(let val of vals)
	{
		if(!Number.isNaN(val))
		{
			num+=val;
			denom+=1;
			blank=false;
		}
	}

	if(blank)
	{
		datum.volume=undefined;
		datum.volume_div.innerHTML="";

		for(let d in datum.diameter_inputs)
		{
			let input = datum.diameter_inputs[d];
			input.setAttribute("placeholder","Diameter " + (parseInt(d)+1));
		}
		return;
	}

	let mean_d = num/denom;

	for(let n in vals)
	{
		let val = vals[n];
		if(Number.isNaN(val))
		{
			vals[n]=mean_d;
			let input = datum.diameter_inputs[n];
			input.setAttribute("placeholder",mean_d + " (calculated estimate)");
		}
	}

	datum.volume = Math.PI/6;

	for(let val of vals)
	{
		datum.volume*=val;
	}
	
	datum.date = datum.date_input.valueAsDate;
	datum.volume_div.innerHTML=datum.volume.toFixed(2);
	
	update_result();
}

function update_result()
{
	const result_div:HTMLElement = document.getElementById("CalculationResult") as HTMLElement;
	while(result_div.lastChild)
	{
		result_div.removeChild(result_div.lastChild);
	}

	for(const datum of data)
	{
		if(!datum.volume || !datum.date)
		{
			let subresdiv = document.createElement("div");
			subresdiv.innerHTML = "Complete the table to get a result.";
			result_div.appendChild(subresdiv);
			(document.getElementById("copy-button") as HTMLFormElement).disabled=true;
			return;
		}
	}

	data.sort(function(a,b)
		{
			if(a.date!<b.date!)
			{
				return -1;
			}
			else
			{
				return +1;
			};
		}
	);
	
	for(let n=0;n<data.length-1;n++)
	{
		let subresdiv = document.createElement("div");
		
		let milliseconds:number=data[1].date!.getTime()-data[0].date!.getTime();
		let days = milliseconds/ms_per_year;
		let vrat = data[1].volume!/data[0].volume!;
		let doublingtime = Math.log(2)*days/Math.log(vrat);

		let change_description:string;
		if(vrat>1)
		{
			let unit:string;
			if(doublingtime===1){unit=" day.";}
			else{unit=" days.";}

			change_description="increased by " + ((vrat-1)*100).toFixed(0) + "%. Volumetric doubling time is " + doublingtime.toFixed(0) + unit;
		}
		else if(vrat===1)
		{
			change_description="did not change.";
		}
		else
		{
			change_description="decreased by " + ((1-vrat)*100).toFixed(0) + "%.";
		}

		let text = "In " + days.toFixed(0) + " days, the volume " + change_description;
		text_for_copy += text + newline;
		subresdiv.innerHTML += text;
		result_div.appendChild(subresdiv);
		(document.getElementById("copy-button") as HTMLFormElement).disabled=false;
	}
}

export function copy() {
	navigator.clipboard.writeText(text_for_copy);
}
