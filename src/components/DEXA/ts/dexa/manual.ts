import type { DEXA_Ingest_Data } from "./data_ingest";

export enum FRAXExclusionReason {
    LessThan40YearsOld,
    MoreThan90YearsOld,
    HipsNotEvaluated,
    Other
}

export function getFRAXExclusionReasonText(reason:{reason:FRAXExclusionReason,other_text:string})
{
    switch(reason.reason)
    {
        case FRAXExclusionReason.LessThan40YearsOld:return "The patient is younger than 40 years of age, which precludes FRAX risk assessment.";
        case FRAXExclusionReason.MoreThan90YearsOld:return "The patient is older than 90 years of age, which precludes FRAX risk assessment.";
        case FRAXExclusionReason.HipsNotEvaluated:return "The hips could not be evaluated, which precludes FRAX risk assessment.";
        case FRAXExclusionReason.Other:return reason.other_text;
    }
}

export type HeightInInches = {
    exists:boolean,
    height_in_inches:number|null,
};

export function UseAlternativeDiagnosis(ingest:DEXA_Ingest_Data, manual:DEXA_Mandatory_Manual_Data)
{
    if(ingest.patient_sex==="M")
    {
        return manual.age<ingest.alternative_diagnosis_ranges.male_lower_age_boundary;
    }
    else
    {
        return manual.age<ingest.alternative_diagnosis_ranges.female_lower_age_boundary || manual.post_menopausal.value==="pre";
    }
}

export type DEXA_Mandatory_Manual_Data =
{
    age:number,
    post_menopausal:{
        display:boolean,
        value:"pre"|"post"|null
    }
    reported_tallest_height:{
        exists:boolean,
        feet:number|null,
        inches:number|null
    },
    height_in_inches:HeightInInches
    comparison:{
        exists:boolean,
        date?:string,
        outside_comparison?:boolean,
        height_in_inches:HeightInInches 
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
    reason_for_frax_exclusion:{
        reason:FRAXExclusionReason,
        other_text:string
    },
    technical_comments:{
        spine_osteophyte:boolean
    }
};

export function empty_mandatory():DEXA_Mandatory_Manual_Data {
    let retval:DEXA_Mandatory_Manual_Data = {
        age: 0,
        post_menopausal:{
            display:true,
            value:null
        },
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
            exists:true,
            feet:null,
            inches:null
        },
        height_in_inches:{
            exists:true,
            height_in_inches:null
        },
        comparison:{
            exists:false,
            date:undefined,
            height_in_inches:{
                exists:true,
                height_in_inches:null
            }
        },
        use_frax:true,
        reason_for_frax_exclusion:{reason:FRAXExclusionReason.Other,other_text:""},
        technical_comments:{
            spine_osteophyte:false
        }
    };
    return retval;
};

const millis_per_year=365.25*24*60*60*1000;
export function init_mandatory(ingest:DEXA_Ingest_Data):DEXA_Mandatory_Manual_Data{
    let retval:DEXA_Mandatory_Manual_Data = empty_mandatory();

    for(const [key,value] of ingest.spine)
    {
        if(value.locked){
            if(key.includes("1")){retval.use_for_analysis.L1=true;}
            if(key.includes("2")){retval.use_for_analysis.L2=true;}
            if(key.includes("3")){retval.use_for_analysis.L3=true;}
            if(key.includes("4")){retval.use_for_analysis.L4=true;}
        }
    }

    //For hips and radii, initial lock state from ingest determines whether they should be used
    if(ingest.hips.left.neck.locked){retval.use_for_analysis.left_hip_neck=true;}
    if(ingest.hips.left.total.locked){retval.use_for_analysis.left_hip_total=true;}
    if(ingest.hips.right.neck.locked){retval.use_for_analysis.right_hip_neck=true;}
    if(ingest.hips.right.total.locked){retval.use_for_analysis.right_hip_total=true;}
    if(ingest.radii.right.locked){retval.use_for_analysis.right_radius=true;}
    if(ingest.radii.left.locked){retval.use_for_analysis.left_radius=true;}

    if(ingest.frax.risk_of_hip_fracture!==undefined && ingest.frax.risk_of_osteoporotic_fracture!==undefined)
    {
        retval.use_frax=true;
    }
    else
    {
        retval.use_frax=false;
    }

    retval.age=((new Date(ingest.date)).getTime()-(new Date(ingest.patient_dob)).getTime())/millis_per_year;
    console.debug("Calculated age is " + retval.age + " years.");
    if(retval.age<40)
    {
        //If age<40, guess that this is the reason for no FRAX.
        retval.reason_for_frax_exclusion={reason:FRAXExclusionReason.LessThan40YearsOld,other_text:""};
    }
    else if(retval.age>90)
    {
        retval.reason_for_frax_exclusion={reason:FRAXExclusionReason.MoreThan90YearsOld,other_text:""};
    }
    else if(!(ingest.hips.left.neck.locked || ingest.hips.right.neck.locked))
    {
        //If neither hip is locked, hips may not have been analyzed, so guess that this is the reason for no FRAX.
        retval.reason_for_frax_exclusion={reason:FRAXExclusionReason.HipsNotEvaluated,other_text:""};
    }

    if(ingest.patient_sex=="M")
    {
        retval.post_menopausal.display=false;
    }
    else
    {
        retval.post_menopausal.display=true;
        if(retval.age>=ingest.alternative_diagnosis_ranges.female_postmenopausal_assumption_age)
        {
            retval.post_menopausal.value="post";
        }
        else if(retval.age<ingest.alternative_diagnosis_ranges.female_premenopausal_assumption_age)
        {
            retval.post_menopausal.value="pre";
        }
    }

    if(ingest.trend)
    {
        if(ingest.trend.spine.bone_mineral_density_absolute_change !== undefined ||
            ingest.trend.spine.bone_mineral_density_percentage_change !== undefined
        ){
            retval.use_for_comparison.spine=true;
        }

        if(ingest.trend.left_hip.bone_mineral_density_absolute_change !== undefined  ||
            ingest.trend.left_hip.bone_mineral_density_percentage_change !== undefined 
        ){
            retval.use_for_comparison.left_hip=true;
        }

        if(ingest.trend.right_hip.bone_mineral_density_absolute_change !== undefined  ||
            ingest.trend.right_hip.bone_mineral_density_percentage_change !== undefined 
        ){
            retval.use_for_comparison.right_hip=true;
        }

        if(ingest.trend.radius.bone_mineral_density_absolute_change !== undefined  ||
            ingest.trend.radius.bone_mineral_density_percentage_change !== undefined 
        ){
            retval.use_for_comparison.radius=true;
        }
    }

    if(retval.use_for_comparison.spine || retval.use_for_comparison.left_hip || retval.use_for_comparison.right_hip || retval.use_for_comparison.radius)
    {
        retval.comparison.exists=true;
    }

    return retval;
}