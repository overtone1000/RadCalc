import { newline } from "../../../globals";
import { getSpineField, type DEXA_Comparison, type DEXA_Measurements, type Diagnosis } from "./basic_types";
import { all_possible_newlines, type DEXA_Ingest_Data, type DiagnosisWithRange } from "./data_ingest";
import { getFRAXExclusionReasonText, UseAlternativeDiagnosis, type DEXA_Mandatory_Manual_Data } from "./manual";

export const windows_newline="\r\n";

const substitutions=
{
    exam:"$EXAM$",
    exam_date:"$EXAM_DATE$",
    exam_time:"$EXAM_TIME$",
    included_sites:"$INCLUDED_SITES$",
    technical_comments:"$TECHNICAL_COMMENTS$",
    result_comments:"$RESULT_COMMENTS$",
    frax:"$FRAX$",
    reported_max_height:"$REPORTED_MAX_HEIGHT$",
    prior_height:"$PRIOR_HEIGHT$",
    prior_height_value:"$HEIGHT_ON_PRIOR$",
    current_height:"$CURRENT_HEIGHT$",
    measurement_name:"$MEASUREMENT_NAME$",
    bmd:"$BMD$",
    t_score:"$T_SCORE$",
    z_score:"$Z_SCORE$",
    all_measurements:"$MEASUREMENTS$",
    system:"$DXA_SYSTEM$",
    system_serial:"$DXA_SERIAL$",
    software_version:"$DXA_SOFTWARE_VERSION$",
    tech_id:"$DXA_TECH_ID$",
    bmd_change:"$BMD_CHANGE$",
    tscore_change:"$T_SCORE_CHANGE$",
    trend:"$TRENDS$",
    trend_section:"$TREND_SECTION$",
    outside_disclaimer:"$OUTSIDE_DISCLAIMER$",
    risk_factors:"$RISK_FACTORS$",
    frax_osteoporotic_fracture:"$FRAX_OSTEOPOROTIC_FRACTURE$",
    frax_hip_fracture:"$FRAX_HIP_FRACTURE$"
}

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

    retval=retval.replace(substitutions.exam,ingest.exam);
    retval=retval.replace(substitutions.exam_date,ingest.date);
    retval=retval.replace(substitutions.exam_time,ingest.time);

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
                //console.debug(manual.comparison.date);
                let date = new Date(manual.comparison.date);
                //console.debug(date);
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
            retval=retval.replace("$DIAGNOSIS$",diagnosis.selected_diagnosis.name);
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

        retval=retval.replace(substitutions.included_sites,full_quality_section);
    }

    //Technical Comments
    {
        let comment="";
        if(manual.technical_comments.spine_osteophyte)
        {
            comment=ingest.technical_comments.spine_osteophyte_technique_section
        }
        retval=retval.replace(substitutions.technical_comments,comment)
    }

    //FRAX
    retval=retval.replace(substitutions.frax,frax(ingest,manual))

    //Height
    {
        let reported_tallest_height:string = "Not reported by the patient.";
        if(manual.reported_tallest_height.exists)
        {
            if(manual.reported_tallest_height.feet!==null && manual.reported_tallest_height.inches!==null)
            {
                reported_tallest_height=(manual.reported_tallest_height.feet*12+manual.reported_tallest_height.inches).toString() + " in";
            }
        }
        retval=retval.replace(substitutions.reported_max_height,reported_tallest_height.toString())

        let prior_height:string="";
        if(manual.comparison.exists)
        {
            let height = "Not recorded.";
            if(manual.comparison.height_in_inches.exists)
            {
                if(manual.comparison.height_in_inches.height_in_inches !== null)
                {
                    height = manual.comparison.height_in_inches.height_in_inches.toString() + " in";
                }
            }
            prior_height=ingest.height_on_prior_template.replace(substitutions.prior_height,height);
        }
        retval=retval.replace(substitutions.prior_height_value,prior_height)

        let current_height:string = "Not recorded.";
        if(manual.height_in_inches.exists)
        {
            if(manual.height_in_inches.height_in_inches !== null)
            {
                current_height=manual.height_in_inches.height_in_inches.toString() + " in";
            }
        }
        retval=retval.replace(substitutions.current_height,current_height)
    }

    //Measurements
    {
        let measurements:string[]=[];

        const trypush=(name:string, meas:DEXA_Measurements|undefined, comment?:string)=>
        {
            if(meas!==undefined)
            {
                let bmd=meas.bone_mineral_density;
                let tscore=meas.t_score;
                let zscore=meas.z_score;

                if(bmd!==undefined && tscore !==undefined && zscore !==undefined && bmd!==null && tscore !== null && zscore !== null)
                {
                    let thismeas=ingest.measurement_template;
                    thismeas=thismeas.replace(substitutions.measurement_name,name);
                    thismeas=thismeas.replace(substitutions.bmd,bmd.toFixed(3));
                    thismeas=thismeas.replace(substitutions.t_score,tscore.toFixed(2));
                    thismeas=thismeas.replace(substitutions.z_score,zscore.toFixed(2));

                    if(comment===undefined)
                    {
                        comment="";
                    }
                    thismeas=thismeas.replace(substitutions.result_comments,comment);

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

        if(spinefield!==undefined){
            let comment=undefined;
            if(manual.technical_comments.spine_osteophyte)
            {
                comment=ingest.technical_comments.spine_osteophyte_result_section
            }
            trypush("Spine",ingest.spine.get(spinefield),comment);
        }
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

        retval=retval.replace(substitutions.all_measurements,allmeasurements);
    }

    //Technical
    {
        retval=retval.replace(substitutions.system,ingest.dexa_system);
        retval=retval.replace(substitutions.system_serial,ingest.device_serial);
        retval=retval.replace(substitutions.software_version,ingest.software_version);
        retval=retval.replace(substitutions.tech_id,ingest.technologist_id);
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
                    thismeas=thismeas.replace(substitutions.measurement_name,name);
                    thismeas=thismeas.replace(substitutions.bmd_change,comp.bone_mineral_density_absolute_change.toFixed(3));
                    thismeas=thismeas.replace(substitutions.tscore_change,comp.bone_mineral_density_percentage_change.toFixed(2));
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
                section=section.replace(substitutions.trend,allcomps);
            }     

        }
        
        retval=retval.replace(substitutions.trend_section,section);
    }

    //Outside disclaimer
    {
        let str="";
        
        if(manual.comparison.outside_comparison)
        {
            str=ingest.outside_comparison_disclaimer;
        }

        retval=retval.replace(substitutions.outside_disclaimer,str);
    }

    //Check for missed substitution
    {
        let missed_substitutions:string[]=[];
        for(const substr of Object.values(substitutions))
        {
            if(retval.indexOf(substr)>0)
            {
                missed_substitutions.push(substr);
            }
        }

        if(missed_substitutions.length>0)
        {
            retval="";
            alert("Report generation failed. The following substitutions could not be made: " + missed_substitutions.toString());
        }
    }

    return retval;   
}

export type SelectedDiagnosisResult={
    using_alternative_diagnosis:boolean,
    measurements:DEXA_Measurements[],
    selected_diagnosis:DiagnosisWithRange,
    diagnostic_ranges:DiagnosisWithRange[],
    lowest_score:number
};

export function select_diagnosis(ingest:DEXA_Ingest_Data, manual:DEXA_Mandatory_Manual_Data):SelectedDiagnosisResult | undefined
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

    let lowest_score:number=Infinity;
    let diagnoses:DiagnosisWithRange[];
    let using_alternative_diagnosis=UseAlternativeDiagnosis(ingest,manual);
    if(using_alternative_diagnosis)
    {
        //console.debug("Using alternative diagnosis.");
        diagnoses=ingest.alternative_diagnoses;

        for(const measurement of measurements)
        {
            if(measurement.z_score!==undefined && lowest_score>measurement.z_score)
            {
                lowest_score=measurement.z_score;
            }
        }
    }
    else
    {
        //console.debug("Using primary diagnosis.");
        diagnoses=ingest.diagnoses;

        for(const measurement of measurements)
        {
            if(measurement.t_score!==undefined && lowest_score>measurement.t_score)
            {
                lowest_score=measurement.t_score;
            }
        }
    }

    for(const diagnosis of diagnoses)
    {
        let inside_lower_bound:boolean=false;
        if(diagnosis.lower_bound.inclusive)
        {
            if(lowest_score>=diagnosis.lower_bound.value){inside_lower_bound=true;}
        }
        else
        {
            if(lowest_score>diagnosis.lower_bound.value){inside_lower_bound=true;}
        }

        let inside_upper_bound:boolean=false;
        if(diagnosis.upper_bound.inclusive)
        {
            if(lowest_score<=diagnosis.upper_bound.value){inside_upper_bound=true;}
        }
        else
        {
            if(lowest_score<diagnosis.upper_bound.value){inside_upper_bound=true;}
        }

        if(inside_lower_bound && inside_upper_bound)
        {
            return {
                selected_diagnosis:diagnosis,
                measurements,
                using_alternative_diagnosis,
                diagnostic_ranges:diagnoses,
                lowest_score
            };
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

    retval=retval.replace(substitutions.risk_factors,frax_risk_factors);

    if(ingest.frax.risk_of_osteoporotic_fracture!==undefined 
        && ingest.frax.risk_of_osteoporotic_fracture!==null 
        && ingest.frax.risk_of_hip_fracture!==undefined
        && ingest.frax.risk_of_hip_fracture!==null)
    {
        retval=retval.replace(substitutions.frax_osteoporotic_fracture,ingest.frax.risk_of_osteoporotic_fracture.toString());
        retval=retval.replace(substitutions.frax_hip_fracture,ingest.frax.risk_of_hip_fracture.toString());
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