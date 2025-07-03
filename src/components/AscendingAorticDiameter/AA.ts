import { copy, createText, createTextAD } from "./AA/text.js"; //must include .js for this to work in the browser
import { CalculateAAo } from "./AA/AAo.js"; //must include .js for this to work in the browser

let absa_input=false;
let ahw_input=false;
let ad_input=false;

window.onload = ()=>{
	(document.getElementById("AgeHeightWeightRadio") as HTMLFormElement).checked = "checked";
	(document.getElementById("input_type") as HTMLFormElement).onchange=SelectForm;
	(document.getElementById("form_age") as HTMLFormElement).onchange=Update;
	(document.getElementById("form_absa") as HTMLFormElement).onchange=Update;
	(document.getElementById("form_ahw") as HTMLFormElement).onchange=Update;
	(document.getElementById("height_units") as HTMLFormElement).onchange=Update;
	(document.getElementById("weight_units") as HTMLFormElement).onchange=Update;
	(document.getElementById("form_ad") as HTMLFormElement).onchange=Update;
	(document.getElementById("form_sex") as HTMLFormElement).onchange=Update;

	(document.getElementById("copy-button") as HTMLFormElement).onclick=copy;
	
	SelectForm();
};

function SelectForm(){
	absa_input = (document.getElementById("AgeBSARadio") as HTMLFormElement).checked;
    ahw_input = (document.getElementById("AgeHeightWeightRadio") as HTMLFormElement).checked;
	ad_input = (document.getElementById("AgeDiameterRadio") as HTMLFormElement).checked;
	
	if(absa_input)
    {
		(document.getElementById("div_absa") as HTMLDivElement).style.display= "inline";
		(document.getElementById("div_ahw") as HTMLDivElement).style.display= "none" ;
		(document.getElementById("div_ad") as HTMLDivElement).style.display= "none" ;
    }
    else if(ahw_input)
    {
		(document.getElementById("div_absa") as HTMLDivElement).style.display= "none";
		(document.getElementById("div_ahw") as HTMLDivElement).style.display= "inline" ;
		(document.getElementById("div_ad") as HTMLDivElement).style.display= "none" ;
    }
	else if(ad_input)
    {
		(document.getElementById("div_absa") as HTMLDivElement).style.display= "none";
		(document.getElementById("div_ahw") as HTMLDivElement).style.display= "none" ;
		(document.getElementById("div_ad") as HTMLDivElement).style.display= "inline";
	}
	
	Update();
}

function Update()
{
	console.log("Updating");
	if(absa_input)
    {
		//console.log("Updating using ABSA function.");
		CalculateABSA();
    }
    else if(ahw_input)
    {
		//console.log("Updating using AHW function.");
		CalculateAHW();
    }
	else if(ad_input)
    {
		CalculateAD()
    }
}

function CalculateABSA(){
	let Age = parseFloat((document.getElementById("Age") as HTMLFormElement).value);
    let BSA = parseFloat((document.getElementById("BSA_ABSA") as HTMLFormElement).value);
	let ismale = (document.getElementById("SexIsMan") as HTMLFormElement).checked;
	(document.getElementById("CalculationResult") as HTMLFormElement).innerHTML = createText(Age,BSA,ismale);
}

function CalculateAHW()
{
	let height_conversion_factor = 0;
	let weight_conversion_factor = 0;

	switch((document.getElementById("height_units") as HTMLFormElement).value)
	{
		case "cm":height_conversion_factor=1;break;
		case "in":height_conversion_factor=2.54;break;
	}

	switch((document.getElementById("weight_units") as HTMLFormElement).value)
	{
		case "kg":weight_conversion_factor=1;break;
		case "lb":weight_conversion_factor=0.4535924;break;
	}

	let Age = parseFloat((document.getElementById("Age") as HTMLFormElement).value);
	let Height = parseFloat((document.getElementById("height_AHW") as HTMLFormElement).value)*height_conversion_factor;
	let Weight = parseFloat((document.getElementById("weight_AHW") as HTMLFormElement).value)*weight_conversion_factor;
	let coef1 =0.007184;
	let coef_weight =0.425;
	let coef_height =0.725;
    let BSA = coef1*Math.pow(Weight,coef_weight)*Math.pow(Height,coef_height);
	//console.log(BSA);
	let ismale = (document.getElementById("SexIsMan") as HTMLFormElement).checked;
	(document.getElementById("CalculationResult") as HTMLElement).innerHTML = createText(Age,BSA,ismale);
}

type Guess = {
	BSA:number,
	AA95th:number
};

type Guesses =
{
	left:Guess,
	right:Guess,
	last?:Guess,
	Age:number,
	ADiam:number,
	ismale:boolean,
	err:number
};

function get_guess(Age:number, BSA:number, ismale:boolean):Guess
{
	return {
		BSA:BSA,
		AA95th:CalculateAAo(Age,BSA,ismale).AA95th
	};
}

function initialize_guesses(Age:number, ADiam:number, ismale:boolean):Guesses
{
	let low_init_BSA=1.5;
	let hight_init_BSA=2.0;

	return {
		left:get_guess(Age, low_init_BSA, ismale),
		right:get_guess(Age, hight_init_BSA, ismale),
		Age:Age,
		ADiam:ADiam,
		ismale:ismale,
		err:Number.POSITIVE_INFINITY
	};
}

function iterate_guesses(guesses:Guesses)
{
	let slope = (guesses.right.BSA-guesses.left.BSA)/(guesses.right.AA95th-guesses.left.AA95th);
	let new_BSA = (guesses.ADiam-guesses.left.AA95th)*slope + guesses.left.BSA;
	guesses.last=get_guess(guesses.Age, new_BSA, guesses.ismale)
	
	guesses.err = guesses.last.AA95th-guesses.ADiam;
	if(guesses.err>0)
	{
		guesses.right = guesses.last;
	}
	else
	{
		guesses.left = guesses.last;
	}
	console.debug("Iteration. New BSA " + new_BSA + ", new AA95th " + guesses.last.AA95th + "(err="+guesses.err+")");
	console.debug(guesses.left);
	console.debug(guesses.right);
}

function CalculateAD()
{
	let Age = parseFloat((document.getElementById("Age") as HTMLFormElement).value);
	let ADiam = parseFloat((document.getElementById("aad_ad") as HTMLFormElement).value);
	let ismale = (document.getElementById("SexIsMan") as HTMLFormElement).checked;

	let guesses:Guesses = initialize_guesses(Age, ADiam, ismale);
	
	let count = 0;
	while(Math.abs(guesses.err)>0.001)
	{
		iterate_guesses(guesses);
		if(count++>1000)
		{
			return "Could not calculate.";
		}
	}

	createTextAD(Age, guesses.last!.BSA, ADiam, ismale);
}