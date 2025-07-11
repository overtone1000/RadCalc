import { empty_comparison, mandatory_string_fields, SpineFields, type DEXA_Comparison, type DEXA_Measurements, type FRAX_Risk_Factors, type Hip, type SpineField } from "./basic_types";

export type Bound={
    value:number,
    inclusive:boolean
}

export type Diagnosis={
    name:string,
    lower_bound:Bound,
    upper_bound:Bound
}

export type DEXA_Ingest_Data =
{
    exam:string,
    date:string,
    time:string,
    patient_dob:string,
    frax:{
        locked:boolean,
        risk_factors?:FRAX_Risk_Factors,
        risk_of_osteoporotic_fracture?:number,
        risk_of_hip_fracture?:number,
    },
    spine:Map<SpineField,DEXA_Measurements>,
    hips:{
        left: Hip,
        right: Hip
    },
    radii:{
        left: DEXA_Measurements,
        right: DEXA_Measurements
    },
    dexa_system:string,
    device_serial:string,
    software_version:string,
    technologist_id: string,
    trend:{
        spine:DEXA_Comparison,
        left_hip:DEXA_Comparison,
        right_hip:DEXA_Comparison,
        radius:DEXA_Comparison
    },
    diagnoses:Diagnosis[],
    height_on_prior_template:string,
    measurement_template:string,
    frax_template:string,
    outside_comparison_disclaimer:string,
    change_template:string,
    trend_template:string,
    report_template:string
};

type Import_Result = {
    error:boolean,
    message?:string,
    result?:DEXA_Ingest_Data
};

function import_error(message:string):Import_Result
{
    return {
        error:true,
        message:message
    }
}

function finite_number_or_undefined(input:string):number|undefined
{
    let parsed=parseFloat(input);
    if(Number.isFinite(parsed))
    {
        return parsed;
    }
    else
    {
        return undefined;
    }
}

function get_DEXA_Measurements_from_raw_field(field_value:string|undefined):DEXA_Measurements
{
    const empty:DEXA_Measurements={
        locked: false
    };
    
    if(field_value===undefined){return empty;}
    let subfields = field_value.split(",");
    if(subfields.length!==3){
        {
            return empty;
        }
    }
    else {
        let retval:DEXA_Measurements = {
            locked: false,
            bone_mineral_density: finite_number_or_undefined(subfields[0]),
            t_score: finite_number_or_undefined(subfields[1]),
            z_score: finite_number_or_undefined(subfields[2])
        };

        if(retval.bone_mineral_density !== undefined &&
            retval.t_score !== undefined &&
            retval.z_score !== undefined)
            {
                retval.locked=true;
            }

        return retval;
    }
}

function get_DEXA_Comparison_from_raw_field(field_value:string|undefined):DEXA_Comparison
{
    const empty:DEXA_Comparison={
        locked: false
    };

    if(field_value===undefined){
        return empty;
    }
    let subfields = field_value.split(",");
    if(subfields.length!==2){
    {
        return empty;
    }
    }
    else {
        let retval:DEXA_Comparison = {
            locked:false,
            bone_mineral_density_absolute_change: finite_number_or_undefined(subfields[0]),
            bone_mineral_density_percentage_change: finite_number_or_undefined(subfields[1])
        };

        if(retval.bone_mineral_density_absolute_change !== undefined &&
            retval.bone_mineral_density_percentage_change !== undefined)
            {
                retval.locked=true;
            }

        return retval;
    }
}

function get_validated_number(field_value:string|undefined):number|undefined
{
    if(field_value!==undefined){
        let parse = parseFloat(field_value);
        if(!Number.isNaN(parse))
        {
            return parse;
        }
        else
        {
            return undefined;
        }
    }
}

export const all_possible_newlines=/\r?\n|\r|\n/g;

function get_section_between(ingest_string:string, start_delineator:string, end_delineator:string):{result:string, remaining:string, error?:string}
{
    let start=ingest_string.indexOf(start_delineator);
    if(start===undefined){return {result:"", remaining:ingest_string, error:"Couldn't find start delineator " + start_delineator + " in ingest string."};}

    let end=ingest_string.indexOf(end_delineator);
    if(start===undefined){return {result:"", remaining:ingest_string, error:"Couldn't find end delineator " + end_delineator + " in ingest string."};}

    let result=ingest_string.substring(start+start_delineator.length+1,end);
    let remaining=ingest_string.substring(0,start)+ingest_string.substring(end+end_delineator.length,ingest_string.length);

    //result=result.trim(); //Don't do this. Need to preserve white space for templates.
    remaining=remaining.trim();

    return {
        result,
        remaining
    }
}

function process_field_map(raw_string:string):Map<string,string>
{
    let field_map=new Map<string,string>();
        
    for(const current_line of raw_string.split(all_possible_newlines))
    {
        let field_name=current_line.substring(0,current_line.indexOf(":"));
        let field_value=current_line.substring(current_line.indexOf(":")+1,current_line.length);

        let trimmed=field_value.trim();
        if(trimmed!=="")
        {
            field_map.set(field_name,trimmed);
        }
    }

    return field_map;
}

function parse_diagnoses(raw_diagnoses:string):Diagnosis[]|{error:string}
{
    let field_map=process_field_map(raw_diagnoses);
    let retval:Diagnosis[]=[];
    for(const [key,value] of field_map)
    {
        const err={error:"Malformed diagnosis: " + key + ", " + value};

        let split2=value.split(",");

        if(split2.length!==2){return err;}

        let lb_value:number=parseFloat(split2[0].substring(1,split2[0].length));
        if(Number.isNaN(lb_value)){return err;}
        let lb_inclusive:boolean;
        if(split2[0].charAt(0)==="[")
        {
            lb_inclusive=true;
        }
        else if(split2[0].charAt(0)==="(")
        {
            lb_inclusive=false;
        }
        else
        {
            return err;
        }

        let ub_value:number=parseFloat(split2[1].substring(0,split2[1].length-1));
        if(Number.isNaN(ub_value)){return err;}
        let ub_inclusive:boolean;
        if(split2[1].charAt(split2[1].length-1)==="]")
        {
            ub_inclusive=true;
        }
        else if(split2[1].charAt(split2[1].length-1)===")")
        {
            ub_inclusive=false;
        }
        else
        {
            return err;
        }

        if(lb_value>ub_value){return err;}

        retval.push(
            {
                name: key,
                lower_bound: {
                    value: lb_value,
                    inclusive: lb_inclusive
                },
                upper_bound: {
                    value: ub_value,
                    inclusive: ub_inclusive
                }
            }
        );
    }

    retval.sort(
        (a:Diagnosis,b:Diagnosis)=>{
            let lb_diff=a.lower_bound.value-b.lower_bound.value;
            if(lb_diff!==0){return lb_diff;}
            let ub_diff=a.upper_bound.value-b.upper_bound.value;
            return ub_diff;
    })

    if(retval[0].lower_bound.value!==-Infinity||!retval[0].lower_bound.inclusive){return {error:"Malformed diagnoses. Lowest boundary must be [-Infinity."};}
    if(retval[retval.length-1].upper_bound.value!==Infinity||!retval[retval.length-1].upper_bound.inclusive){return {error:"Malformed diagnosis. Highest boundary must be Infinity]."};}
    for(let n=0;n<retval.length-1;n++)
    {
        if(retval[n].upper_bound.value!==retval[n+1].lower_bound.value){return {error:"Malformed diagnosis boundary between " + retval[n].name + " and " + retval[n+1].name + ". Values must be equal."}}
        if(retval[n].upper_bound.inclusive===retval[n+1].lower_bound.inclusive){return {error:"Malformed diagnosis boundary between " + retval[n].name + " and " + retval[n+1].name + ". One and only one must be inclusive."}}
    }

    console.debug(retval);

    return retval;
}

const height_on_prior_temp_start_delineator="height_on_prior_temp_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const height_on_prior_temp_end_delineator="height_on_prior_temp_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const diagnoses_start_delineator="diagnoses_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const diagnoses_end_delineator="diagnoses_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const outside_comparison_disclaimer_start_delineator="outside_comp_disc_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const outside_comparison_disclaimer_end_delineator="outside_comp_disc_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const measurement_template_start_delineator="meas_temp_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const measurement_template_end_delineator="meas_temp_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const frax_template_start_delineator="frax_temp_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const frax_template_end_delineator="frax_temp_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const change_temp_start_delineator="change_temp_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const change_temp_end_delineator="change_temp_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const trend_temp_start_delineator="trend_temp_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const trend_temp_end_delineator="trend_temp_end_b746e6de6b8e0ec8ef096d3e6bb37270";

const report_start_delineator="report_start_b746e6de6b8e0ec8ef096d3e6bb37270";
const report_end_delineator="report_end_b746e6de6b8e0ec8ef096d3e6bb37270";

export function ingest_data(ingest_data:string):Import_Result
{
    let diagnoses:Diagnosis[];
    {
        let splice = get_section_between(ingest_data,
            diagnoses_start_delineator,
            diagnoses_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            let raw_diagnoses=splice.result;
            ingest_data=splice.remaining;

            let parsed_diagnoses=parse_diagnoses(raw_diagnoses);
            if(Object.keys(parsed_diagnoses).includes("error"))
            {
                return import_error((parsed_diagnoses as {error:string}).error);
            }
            else
            {
                diagnoses=(parsed_diagnoses as Diagnosis[]);
            }
        }
    }

    let height_on_prior_template:string;
    {
        let splice = get_section_between(ingest_data,
            height_on_prior_temp_start_delineator,
            height_on_prior_temp_end_delineator);
        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            height_on_prior_template=splice.result;
            ingest_data=splice.remaining;
        }
    }

    let outside_comparison_disclaimer:string;
    {
        let splice = get_section_between(ingest_data,
            outside_comparison_disclaimer_start_delineator,
            outside_comparison_disclaimer_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            outside_comparison_disclaimer=splice.result;
            ingest_data=splice.remaining;
        }
    }

    let measurement_template:string;
    {
        let splice = get_section_between(ingest_data,
            measurement_template_start_delineator,
            measurement_template_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            measurement_template=splice.result;
            ingest_data=splice.remaining;
        }
    }

    let frax_template:string;
    {
        let splice = get_section_between(ingest_data,
            frax_template_start_delineator,
            frax_template_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            frax_template=splice.result;
            ingest_data=splice.remaining;
        }
    }

    let change_template:string;
    {
        let splice = get_section_between(ingest_data,
            change_temp_start_delineator,
            change_temp_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            change_template=splice.result;
            ingest_data=splice.remaining;
        }
    }

    let trend_template:string;
    {
        let splice = get_section_between(ingest_data,
            trend_temp_start_delineator,
            trend_temp_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            trend_template=splice.result;
            ingest_data=splice.remaining;
        }
    }

    let report_template:string;
    {
        let splice = get_section_between(ingest_data,
            report_start_delineator,
            report_end_delineator);

        if(splice.error!==undefined)
        {
            return import_error(splice.error);
        }
        else
        {
            report_template=splice.result.trim();
            ingest_data=splice.remaining;
        }
    }

    //Now get smaller fields.

    let field_map = process_field_map(ingest_data);

    for(const field_name of mandatory_string_fields)
    {
        if(field_map.get(field_name)===undefined)
        {
            return import_error("Mandatory field " + field_name + " is empty.");
        }
    }

    let risk_factors:string[]=[];
    let raw_risk_factors=field_map.get("risk_factors");
    if(raw_risk_factors!==undefined)
    {
        let parsed_risk_factors=raw_risk_factors.split(",");
        for(let rf of parsed_risk_factors)
        {
            rf=rf.trim();
            if(rf!=="")
            {
                risk_factors.push(rf);
            }
        }
    }

    let risk_of_osteoporotic_fracture = get_validated_number(field_map.get("risk_of_osteoporotic_fracture"));
    let risk_of_hip_fracture = get_validated_number(field_map.get("risk_of_hip_fracture"));
    
    let frax = undefined;
    {
        if(risk_of_osteoporotic_fracture!==undefined && risk_of_hip_fracture!==undefined)
        {
            frax={
                locked:true,
                risk_factors:risk_factors,
                risk_of_osteoporotic_fracture:risk_of_osteoporotic_fracture,
                risk_of_hip_fracture:risk_of_hip_fracture
            }
        }
        else
        {
            frax={
                locked:false,
                risk_factors:risk_factors,
                risk_of_osteoporotic_fracture:undefined,
                risk_of_hip_fracture:undefined
            }
        }
    }

    let spine=new Map<SpineField,DEXA_Measurements>();
    {
        for(const field of SpineFields)
        {
            let value = field_map.get(field);
            let meas = get_DEXA_Measurements_from_raw_field(value);
            if(meas!==undefined)
            {
                spine.set(field,meas);
            }
        }
    }

    let trend={
        spine:empty_comparison(),
        left_hip:empty_comparison(),
        right_hip:empty_comparison(),
        radius:empty_comparison()
    };
    
    {
        let spine=get_DEXA_Comparison_from_raw_field(field_map.get("spine_trend"));
        let left_hip=get_DEXA_Comparison_from_raw_field(field_map.get("hip_left_trend"));
        let right_hip=get_DEXA_Comparison_from_raw_field(field_map.get("hip_right_trend"));
        let radius=get_DEXA_Comparison_from_raw_field(field_map.get("radius_trend"));

        console.debug(spine,left_hip,right_hip,radius);
        if(spine!==undefined){trend.spine=spine;}
        if(left_hip!==undefined){trend.left_hip=left_hip;}
        if(right_hip!==undefined){trend.right_hip=right_hip;}
        if(radius!==undefined){trend.radius=radius;}
    }   

    //Should be validated, so cast types for mandatory members.
    return {
        error:false,
        result:{
            exam:field_map.get("exam") as string,
            date:field_map.get("date") as string,
            time:field_map.get("time") as string,
            patient_dob:field_map.get("patient_dob") as string,
            frax:frax,
            spine:spine,
            hips:{
                left:{
                        total:get_DEXA_Measurements_from_raw_field(field_map.get("hip_left_total")),
                        neck:get_DEXA_Measurements_from_raw_field(field_map.get("hip_left_neck")),
                    },
                right:{
                        total:get_DEXA_Measurements_from_raw_field(field_map.get("hip_right_total")),
                        neck:get_DEXA_Measurements_from_raw_field(field_map.get("hip_right_neck")),
                    },
            },
            radii:{
                left:get_DEXA_Measurements_from_raw_field(field_map.get("left_radius")),
                right:get_DEXA_Measurements_from_raw_field(field_map.get("right_radius")),
            },
            dexa_system:field_map.get("dexa_system") as string,
            device_serial:field_map.get("device_serial") as string,
            software_version:field_map.get("software_version") as string,
            technologist_id: field_map.get("technologist_id") as string,
            trend:trend,
            height_on_prior_template,
            outside_comparison_disclaimer,
            measurement_template,
            frax_template,
            report_template,
            change_template,
            trend_template,
            diagnoses
        }
    };
}