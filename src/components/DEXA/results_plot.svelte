<script lang="ts">
	import * as Plot from "@observablehq/plot";
	import { ingest_data, type DEXA_Ingest_Data, type DiagnosisWithRange } from "./ts/dexa/data_ingest";
	import { UseAlternativeDiagnosis, type DEXA_Mandatory_Manual_Data, type HeightInInches } from "./ts/dexa/manual";
	import ManagedPlot from "./managed_plot.svelte";
	import { mdiRelativeScale } from "@mdi/js";
	import { select_diagnosis, type SelectedDiagnosisResult } from "./ts/dexa/generate_report";
	import type { DEXA_Measurements, Diagnosis } from "./ts/dexa/basic_types";
	import DexaMeasurements from "./dexa_measurements.svelte";

    type Props = {
        ingest:DEXA_Ingest_Data,
        mandatory:DEXA_Mandatory_Manual_Data
    }

    let props:Props=$props();

    type Datum = {score:number,x_bin:string,color:string};

    type Calculations = {
        diagnosis?:SelectedDiagnosisResult,
        data:Datum[]
    }
    

    const used_xbin="Used";
    const unused_xbin="Unused";

    const measurements_to_datum = (meas:DEXA_Measurements, selected_diagnosis:SelectedDiagnosisResult, used:boolean) => {
        let val;
        if(selected_diagnosis.using_alternative_diagnosis)
        {
            val=meas.z_score;
        }
        else
        {
            val=meas.t_score;
        }
        let x_bin:string;
        if(used)
        {
            x_bin=used_xbin;
        }
        else
        {
            x_bin=unused_xbin;
        }
        if(val!==undefined)
        {

            let color:string="white";
            if(used && val===selected_diagnosis.lowest_score)
            {
                color="red";
            }
            return {
                score:val,
                color:color,
                x_bin
            }
        }
        else{
            return undefined;
        }
    };

    let calculations=$derived.by(
        ()=>{
            //console.debug("Recalculating.");
            let selected_diagnosis=select_diagnosis(props.ingest,props.mandatory);


            let retval:Calculations={
                diagnosis:selected_diagnosis,
                data:[]
            };

            if(selected_diagnosis !== undefined)
            { 
                
                const process = (member:DEXA_Measurements,used:boolean)=>{
                    let datum = measurements_to_datum(member,selected_diagnosis,used);
                    if(datum !== undefined)
                    {
                        retval.data.push(datum);
                    }
                };

                for(const member of selected_diagnosis.used_measurements)
                {
                    process(member,true);
                }
                for(const member of selected_diagnosis.unused_measurements)
                {
                    process(member,false);
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

    const width=80;
    const domain=[used_xbin,unused_xbin];
    const inset=-(width/domain.length)/4;

    let plot = $derived.by(
        ()=>{
            //console.debug("Replotting.");
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
                        x1:used_xbin,
                        x2:unused_xbin,
                        y1,
                        y2,
                        color:bar_colors[color_index]
                    });
                }
            }

            console.debug("bars",bars);

            let y_axis_label:string;
            if(calculations.diagnosis?.using_alternative_diagnosis){y_axis_label="Z-score";}else{y_axis_label = "T-score";}
            
            return Plot.plot(
                {
                    grid: true,
                    inset: 0,
                    height: 300,
                    width: width,
                    marginRight:20,
                    marginTop:20,
                    marginBottom:40,
                    marginLeft:20,
                    //aspectRatio: 1,
                    //color: {legend: true},
                    x: {domain:domain},
                    marks: [
                        Plot.frame(),
                        Plot.rect(bars,{x1:"x1", x2:"x2", y1:"y1", y2:"y2", fill:"color", insetLeft: inset, insetRight: inset}),
                        Plot.dot(calculations.data, {x:"x_bin", y:"score", stroke:"color", fill:"color"}),
                        Plot.axisX({label:"", anchor: "bottom", tickRotate:-45}),
                        Plot.axisY({label:y_axis_label, labelArrow:"none"}),
                        Plot.text("Diagnosis: DEATH")
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
    <div class="inner" style="width:{width}px;">
        <div>{calculations.diagnosis.selected_diagnosis.name}</div>
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
        flex-shrink: true;
        font-size: x-small;
        word-wrap: normal;
    }
</style>