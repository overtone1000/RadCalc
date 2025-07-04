import { windows_newline } from "../DEXA/ts/dexa/generate_report.js";
import { newline } from "../globals.js";
import type { RowProps } from "./row.svelte";

const ms_per_year=1000*60*60*24;

export type Result={html:string,plain:string}|undefined;

export function get_result(data:RowProps[]):Result
{
	for(const datum of data)
	{
		if(!datum || !datum.volume || !datum.date)
		{
			return undefined;
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

	let dates = data.map(
		(datum)=>{
			return Date.parse(datum.date!);
		}
	);
	
	let retval={html:"",plain:""};
	for(let n=0;n<data.length-1;n++)
	{	
		let milliseconds:number=dates[n+1]-dates[n];
		let days = milliseconds/ms_per_year;
		let vrat = data[1].volume!/data[0].volume!;
		let doublingtime = Math.log(2)*days/Math.log(vrat);

		let change_description:string;
		if(vrat>1)
		{
			let unit:string;
			if(doublingtime.toFixed(0)==="1"){unit=" day.";}
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

		let intervaldaysorday="days";
		if(days.toFixed(0)==="1"){intervaldaysorday="day"}
		let line="In " + days.toFixed(0) + " " + intervaldaysorday + ", the volume " + change_description;
		retval.html+=line+"<br>";
		retval.plain+=line+windows_newline;
	}

	return retval;
}
