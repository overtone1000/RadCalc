<script lang="ts">
	import * as Plot from "@observablehq/plot";
	import { ingest_data, type DEXA_Ingest_Data, type DiagnosisWithRange } from "./ts/dexa/data_ingest";
	import { DaignosisSet as DiagnosisSet, type DEXA_Mandatory_Manual_Data, type HeightInInches } from "./ts/dexa/manual";
	import ManagedPlot from "./managed_plot.svelte";
	import { mdiRelativeScale } from "@mdi/js";
	import { AnatomicSite, get_set_diagnosis, type SelectedDiagnosisResult, type SiteWithMeasurement } from "./ts/dexa/generate_report";
	import type { DEXA_Measurements, Diagnosis } from "./ts/dexa/basic_types";
	import DexaMeasurements from "./dexa_measurements.svelte";
	import DiagnosisSubtitle from "./diagnosis_subtitle.svelte";

    type Props = {
        ingest:DEXA_Ingest_Data,
        mandatory:DEXA_Mandatory_Manual_Data,
        diagnosis_set:DiagnosisSet,
        width:number
    }

    let props:Props=$props();

    type Datum = {score:number,x_bin:string,fill:string,stroke:string};

    export type Calculations = {
        diagnosis?:SelectedDiagnosisResult,
        data:Datum[]
    }
    

    //const used_xbin="Used";
    //const unused_xbin="Unused";
    
    function site_to_string(site:AnatomicSite)
    {
        const left_hip="L Hip";
        const left_radius="L Rad";
        const spine="Spine";
        const right_radius="R Rad";
        const right_hip="R Hip";
        switch(site)
        {
            case AnatomicSite.Spine:return spine;
            case AnatomicSite.LeftHip:return left_hip;
            case AnatomicSite.RightHip:return right_hip;
            case AnatomicSite.LeftRadius:return left_radius;
            case AnatomicSite.RightRadius:return right_radius;
        }
    }

    const measurements_to_datum = (meas:SiteWithMeasurement, selected_diagnosis:SelectedDiagnosisResult, used:boolean) => {
        let val;
        if(selected_diagnosis.diagnosis_set === DiagnosisSet.AgeMatched)
        {
            val=meas.measurements.z_score;
        }
        else
        {
            val=meas.measurements.t_score;
        }
        let x_bin:string=site_to_string(meas.site);
        
        let fill:string;
        let stroke:string;

        if(used)
        {
            if(val===selected_diagnosis.lowest_score)
            {
                fill="red";
                stroke="white";
            }
            else
            {
                stroke="black";
                fill="white";
            }
        }
        else
        {
            stroke="white";
            fill="black";
        }
       
        if(val!==undefined)
        {
            return {
                score:val,
                fill:fill,
                stroke:stroke,
                x_bin
            }
        }
        else{
            return undefined;
        }
    };

    function get_calculations(active_diagnosis_set:DiagnosisSet.AgeMatched|DiagnosisSet.Osteoporosis)
    {
        //console.debug("Recalculating.");

        let selected_diagnosis=get_set_diagnosis(props.ingest,props.mandatory,active_diagnosis_set);

        let retval:Calculations={
            diagnosis:selected_diagnosis,
            data:[]
        };

        if(selected_diagnosis !== undefined)
        { 
            
            const process = (member:SiteWithMeasurement,used:boolean)=>{
                let datum = measurements_to_datum(member,selected_diagnosis,used);
                if(datum !== undefined)
                {
                    retval.data.push(datum);
                }
            };

            for(const member of selected_diagnosis.unused_measurements)
            {
                process(member,false);
            }
            //Used diagnoses go last so they're drawn over unused ones
            for(const member of selected_diagnosis.used_measurements)
            {
                process(member,true);
            }
        }

        console.debug("Results plot calculations:",retval);
        
        return retval;
    }

    const osteoporosis_bar_colors=
    [
        "#801700", //dark red
        "#804B00", //dark orange
        "#807E00", //dark yellow
        "#558000", //dark green
        "#004480", //dark blue
    ]

    const age_matched_bar_colors=
    [
        "#801700", //dark red //below expected range
        "#558000", //dark green //within expected range
        "#004480", //dark blue //high for age
    ]

    const domain=[
        site_to_string(AnatomicSite.RightHip),
        site_to_string(AnatomicSite.RightRadius),
        site_to_string(AnatomicSite.Spine),
        site_to_string(AnatomicSite.LeftRadius),
        site_to_string(AnatomicSite.LeftHip),
    ];
    const inset=$derived(-(props.width/domain.length)/4);

    function create_plot(diagnosis_set:DiagnosisSet.AgeMatched|DiagnosisSet.Osteoporosis){

        let calculations=get_calculations(diagnosis_set);

        let y_axis_label:string;
        let bar_colors:string[];
        if(diagnosis_set==DiagnosisSet.AgeMatched)
        {
            
            y_axis_label="Z-score";
            bar_colors=age_matched_bar_colors;
        }
        else
        {
            y_axis_label = "T-score";
            bar_colors=osteoporosis_bar_colors;
        }

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

            for(const member of calculations.diagnosis.diagnostic_ranges)
            {
                let color_index = bars.length;

                let y1=member.lower_bound.value;
                let y2=member.upper_bound.value;

                if(y1>highest){y1=highest;}
                if(y2>highest){y2=highest;}
                if(y1<lowest){y1=lowest;}
                if(y2<lowest){y2=lowest;}

                bars.push({
                    x1:domain[0],
                    x2:domain[domain.length-1],
                    y1,
                    y2,
                    color:bar_colors[color_index]
                });
            }
        }
        
        let miny=Number.POSITIVE_INFINITY;
        let maxy=Number.NEGATIVE_INFINITY;
        for(const datum of calculations.data)
        {
            if(datum.score<miny){miny=datum.score;}
            if(datum.score>maxy){maxy=datum.score;}
        }
        if(miny>-3){miny=-3;}
        if(maxy<3){maxy=3;}

        let plot = Plot.plot(
            {
                grid: true,
                inset: 0,
                height: 300,
                width: props.width,
                marginRight:20,
                marginTop:20,
                marginBottom:40,
                marginLeft:40,
                //aspectRatio: 1,
                //color: {legend: true},
                x: {domain:domain},
                y: {domain:[miny,maxy]},
                marks: [
                    Plot.frame(),
                    Plot.rect(bars,{x1:"x1", x2:"x2", y1:"y1", y2:"y2", fill:"color", insetLeft: inset, insetRight: inset}),
                    Plot.dot(calculations.data, {x:"x_bin", y:"score", stroke:"stroke", fill:"fill", strokeWidth:1, fillOpacity:0.75}),
                    Plot.axisX({label:"", anchor: "bottom", tickRotate:-45}),
                    Plot.axisY({label:y_axis_label, labelArrow:"none"}),
                    Plot.text("Diagnosis: Unknown")
                ]
            }
        );

        return {
            plot,
            calculations
        };
    }

    let osteoporosis_result = $derived.by(
        ()=>{
            return create_plot(DiagnosisSet.Osteoporosis);
        }    
    );

    let age_matched_result = $derived.by(
        ()=>{
            return create_plot(DiagnosisSet.AgeMatched);
        }
    )

</script>

<div class="outer">
    <div class="plots_container">
        {#if props.diagnosis_set === DiagnosisSet.Osteoporosis || props.diagnosis_set === DiagnosisSet.Both}
            <div>
                <ManagedPlot plot={osteoporosis_result.plot}/>
                <DiagnosisSubtitle result={osteoporosis_result} width={props.width}/>
            </div>
        {/if}
        {#if props.diagnosis_set === DiagnosisSet.AgeMatched || props.diagnosis_set === DiagnosisSet.Both}
            <div>
                <ManagedPlot plot={age_matched_result.plot}/>
                <DiagnosisSubtitle result={age_matched_result} width={props.width}/>
            </div>
        {/if}
    </div>
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
    .plots_container{
        display:flex;
        flex-direction:column;
    }
</style>