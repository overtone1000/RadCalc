import { type SpineField } from "./basic_types";
import type { DEXA_Ingest_Data } from "./data_ingest";

export type FRAX = "The hips could not be evaluated, which precludes FRAX risk assessment."|"The patient is younger than 40 years of age, which precludes FRAX risk assessment."|string|undefined;
export type DEXA_Mandatory_Manual_Data =
{
    age:number,
    reported_tallest_height:{
        feet?:number,
        inches?:number
    },
    recorded_height_inches?:number,
    comparison:{
        exists:boolean,
        date?:string,
        outside_comparison?:boolean,
        recorded_height_inches?:number,   
    },
    use_for_analysis:{
        L1:boolean,
        L2:boolean,
        L3:boolean,
        L4:boolean,
        left_hip_total:boolean,
        left_hip_neck:boolean,
        right_hip_total:boolean,
        right_hip_neck:boolean,
        left_radius:boolean,
        right_radius:boolean,
    },
    use_for_comparison:{
        spine:boolean,
        left_hip:boolean,
        right_hip:boolean,
        radius:boolean,
    },
    use_frax:boolean,
    reason_for_frax_exclusion:FRAX
};

export function empty_mandatory():DEXA_Mandatory_Manual_Data {
    let retval:DEXA_Mandatory_Manual_Data = {
        age: 0,
        use_for_analysis:{
            L1:false,
            L2:false,
            L3:false,
            L4:false,
            left_hip_total:false,
            left_hip_neck:false,
            right_hip_total:false,
            right_hip_neck:false,
            left_radius:false,
            right_radius:false,
        },
        use_for_comparison:{
            spine:false,
            left_hip:false,
            right_hip:false,
            radius:false,
        },
        reported_tallest_height:{
            feet:undefined,
            inches:undefined
        },
        comparison:{
            exists:false,
            date:undefined
        },
        use_frax:true,
        reason_for_frax_exclusion:undefined
    };
    return retval;
};

const millis_per_year=365.25*24*60*60*1000;
export function init_mandatory(ingest:DEXA_Ingest_Data):DEXA_Mandatory_Manual_Data{
    let retval:DEXA_Mandatory_Manual_Data = empty_mandatory();

    for(const key of ingest.spine.keys())
    {
        if(key.includes("1")){retval.use_for_analysis.L1=true;}
        if(key.includes("2")){retval.use_for_analysis.L2=true;}
        if(key.includes("3")){retval.use_for_analysis.L3=true;}
        if(key.includes("4")){retval.use_for_analysis.L4=true;}
    }

    if(ingest.hips)
    {
        if(ingest.hips.left)
        {
            if(ingest.hips.left.neck){retval.use_for_analysis.left_hip_neck=true;}
            if(ingest.hips.left.total){retval.use_for_analysis.left_hip_total=true;}
        }
        if(ingest.hips.right)
        {
            if(ingest.hips.right.neck){retval.use_for_analysis.right_hip_neck=true;}
            if(ingest.hips.right.total){retval.use_for_analysis.right_hip_total=true;}
        }
    }

    retval.age=((new Date(ingest.date)).getTime()-(new Date(ingest.patient_dob)).getTime())/millis_per_year;
    console.debug("Calculated age is " + retval.age + " years.");
    if(retval.age<40)
    {
        retval.use_frax=false;
        retval.reason_for_frax_exclusion="The patient is younger than 40 years of age, which precludes FRAX risk assessment.";
    }
    else if(!(ingest.hips.left.neck || ingest.hips.right.neck))
    {
        retval.use_frax=false;
        retval.reason_for_frax_exclusion="The hips could not be evaluated, which precludes FRAX risk assessment."
    }

    if(ingest.radii.left)
    {
        retval.use_for_analysis.left_radius=true;
    }

    if(ingest.radii.right)
    {
        retval.use_for_analysis.right_radius=true;
    }


    if(ingest.trend)
    {
        if(ingest.trend.spine.bone_mineral_density_absolute_change ||
            ingest.trend.spine.bone_mineral_density_percentage_change
        ){
            retval.use_for_comparison.spine=true;
        }

        if(ingest.trend.left_hip.bone_mineral_density_absolute_change ||
            ingest.trend.left_hip.bone_mineral_density_percentage_change
        ){
            retval.use_for_comparison.left_hip=true;
        }

        if(ingest.trend.right_hip.bone_mineral_density_absolute_change ||
            ingest.trend.right_hip.bone_mineral_density_percentage_change
        ){
            retval.use_for_comparison.right_hip=true;
        }

        if(ingest.trend.radius.bone_mineral_density_absolute_change ||
            ingest.trend.radius.bone_mineral_density_percentage_change
        ){
            retval.use_for_comparison.radius=true;
        }
    }

    if(retval.use_for_comparison.spine || retval.use_for_comparison.left_hip || retval.use_for_comparison.right_hip || retval.use_for_comparison.radius)
    {
        retval.comparison={
            exists:true,
            date:undefined
        }
    }

    return retval;
}