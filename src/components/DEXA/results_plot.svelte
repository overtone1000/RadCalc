<script lang="ts">
	import * as Plot from "@observablehq/plot";
	import { ingest_data, type DEXA_Ingest_Data, type DiagnosisWithRange } from "./ts/dexa/data_ingest";
	import { UseAlternativeDiagnosis, type DEXA_Mandatory_Manual_Data, type HeightInInches } from "./ts/dexa/manual";
	import ManagedPlot from "./managed_plot.svelte";
	import { mdiRelativeScale } from "@mdi/js";
	import { select_diagnosis, type SelectedDiagnosisResult } from "./ts/dexa/generate_report";
	import type { DEXA_Measurements, Diagnosis } from "./ts/dexa/basic_types";

    type Props = {
        ingest:DEXA_Ingest_Data,
        mandatory:DEXA_Mandatory_Manual_Data
    }

    let props:Props=$props();

    type Datum = {label:String,score:number,color:string};

    type Calculations = {
        diagnosis?:SelectedDiagnosisResult,
        data:Datum[],
        xticks:string[]
    }
    
    const measurements_to_datum = (meas:DEXA_Measurements, label:string, selected_diagnosis:SelectedDiagnosisResult) => {
        let val;
        if(selected_diagnosis.using_alternative_diagnosis)
        {
            val=meas.z_score;
        }
        else
        {
            val=meas.t_score;
        }
        if(val!==undefined)
        {

            let color:string="white";
            if(val===selected_diagnosis.lowest_score)
            {
                color="red";
            }
            return {
                label,
                score:val,
                color:color
            }
        }
        else{
            return undefined;
        }
    };

    let calculations=$derived.by(
        ()=>{
            let selected_diagnosis=select_diagnosis(props.ingest,props.mandatory);


            let retval:Calculations={
                diagnosis:selected_diagnosis,
                data:[],
                xticks:[]
            };

            if(selected_diagnosis !== undefined)
            { 
                let measurements:[DEXA_Measurements,string][]=[];
                for(const member of props.ingest.spine.entries())
                {
                    measurements.push([member[1],member[0]]);
                }
                measurements.push([props.ingest.hips.left.neck, "L Fem"]);
                measurements.push([props.ingest.hips.left.total, "L Hip"]);
                measurements.push([props.ingest.hips.right.neck, "R Fem"]);
                measurements.push([props.ingest.hips.right.total, "R Hip"]);
                measurements.push([props.ingest.radii.left, "L Rad"]);
                measurements.push([props.ingest.radii.right, "R Rad"]);

                for(const member of measurements)
                {
                    let datum = measurements_to_datum(member[0],member[1],selected_diagnosis);
                    if(datum !== undefined)
                    {
                        retval.data.push(datum);
                        retval.xticks.push(datum.label);
                    }
                }
            }

            console.debug("Results plot calculations:",retval);
            
            return retval;
        }
    );

    const bar_colors=
    [
        "#801700", //dark red
        "#804B00", //dark orange
        "#807E00", //dark yellow
        "#558000", //dark green
        "#004480", //dark blue
    ]

    let plot = $derived.by(
        ()=>{
            let bars:{x1:string,x2:string,y1:number,y2:number,color:string}[] = [];
            if(calculations.diagnosis !== undefined)
            {
                let lowest=Infinity;
                let highest=-Infinity;

                for(const member of calculations.data)
                {
                    if(highest<member.score){highest=member.score;}
                    if(lowest>member.score){lowest=member.score;}
                }

                for(const member of calculations.diagnosis?.diagnostic_ranges)
                {
                    let color_index = bars.length;

                    let y1=member.lower_bound.value;
                    let y2=member.upper_bound.value;

                    if(y1>highest){y1=highest;}
                    if(y2>highest){y2=highest;}
                    if(y1<lowest){y1=lowest;}
                    if(y2<lowest){y2=lowest;}

                    bars.push({
                        x1:calculations.xticks[0],
                        x2:calculations.xticks[calculations.xticks.length-1],
                        y1,
                        y2,
                        color:bar_colors[color_index]
                    });
                }
            }

            console.debug("bars",bars);

            let width=900;
            let inset=-(width/(calculations.xticks.length))/2.0;
            
            return Plot.plot(
                {
                    grid: true,
                    inset: 0,
                    height: 150,
                    width: width,
                    marginRight:10,
                    marginTop:10,
                    marginBottom:40,
                    marginLeft:20,
                    //aspectRatio: 1,
                    //color: {legend: true},
                    x: {domain:calculations.xticks},
                    marks: [
                        Plot.frame(),
                        Plot.rect(bars,{x1:"x1", x2:"x2", y1:"y1", y2:"y2", fill:"color", insetLeft: inset, insetRight: inset-1}),
                        Plot.dot(calculations.data, {x:"label", y:"score", stroke:"color", fill:"color"}),
                        Plot.axisX({label:"", anchor: "bottom", tickRotate:-45}),
                        Plot.axisY({label:"", labelArrow:"none"}),
                        //Plot.rect([maxheight], {x1:"left_date",x2:"right_date",y1:"bottom_height", y2:"top_height",stroke:"color",fill:"red"}),
                        //Plot.rect([maxheight], {x1:"left_date",x2:"right_date",y1:"bottom_height", y2:"height",stroke:"color",fill:"color"}),
                        //Plot.dot(data, {x: "date", y: "height", stroke:"aqua",fill:"color"}),
                        //
                        //Plot.axisY({}),
                        //Plot.axisY({ticks:[maxheight.height], anchor:"right", tickFormat:(i)=>{return "max";}, tickRotate:60})
                    ]
                }
            );
        }
    );
</script>

<div class="outer">
    <ManagedPlot plot={plot}/>
    {#if calculations.diagnosis !== undefined && calculations.diagnosis.selected_diagnosis !== undefined}
    <div class="inner">
        <div>Diagnosis: {calculations.diagnosis.selected_diagnosis.name}</div>
        {#if calculations.diagnosis.using_alternative_diagnosis}
        <div>Alternative diagnositc scheme (Z-score)</div>
        {:else}
        <div>Primary diagnostic scheme (T-score)</div>
        {/if}
    </div>
    {/if}
</div>

<style>
    .outer{
        padding:2px;
        margin-right:2px;
        display: flex;
        flex-direction: column;
    }
    .inner{
        display:flex;
        flex-direction: row;
        justify-content: space-around;
    }
</style>