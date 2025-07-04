import { windows_newline } from "../../DEXA/ts/dexa/generate_report.js";
import { newline } from "../../globals.js";
import { CalculateAAo, type AAoResult } from "./AAo.js"; //must include .js for this to work in the browser

export type Result={
	html:string,
	raw:string
}

export type Results={
	caution?:string,
	inbounds?:Result,
	extrapolated?:Result,
	atbound?:Result
}

function createWarning(parameter:string, is_low:boolean)
{
	let low_or_high_phrase;
	if(is_low)
	{
		low_or_high_phrase = "is below the 5th percentile";
	}
	else
	{
		low_or_high_phrase = "is above the 95th percentile";
	}
	return "<font color=\"#ff0000\">Caution: The patient's " + parameter + " " + low_or_high_phrase + " for the study population.</font><br>"
}


const ctext={
		for_a:"For a ",
		year_old:" year old ",
		with_bsa_of:" with a body surface area of ",
		aao_diam:"Ascending aortic diameter ",
		sov_diam:"Sinus of Valsalva diameter ",
		percentile:" percentile ",
		cm: " cm"
};
type VariableText = {
	highlight1_start:string,
	highlight1_stop:string,
	highlight2_start:string,
	highlight2_stop:string,
	m2:string,
	br:string,
	_95th:string
};
const html_text:VariableText={
	highlight1_start:"<b><font color=\"#42f4eb\">",
	highlight1_stop:"</font></b>",
	highlight2_start:"<b><font color=\"#edca4e\">",
	highlight2_stop:"</font></b>",
	m2:" m<sup>2</sup>",
	br:"<br>",
	_95th:"95<sup>th</sup>"
};
const plain_text:VariableText={
	highlight1_start:"",
	highlight1_stop:"",
	highlight2_start:"",
	highlight2_stop:"",
	m2:" m^2",
	br:windows_newline,
	_95th:"95th"
};

type Pre=">"|"<"|"";
type Verb="is"|"is at least"|"is at most"|"extrapolates to";

function createResultText(Age:number, BSA:number, age_pre:Pre, BSA_pre:Pre, sex:"man"|"woman", result:AAoResult, vtext:VariableText, verb:Verb):string{
	let text = ctext.for_a;
    text +=  vtext.highlight1_start + age_pre + Age.toFixed(0) + vtext.highlight1_stop + ctext.year_old + vtext.highlight1_start + sex + vtext.highlight1_stop;
    text += ctext.with_bsa_of + vtext.highlight1_start + BSA_pre + BSA.toFixed(2) + vtext.highlight1_stop + vtext.m2 + "," + vtext.br;
    text += ctext.aao_diam + vtext._95th + ctext.percentile + verb + " " + vtext.highlight2_start + result.AA95th.toFixed(2) + vtext.highlight2_stop + ctext.cm + vtext.br;
	text += ctext.sov_diam + vtext._95th + ctext.percentile + verb + " " + vtext.highlight2_start + result.Sinus95th.toFixed(2) + vtext.highlight2_stop + ctext.cm + vtext.br;
	return text;
}

function createInBoundsText(Age:number, BSA:number, sex:"man"|"woman", result:AAoResult):Result{
	let verb:Verb="is";
	return {
		html:createResultText(Age,BSA,"","",sex,result,html_text,verb),
		raw:createResultText(Age,BSA,"","",sex, result,plain_text,verb)
	}
}

function createExtrapolatedText(Age:number, BSA:number, sex:"man"|"woman", result:AAoResult):Result{
	let verb:Verb="extrapolates to";
	return {
		html:createResultText(Age,BSA,"","",sex,result,html_text,verb),
		raw:createResultText(Age,BSA,"","",sex, result,plain_text,verb)
	}
}

function createAtBoundaryText(Age:number, BSA:number, age_pre:Pre, BSA_pre:Pre, verb:Verb, sex:"man"|"woman", result:AAoResult):Result{
	return {
		html:createResultText(Age,BSA,age_pre,BSA_pre,sex,result,html_text,verb),
		raw:createResultText(Age,BSA,age_pre,BSA_pre,sex,result,plain_text,verb)
	}
}

function detect_bounds(Age:number, BSA:number, sex:"man"|"woman")
{
	let age_lower_bound:number;
	let age_upper_bound:number;
	let bsa_lower_bound:number;
	let bsa_upper_bound:number;

	if(sex==="man")
	{
		age_lower_bound = Math.ceil(42.9-13.6*2);
		age_upper_bound = Math.floor(42.9+13.6*2);
		bsa_lower_bound = 1.95-0.17*2;
		bsa_upper_bound = 1.95+0.17*2;
	}
	else
	{
		age_lower_bound = Math.ceil(45.0-13.9*2);
		age_upper_bound = Math.floor(45.0+13.9*2);
		bsa_lower_bound = 1.69-0.16*2;
		bsa_upper_bound = 1.69+0.16*2;
	}

	const age_low=Age<age_lower_bound;
	const age_high=Age>age_upper_bound;
	const BSA_low=BSA<bsa_lower_bound;
	const BSA_high=BSA>bsa_upper_bound;

	return {
		age_lower_bound,
		age_upper_bound,
		bsa_lower_bound,
		bsa_upper_bound,
		age_low,
		age_high,
		BSA_low,
		BSA_high
	};
}

export function createText(Age:number, BSA:number, sex:"man"|"woman"):Results{

	let calc = CalculateAAo(Age, BSA, sex);

	let caution:string|undefined="";

	let {
		age_lower_bound,
		age_upper_bound,
		bsa_lower_bound,
		bsa_upper_bound,
		age_low,
		age_high,
		BSA_low,
		BSA_high
	}=detect_bounds(Age,BSA,sex);

	let bound_age=Age;
	let bound_BSA=BSA;

	let age_pre:Pre="";
	let bsa_pre:Pre="";

	if(age_low)
	{
		caution += createWarning("age",true);
		bound_age=age_lower_bound;
		age_pre="<";
	}
	else if(age_high)
	{
		caution += createWarning("age",false);
		bound_age=age_upper_bound;
		age_pre=">";
	}

	if(BSA_low)
	{
		caution += createWarning("BSA",true);
		bound_BSA=bsa_lower_bound;
		bsa_pre="<";
	}
	else if(BSA_high)
	{
		caution += createWarning("BSA",false);
		bound_BSA=bsa_upper_bound;
		bsa_pre=">";
	}

	let retval:Results={
	};
	
	if(age_low || age_high || BSA_low || BSA_high)
	{	
		retval.caution=caution;
		retval.extrapolated=createExtrapolatedText(Age,BSA,sex,calc);

		if(!(age_low && BSA_high) && !(age_high && BSA_low))
		{
			let verb:Verb;
			if(age_low||BSA_low)
			{
				verb="is at most";
			}
			else {
				verb="is at least";
			}

			let boundedcalc=CalculateAAo(bound_age, bound_BSA, sex);
			retval.atbound=createAtBoundaryText(bound_age,bound_BSA,age_pre,bsa_pre,verb,sex,boundedcalc)
		}
	}
	else{
		retval.inbounds=createInBoundsText(Age,BSA,sex,calc)
	}
	
    return retval;
}

export function createTextAD(Age:number, BSA:number, ADiam:number, sex:"man"|"woman"):Results
{
	const line1 = "For a ";
	const line2 = ", an ascending aortic diameter of ";
	const line3 = " cm would be less than the ";
	const line4 = " percentile if the patient's BSA is greater than ";

	let text = line1;
    text = text + "<b><font color=\"#42f4eb\">" + Age.toFixed(0) + "</font></b> year old <font color=\"#42f4eb\">" + sex + "</font>";
    text = text + line2 + "<b><font color=\"#42f4eb\">" + ADiam.toFixed(2) + "</font></b>";	
    text = text + line3 + "95<sup>th</sup>" + line4 + "<b><font color=\"#edca4e\">" + BSA.toFixed(2) + "</font></b> m<sup>2</sup>.";
    
	let text_for_copy = line1;
	text_for_copy += Age.toFixed(0) + " year old " + sex + line2 + ADiam.toFixed(2) + line3 + "95th" + line4 + BSA.toFixed(2) + " m^2.";

	return {
		inbounds:{
			html:text,
			raw:text_for_copy
		}
	}
}