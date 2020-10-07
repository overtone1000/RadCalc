class Datum
{
	constructor(date_input, diameter_input1, diameter_input2, diameter_input3, volume_div)
	{
		this.date_input=date_input;
		this.diameter_inputs=[diameter_input1,diameter_input2,diameter_input3];
		this.volume_div=volume_div;
		
		for(let d in this.diameter_inputs)
		{
			let input = this.diameter_inputs[d];
			input.addEventListener("change", function() {this.update();}.bind(this), false);
		}
		
		console.debug(this);
	}
	
	update()
	{
		let current=1;
		let notblank=false;
		for(let d in this.diameter_inputs)
		{
			let input = this.diameter_inputs[d];
			let val = parseFloat(input.value);
			if(!Number.isNaN(val))
			{
				current*=val;
				notblank=true;
			}
		}
		
		if(notblank)
		{
			this.volume_div.innerHTML=current;
		}
		else
		{
			this.volume_div.innerHTML="";
		}

	}
}

let datum1;
let datum2;

$(window).on("load", function()
{
	datum1 = new Datum(
		document.getElementById("Date1"),
		document.getElementById("D11"),
		document.getElementById("D12"),
		document.getElementById("D13"),
		document.getElementById("V1"));
		
	datum2 = new Datum(
		document.getElementById("Date2"),
		document.getElementById("D21"),
		document.getElementById("D22"),
		document.getElementById("D23"),
		document.getElementById("V2"));
});