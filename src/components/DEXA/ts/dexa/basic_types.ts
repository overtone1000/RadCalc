export type DEXA_Measurements =
{
    locked:boolean,
    bone_mineral_density?:number,
    t_score?:number,
    z_score?:number
}

export type DEXA_Comparison =
{
    locked:boolean,
    bone_mineral_density_absolute_change?:number,
    bone_mineral_density_percentage_change?:number
}

export function empty_comparison():DEXA_Comparison{
    return {
        locked:false
    };
}


export const mandatory_string_fields = [
    "exam",
    "date",
    "time",
    "patient_dob",
    "patient_sex",
    "dexa_system",
    "device_serial",
    "software_version",
    "technologist_id",
];

export const SpineFields:SpineField[] = [
    "L1",
    "L2",
    "L3",
    "L4",
    "L12",
    "L13",
    "L14",
    "L23",
    "L24",
    "L34",
    "L123",
    "L124",
    "L134",
    "L234",
    "L1234",
];

export type SpineField = 
    "L1"|
    "L2"|
    "L3"|
    "L4"|
    "L12"|
    "L13"|
    "L14"|
    "L23"|
    "L24"|
    "L34"|
    "L123"|
    "L124"|
    "L134"|
    "L234"|
    "L1234";

export function getSpineField(L1:boolean, L2:boolean, L3:boolean, L4:boolean):SpineField|undefined
{
    if(!(L1||L2||L3||L4)){
        return undefined;
    }
    else
    {
        let retval="L";
        if(L1){retval+="1";}
        if(L2){retval+="2";}
        if(L3){retval+="3";}
        if(L4){retval+="4";}
        return retval as SpineField;
    }
}

export const DEXA_trend_fields = [
    "spine_trend",
    "hip_left_trend",
    "hip_right_trend",
    "radius_trend"
];

export type Hip = 
{
    total:DEXA_Measurements,
    neck:DEXA_Measurements
}

export type FRAX_Risk_Factors = string[];

export type Diagnosis = "High bone mass" | "Normal bone mass" | "Low normal bone mass" | "Low bone mass" | "Osteoporosis"