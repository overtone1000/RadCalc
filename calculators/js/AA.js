let absa_input=false;
let ahw_input=false;
let ad_input=false;



function SelectForm(){
	absa_input = document.getElementById("AgeBSARadio").checked;
    ahw_input = document.getElementById("AgeHeightWeightRadio").checked;
	//ad_input = document.getElementById("AgeDiameterRadio").checked;
	
	if(absa_input)
    {
		document.getElementById("div_absa").style.display= "inline";
		document.getElementById("div_ahw").style.display= "none" ;
		document.getElementById("div_ad").style.display= "none" ;
    }
    else if(ahw_input)
    {
		document.getElementById("div_absa").style.display= "none";
		document.getElementById("div_ahw").style.display= "inline" ;
		document.getElementById("div_ad").style.display= "none" ;
    }
	else if(ad_input)
    {
		document.getElementById("div_absa").style.display= "none";
		document.getElementById("div_ahw").style.display= "none" ;
		document.getElementById("div_ad").style.display= "inline" ;
    }
}

function Update()
{
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
		console.log("Updating using AD function.");
    }
}

function CalculateABSA(){
	let Age = parseFloat(document.getElementById("Age").value);
    let BSA = parseFloat(document.getElementById("BSA_ABSA").value);
	let ismale = document.getElementById("SexMan").checked;
	document.getElementById("CalculationResult").innerHTML = Calculate(Age,BSA,ismale);
}

function CalculateAHW()
{
	let Age = parseFloat(document.getElementById("Age").value);
	let Height = parseFloat(document.getElementById("height_AHW").value);
	let Weight = parseFloat(document.getElementById("weight_AHW").value);
	let coef1 =0.007184;
	let coef_weight =0.425;
	let coef_height =0.725;
    let BSA = coef1*Math.pow(Weight,coef_weight)*Math.pow(Height,coef_height);
	//console.log(BSA);
	let ismale = document.getElementById("SexMan").checked;
	document.getElementById("CalculationResult").innerHTML = Calculate(Age,BSA,ismale);
}

function Calculate(Age, BSA, ismale) {   
  	let text;
	
    let alpha_AAo=0;
    let beta_AAo=0;
    let gamma_AAo=0;
    let delta_AAo=0;
	let alpha_Sinus=0;
    let beta_Sinus=0;
    let gamma_Sinus=0;
    let delta_Sinus=0;
    let Sex;

    if(ismale)
    {
    	Sex = "man";
    	alpha_AAo = 1.691;
    	beta_AAo = 0.028;
    	gamma_AAo = -0.00009;
    	delta_AAo = 0.505;
		
		alpha_Sinus=2.25;
		beta_Sinus=0.023;
		gamma_Sinus=-0.00014;
		delta_Sinus=0.486;
    }
    else
    {
    	Sex = "woman";
    	alpha_AAo = 1.614;
    	beta_AAo = 0.028;
    	gamma_AAo = -0.00012;
    	delta_AAo = 0.525;
		
		alpha_Sinus=2.145;
		beta_Sinus=0.021;
		gamma_Sinus=-0.00014;
		delta_Sinus=0.448;
    }
    
    let AA95th = alpha_AAo + Age*beta_AAo + Age*Age*gamma_AAo + BSA*delta_AAo;
	let Sinus95th = alpha_Sinus + Age*beta_Sinus + Age*Age*gamma_Sinus + BSA*delta_Sinus;

    text = "For a ";
    text = text + "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + Sex + "</font>";
    text = text + " with a body surface area of <b><font color=\"#42f4eb\">" + BSA.toFixed(2) + "</font></b> m<sup>2</sup>:<br>";
    text = text + "Ascending aortic diameter 95<sup>th</sup> percentile is <b><font color=\"#edca4e\">" + AA95th.toFixed(2) + "</font></b> cm.<br>";
	text = text + "Sinus of Valsalva diameter 95<sup>th</sup> percentile is <b><font color=\"#edca4e\">" + Sinus95th.toFixed(2) + "</font></b> cm.";
    return text;
}

$(window).on("load", function()
{
	window.SelectForm();
	window.Update();
});