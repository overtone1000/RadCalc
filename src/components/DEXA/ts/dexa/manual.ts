import { type SpineField } from "./basic_types";
import type { DEXA_Ingest_Data } from "./data_ingest";

export type DEXA_Mandatory_Manual_Data =
{
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
        radius:boolean
    },
    use_for_comparison:{
        spine:boolean,
        left_hip:boolean,
        right_hip:boolean,
        radius:boolean,
    }
};

export function empty_mandatory():DEXA_Mandatory_Manual_Data {
    let retval:DEXA_Mandatory_Manual_Data = {
        use_for_analysis:{
            L1:false,
            L2:false,
            L3:false,
            L4:false,
            left_hip_total:false,
            left_hip_neck:false,
            right_hip_total:false,
            right_hip_neck:false,
            radius:false
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
        }
    };
    return retval;
};


export function init_mandatory(ingest:DEXA_Ingest_Data):DEXA_Mandatory_Manual_Data{
    let retval:DEXA_Mandatory_Manual_Data = empty_mandatory();

    if(ingest.trend!==undefined)
    {
        retval.comparison={
            exists:true,
            date:undefined
        }
    }

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

    if(ingest.radius)
    {
        retval.use_for_analysis.radius=true;
    }

    if(ingest.trend)
    {
        if(ingest.trend.spine){retval.use_for_comparison.spine=true;}
        if(ingest.trend.left_hip){retval.use_for_comparison.left_hip=true;}
        if(ingest.trend.right_hip){retval.use_for_comparison.right_hip=true;}
        if(ingest.trend.radius){retval.use_for_comparison.radius=true;}
    }

    return retval;
}