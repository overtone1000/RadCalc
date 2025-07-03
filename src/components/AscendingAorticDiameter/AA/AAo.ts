export function CalculateAAo(Age:number, BSA:number, sex:"male"|"female")
{
    let alpha_AAo=0;
    let beta_AAo=0;
    let gamma_AAo=0;
    let delta_AAo=0;
	let alpha_Sinus=0;
    let beta_Sinus=0;
    let gamma_Sinus=0;
    let delta_Sinus=0;

    if(sex==="male")
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