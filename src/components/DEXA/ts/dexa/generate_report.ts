import { newline } from "../../../globals";
import { getSpineField, type DEXA_Comparison, type DEXA_Measurements } from "./basic_types";
import { all_possible_newlines, type DEXA_Ingest_Data } from "./data_ingest";
import { getFRAXExclusionReasonText, type DEXA_Mandatory_Manual_Data } from "./manual";

export const windows_newline="\r\n";

function array_to_string(arr:string[]):string{
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

export function generate_report(ingest:DEXA_Ingest_Data, manual:DEXA_Mandatory_Manual_Data):string
{
    let retval=ingest.report_template;

    retval=retval.replace("$EXAM$",ingest.exam);
    retval=retval.replace("$EXAM_DATE$",ingest.date);
    retval=retval.replace("$EXAM_TIME$",ingest.time);

    //Comparison
    {
        let comp_str="None available";
        if(manual.comparison.exists){
            if(manual.comparison.date===undefined)
            {
                return "Error: Comparison date not input. Report generation aborted.";
            }
            else
            {
                console.debug(manual.comparison.date);
                let date = new Date(manual.comparison.date);
                console.debug(date);
                comp_str=(date.getMonth()+1)+"/"+(date.getDate()+1)+"/"+date.getFullYear();
            }
        }
        retval=retval.replace("$COMPARISON_DATE_OR_NONE$",comp_str);
    }

    //Diagnosis
    {
        let diagnosis=select_diagnosis(ingest,manual);
        if(diagnosis===undefined)
        {
            return "Error: Couldn't select diagnosis.";
        }
        else
        {
            retval=retval.replace("$DIAGNOSIS$",diagnosis.name);
        }
    }

    //Quality
    {
        let included_sites="Analysis includes ";

        let site_groups:string[]=[];
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
            if(spine!==""){site_groups.push(spine);}
        }

        {
            if(manual.use_for_analysis.left_hip_neck && manual.use_for_analysis.left_hip_total)
            {
                site_groups.push("the left hip and femoral neck");
            }
            else if(manual.use_for_analysis.left_hip_total)
            {
                site_groups.push("the left hip");
            }
            else if(manual.use_for_analysis.left_hip_neck)
            {
                site_groups.push("the left femoral neck");
            }
        }

        {
            if(manual.use_for_analysis.right_hip_neck && manual.use_for_analysis.right_hip_total)
            {
                site_groups.push("the right hip and femoral neck");
            }
            else if(manual.use_for_analysis.right_hip_total)
            {
                site_groups.push("the right hip");
            }
            else if(manual.use_for_analysis.right_hip_neck)
            {
                site_groups.push("the right femoral neck");
            }
        }

        if(manual.use_for_analysis.left_radius && manual.use_for_analysis.right_radius)
        {
            site_groups.push("both radii");
        }
        else if(manual.use_for_analysis.left_radius){site_groups.push("the left radius");}
        else if(manual.use_for_analysis.right_radius){site_groups.push("the right radius");}

        included_sites+=array_to_string(site_groups);

        let full_quality_section=included_sites+".";

        if(!manual.use_frax){           
            full_quality_section+=" "+getFRAXExclusionReasonText(manual.reason_for_frax_exclusion);
        }

        retval=retval.replace("$INCLUDED_SITES$",full_quality_section);
    }

    //FRAX
    retval=retval.replace("$FRAX$",frax(ingest,manual))

    //Height
    {
        let reported_tallest_height:string = "Not reported by the patient.";
        if(manual.reported_tallest_height.feet!==undefined && manual.reported_tallest_height.inches!==undefined)
        {
            reported_tallest_height=(manual.reported_tallest_height.feet*12+manual.reported_tallest_height.inches).toString() + " in";
        }
        retval=retval.replace("$REPORTED_MAX_HEIGHT$",reported_tallest_height.toString())

        let prior_height:string="";
        if(manual.comparison.exists)
        {
            let height = "Not recorded.";
            if(manual.comparison.recorded_height_inches !== undefined)
            {
                height = manual.comparison.recorded_height_inches.toString() + " in";
                
            }
            prior_height=ingest.height_on_prior_template.replace("$PRIOR_HEIGHT$",height);
        }
        retval=retval.replace("$HEIGHT_ON_PRIOR$",prior_height)

        let current_height:string = "Not recorded.";
        if(manual.recorded_height_inches!==undefined)
        {
            current_height=manual.recorded_height_inches.toString() + " in";
        }
        retval=retval.replace("$CURRENT_HEIGHT$",current_height)
    }

    //Measurements
    {
        let measurements:string[]=[];

        const trypush=(name:string, meas:DEXA_Measurements|undefined)=>
        {
            if(meas!==undefined)
            {
                let bmd=meas.bone_mineral_density;
                let tscore=meas.t_score;
                let zscore=meas.z_score;

                if(bmd!==undefined && tscore !==undefined && zscore !==undefined)
                {
                    let thismeas=ingest.measurement_template;
                    thismeas=thismeas.replace("$MEASUREMENT_NAME$",name);
                    thismeas=thismeas.replace("$BMD$",bmd.toFixed(3));
                    thismeas=thismeas.replace("$T_SCORE$",tscore.toFixed(2));
                    thismeas=thismeas.replace("$Z_SCORE$",zscore.toFixed(2));
                    measurements.push(thismeas);
                }
            }
        }

        let spinefield = getSpineField(
            manual.use_for_analysis.L1,
            manual.use_for_analysis.L2,
            manual.use_for_analysis.L3,
            manual.use_for_analysis.L4,
        );

        if(spinefield!==undefined){trypush("Spine",ingest.spine.get(spinefield));}
        if(manual.use_for_analysis.left_hip_total){trypush("Left Total Hip",ingest.hips.left.total);}
        if(manual.use_for_analysis.left_hip_neck){trypush("Left Femoral Neck",ingest.hips.left.neck);}
        if(manual.use_for_analysis.right_hip_total){trypush("Right Total Hip",ingest.hips.right.total);}
        if(manual.use_for_analysis.right_hip_neck){trypush("Right Femoral Neck",ingest.hips.right.neck);}
        if(manual.use_for_analysis.left_radius){trypush("Left Radius",ingest.radii.left);}
        if(manual.use_for_analysis.right_radius){trypush("Right Radius",ingest.radii.right);}

        let allmeasurements:string="";
        for(const measurement of measurements)
        {
            allmeasurements+=measurement;
        }

        retval=retval.replace("$MEASUREMENTS$",allmeasurements);
    }

    //Technical
    {
        retval=retval.replace("$DXA_SYSTEM$",ingest.dexa_system);
        retval=retval.replace("$DXA_SERIAL$",ingest.device_serial);
        retval=retval.replace("$DXA_SOFTWARE_VERSION$",ingest.software_version);
        retval=retval.replace("$DXA_TECH_ID$",ingest.technologist_id);
    }

    //Trends
    {
        let section="";
        
        if(!manual.comparison.outside_comparison)
        {
            let trends:string[]=[];
            const trypush=(name:string,comp:DEXA_Comparison)=>
            {
                if(comp.bone_mineral_density_absolute_change !== undefined &&
                    comp.bone_mineral_density_percentage_change !== undefined
                )
                {
                    let thismeas=ingest.change_template;
                    thismeas=thismeas.replace("$MEASUREMENT_NAME$",name);
                    thismeas=thismeas.replace("$BMD_CHANGE$",comp.bone_mineral_density_absolute_change.toFixed(3));
                    thismeas=thismeas.replace("$T_SCORE_CHANGE$",comp.bone_mineral_density_percentage_change.toFixed(2));
                    trends.push(thismeas);
                }
            }

            if(manual.use_for_comparison.spine){trypush("Spine",ingest.trend.spine);}
            if(manual.use_for_comparison.left_hip){trypush("Left Hip",ingest.trend.left_hip);}
            if(manual.use_for_comparison.right_hip){trypush("Right Hip",ingest.trend.right_hip);}
            if(manual.use_for_comparison.radius){trypush("Radius",ingest.trend.radius);}

            
            if(trends.length>0)
            {
                let allcomps:string="";
                for(const trend of trends)
                {
                    allcomps+=trend;
                }

                section=ingest.trend_template;
                section=section.replace("$TRENDS$",allcomps);
            }     

        }
        
        retval=retval.replace("$TREND_SECTION$",section);
    }

    //Outside disclaimer
    {
        let str="";
        
        if(manual.comparison.outside_comparison)
        {
            str=ingest.outside_comparison_disclaimer;
        }

        retval=retval.replace("$OUTSIDE_DISCLAIMER$",str);
    }

    return retval;   
}

function select_diagnosis(ingest:DEXA_Ingest_Data, manual:DEXA_Mandatory_Manual_Data)
{
    let measurements:DEXA_Measurements[]=[];

    let spinefield = getSpineField(
        manual.use_for_analysis.L1,
        manual.use_for_analysis.L2,
        manual.use_for_analysis.L3,
        manual.use_for_analysis.L4,
    );

    if(spinefield!==undefined)
    {
        let spine_measurements=ingest.spine.get(spinefield);
        if(spine_measurements!==undefined)
        {
            measurements.push(spine_measurements);
        }        
    }

    if(manual.use_for_analysis.right_hip_neck && ingest.hips.right.neck!==undefined){measurements.push(ingest.hips.right.neck);}
    if(manual.use_for_analysis.right_hip_total && ingest.hips.right.total!==undefined){measurements.push(ingest.hips.right.total);}
    
    if(manual.use_for_analysis.left_hip_neck && ingest.hips.left.neck!==undefined){measurements.push(ingest.hips.left.neck);}
    if(manual.use_for_analysis.left_hip_total && ingest.hips.left.total!==undefined){measurements.push(ingest.hips.left.total);}

    if(manual.use_for_analysis.left_radius && ingest.radii.left!==undefined){measurements.push(ingest.radii.left);}
    if(manual.use_for_analysis.right_radius && ingest.radii.right!==undefined){measurements.push(ingest.radii.right);}

    let lowest_t_score=Infinity;
    for(const measurement of measurements)
    {
        if(measurement.t_score!==undefined && lowest_t_score>measurement.t_score)
        {
            lowest_t_score=measurement.t_score;
        }
    }

    for(const diagnosis of ingest.diagnoses)
    {
        let inside_lower_bound:boolean=false;
        if(diagnosis.lower_bound.inclusive)
        {
            if(lowest_t_score>=diagnosis.lower_bound.value){inside_lower_bound=true;}
        }
        else
        {
            if(lowest_t_score>diagnosis.lower_bound.value){inside_lower_bound=true;}
        }

        let inside_upper_bound:boolean=false;
        if(diagnosis.upper_bound.inclusive)
        {
            if(lowest_t_score<=diagnosis.upper_bound.value){inside_upper_bound=true;}
        }
        else
        {
            if(lowest_t_score<diagnosis.upper_bound.value){inside_upper_bound=true;}
        }

        if(inside_lower_bound && inside_upper_bound)
        {
            return diagnosis;
        }
    }

    return undefined;
}

const indent="     ";
function frax(ingest:DEXA_Ingest_Data, manual:DEXA_Mandatory_Manual_Data):string
{
    if(ingest.frax === undefined || !manual.use_frax){return "";}
    let retval=ingest.frax_template;

    let frax_risk_factors:string="";

    if(ingest.frax.risk_factors !==undefined)
    {
        for(const rf of ingest.frax.risk_factors)
        {
            frax_risk_factors+=indent+rf+windows_newline;
        }
    }
    frax_risk_factors=frax_risk_factors.substring(0,frax_risk_factors.length-2); //remove last newline

    if(frax_risk_factors===""){frax_risk_factors=indent+"None";}

    retval=retval.replace("$RISK_FACTORS$",frax_risk_factors);

    if(ingest.frax.risk_of_osteoporotic_fracture!==undefined 
        && ingest.frax.risk_of_osteoporotic_fracture!==null 
        && ingest.frax.risk_of_hip_fracture!==undefined
        && ingest.frax.risk_of_hip_fracture!==null)
    {
        retval=retval.replace("$FRAX_OSTEOPOROTIC_FRACTURE$",ingest.frax.risk_of_osteoporotic_fracture.toString());
        retval=retval.replace("$FRAX_HIP_FRACTURE$",ingest.frax.risk_of_hip_fracture.toString());
    }

    return retval;
}

export function report_to_clipboard(report:string)
{
    let blob = new Blob(
        [report],
        {
            type: "text/plain"
        }
    );
    let record = {
        "text/plain":blob
    };
    let clipboard_item=new ClipboardItem(record);
    navigator.clipboard.write([clipboard_item]);
}