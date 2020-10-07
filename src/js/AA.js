let absa_input=false;
let ahw_input=false;
let ad_input=false;

function SelectForm(){
	absa_input = document.getElementById("AgeBSARadio").checked;
    ahw_input = document.getElementById("AgeHeightWeightRadio").checked;
	ad_input = document.getElementById("AgeDiameterRadio").checked;
	
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
	
	Update();
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
		CalculateAD()
    }
}

function CalculateABSA(){
	let Age = parseFloat(document.getElementById("Age").value);
    let BSA = parseFloat(document.getElementById("BSA_ABSA").value);
	let ismale = document.getElementById("SexMan").checked;
	document.getElementById("CalculationResult").innerHTML = createText(Age,BSA,ismale);
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
	document.getElementById("CalculationResult").innerHTML = createText(Age,BSA,ismale);
}

function CalculateAD()
{
	let Age = parseFloat(document.getElementById("Age").value);
	let ADiam = parseFloat(document.getElementById("aad_ad").value);
	let ismale = document.getElementById("SexMan").checked;

	let guesses = new Object();
	guesses.left = new Object();
	guesses.right = new Object();
	guesses.getAA95th = function(BSA)
	{
		return Calculate(this.Age,BSA,this.ismale).AA95th
	}
	guesses.initialize = function(Age, ismale, ADiam)
	{
		this.Age = Age;
		this.ismale=ismale;
		this.ADiam=ADiam;

		let low_init=1.5;
		let high_init=2.0;
		let low_calc = this.getAA95th(low_init);
		let high_calc = this.getAA95th(high_init);
		this.left = {BSA:low_init,AA95th:low_calc};
		this.right = {BSA:high_init,AA95th:high_calc};
		console.debug("Initialized for age " + this.Age + ", ismale " + this.ismale + " ADiam " + this.ADiam);
		console.debug(this.left);
		console.debug(this.right);
		this.iterate();
	}
	guesses.iterate = function()
	{
		let slope = (this.right.BSA-this.left.BSA)/(this.right.AA95th-this.left.AA95th);
		let new_BSA = (this.ADiam-this.left.AA95th)*slope + this.left.BSA;
		let new_AA95th = this.getAA95th(new_BSA);
		this.err = new_AA95th-this.ADiam;
		this.last = {BSA:new_BSA,AA95th:new_AA95th};
		if(this.err>0)
		{
			this.right = this.last;
		}
		else
		{
			this.left = this.last;
		}
		console.debug("Iteration. New BSA " + new_BSA + ", new AA95th " + new_AA95th + "(err="+this.err+")");
		console.debug(this.left);
		console.debug(this.right);
	}

	guesses.initialize(Age, ismale, ADiam);
	let count = 0;
	while(Math.abs(this.err)>0.001)
	{
		guesses.iterate();
		if(count++>1000)
		{
			return "Could not calculate.";
		}
	}

	let Sex;
	if(ismale)
	{
		Sex = "man";
	}
	else{
		Sex = "woman";
	}

	let text = "For a ";
    text = text + "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + Sex + "</font>";
    text = text + " an ascending aortic diameter of <b><font color=\"#42f4eb\">" + ADiam.toFixed(2) + "</font></b> cm<sup>2</sup>";
<<<<<<< HEAD:src/js/AA.js
    text = text + " would be less than the 95<sup>th</sup> percentile if the patient's BSA is greater than <b><font color=\"#edca4e\">" + guesses.last.BSA.toFixed(2) + "</font></b> m<sup>2</sup>.";
=======
    text = text + " would be less than the 95<sup>th</sup> percentile if the patient's BSA is greater than <b><font color=\"#edca4e\">" + guesses.last.BSA.toFixed(2) + "</font></b> m<sup>2</sup>";
>>>>>>> 731d2b5747807b629c9b972a086a6e0884eea194:calculators/js/AA.js
    document.getElementById("CalculationResult").innerHTML = text;
}

function Calculate(Age, BSA, ismale)
{
    let alpha_AAo=0;
    let beta_AAo=0;
    let gamma_AAo=0;
    let delta_AAo=0;
	let alpha_Sinus=0;
    let beta_Sinus=0;
    let gamma_Sinus=0;
    let delta_Sinus=0;

    if(ismale)
    {
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

	return {AA95th:AA95th,Sinus95th:Sinus95th};
}

function createText(Age, BSA, ismale) {
	let calc = Calculate(Age, BSA, ismale);
	let Sex;
	if(ismale)
	{
		Sex = "man";
	}
	else{
		Sex = "woman";
	}

    let text = "For a ";
    text = text + "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + Sex + "</font>";
    text = text + " with a body surface area of <b><font color=\"#42f4eb\">" + BSA.toFixed(2) + "</font></b> m<sup>2</sup>:<br>";
    text = text + "Ascending aortic diameter 95<sup>th</sup> percentile is <b><font color=\"#edca4e\">" + calc.AA95th.toFixed(2) + "</font></b> cm.<br>";
	text = text + "Sinus of Valsalva diameter 95<sup>th</sup> percentile is <b><font color=\"#edca4e\">" + calc.Sinus95th.toFixed(2) + "</font></b> cm.";
    return text;
}

$(window).on("load", function()
{
	window.SelectForm();
	window.Update();
});