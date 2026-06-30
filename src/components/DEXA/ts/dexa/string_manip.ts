import type { DEXA_Mandatory_Manual_Data } from "./manual";

export function array_to_string(arr:string[]):string{
    let retval="";
    if(arr.length===1){retval+=arr[0];}
    if(arr.length===2){retval+=arr[0] + " and " + arr[1];}
    if(arr.length>2){
        for(let n=0;n<arr.length-1;n++)
        {
            retval+=arr[n]+", ";
        }
        retval+="and " + arr[arr.length-1];
    }
    return retval;
}

export function get_spine_string(manual:DEXA_Mandatory_Manual_Data)
{
    let spine="";
    if(manual.use_for_analysis.L1 && manual.use_for_analysis.L2 && manual.use_for_analysis.L3 && manual.use_for_analysis.L4)
    {
        spine+="L1-4";
    }
    else if(manual.use_for_analysis.L1 && manual.use_for_analysis.L2 && manual.use_for_analysis.L3)
    {
        spine+="L1-3";
    }
    else if(manual.use_for_analysis.L2 && manual.use_for_analysis.L3 && manual.use_for_analysis.L4)
    {
        spine+="L2-4";
    }
    else if(manual.use_for_analysis.L1 && manual.use_for_analysis.L2 && !manual.use_for_analysis.L3 && !manual.use_for_analysis.L4)
    {
        spine+="L1-2";
    }
    else if(!manual.use_for_analysis.L1 && manual.use_for_analysis.L2 && manual.use_for_analysis.L3 && !manual.use_for_analysis.L4)
    {
        spine+="L2-3";
    }
    else if(!manual.use_for_analysis.L1 && !manual.use_for_analysis.L2 && manual.use_for_analysis.L3 && manual.use_for_analysis.L4)
    {
        spine+="L3-4";
    }
    else
    {
        let levels:string[]=[];
        if(manual.use_for_analysis.L1){levels.push("L1");}
        if(manual.use_for_analysis.L2){levels.push("L2");}
        if(manual.use_for_analysis.L3){levels.push("L3");}
        if(manual.use_for_analysis.L4){levels.push("L4");}

        spine = array_to_string(levels);
    }
    if(spine!==""){
        return spine;
    }
    else
    {
        return null;
    }
}