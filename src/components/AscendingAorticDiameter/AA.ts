import { CalculateAAo } from "./AA/AAo";

type Guess = {
	BSA:number,
	AA95th:number
};

export type Sex = "man"|"woman";

export type Guesses =
{
	left:Guess,
	right:Guess,
	last?:Guess,
	Age:number,
	ADiam:number,
	sex:"man"|"woman",
	err:number
};

function get_guess(Age:number, BSA:number, sex:"man"|"woman"):Guess
{
	return {
		BSA:BSA,
		AA95th:CalculateAAo(Age,BSA,sex).AA95th
	};
}

export function initialize_guesses(Age:number, ADiam:number, sex:"man"|"woman"):Guesses
{
	let low_init_BSA=1.5;
	let hight_init_BSA=2.0;

	return {
		left:get_guess(Age, low_init_BSA, sex),
		right:get_guess(Age, hight_init_BSA, sex),
		Age:Age,
		ADiam:ADiam,
		sex:sex,
		err:Number.POSITIVE_INFINITY
	};
}

export function iterate_guesses(guesses:Guesses)
{
	let slope = (guesses.right.BSA-guesses.left.BSA)/(guesses.right.AA95th-guesses.left.AA95th);
	let new_BSA = (guesses.ADiam-guesses.left.AA95th)*slope + guesses.left.BSA;
	guesses.last=get_guess(guesses.Age, new_BSA, guesses.sex)
	
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