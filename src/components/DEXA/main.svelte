<script lang="ts">
	import { ingest_data, type DEXA_Ingest_Data } from "./ts/dexa/data_ingest";
	import { empty_mandatory, init_mandatory, type DEXA_Mandatory_Manual_Data } from "./ts/dexa/manual";
	import { onMount } from "svelte";
	import type { MouseEventHandler } from "svelte/elements";
	import DexaMeasurements from "./dexa_measurements.svelte";
	import { getSpineField, type DEXA_Measurements, type SpineField } from "./ts/dexa/basic_types";
	import { generate_report, report_to_clipboard, windows_newline } from "./ts/dexa/generate_report";
	import DexaComparison from "./dexa_comparison.svelte";
    
    let last_raw_ingest:string|undefined=undefined;

    let ingest:DEXA_Ingest_Data|undefined=$state(undefined);
    let mandatory:DEXA_Mandatory_Manual_Data=$state(empty_mandatory());
    let debug_mode:boolean=$state(false);

    //Only for debugging
    onMount(()=> {
        if(debug_mode){
            fetch("example_forms/Example_Ingest_Template.txt").then(
            (result)=>{
                result.text().then(
                    (result)=>{
                        handle_raw_ingest(result);
                        mandatory.comparison.date="2025-06-10";
                        debug_mode=true;
                    }
                );
            }
        ); }}
    )

    const handle_raw_ingest = function (raw_ingest:string){
        let ingest_result=ingest_data(raw_ingest);
        if(ingest_result.error)
        {
            alert(ingest_result.message);
        }
        else if(ingest_result.result!==undefined)
        {
            ingest=ingest_result.result;
            mandatory=init_mandatory(ingest);
            console.debug(ingest);
            console.debug(mandatory);
        }
        else
        {
            alert("Unspecified ingestion error.");
        }
    }

    let text_ingest: MouseEventHandler<HTMLButtonElement>=(e)=>{
        console.debug(e);
        //Powerscribe copy-paste only contains text/plain, so no point in using the more powerful "read" function
        navigator.clipboard.read().then(
            (clipboard_contents)=>{
                let last_clipboard=clipboard_contents[0];
                last_clipboard.getType("text/plain").then(
                    (blob)=>{
                        blob.text().then(
                            (text)=>{
                                if(text===last_raw_ingest)
                                {
                                    alert("The data in the clipboard hasn't changed since last time. Make sure you copied new data.");
                                }
                                last_raw_ingest=text;
                                handle_raw_ingest(text);
                            }
                        )
                    }
                );
            }
        );
    }

    let selected_spine_measurement:{spinefield:SpineField,measurements:DEXA_Measurements}|undefined=$state(undefined);
    $effect(
        ()=>{
            console.debug("Updating spine measurements.");
            if(ingest!==undefined)
            {
                let spinefield = getSpineField(
                    mandatory.use_for_analysis.L1,
                    mandatory.use_for_analysis.L2,
                    mandatory.use_for_analysis.L3,
                    mandatory.use_for_analysis.L4,
                );

                if(spinefield!=undefined)
                {
                    let meas:DEXA_Measurements|undefined = ingest.spine.get(spinefield);
                    if(meas===undefined)
                    {
                        meas = {
                            locked: false,
                            bone_mineral_density: undefined,
                            t_score: undefined,
                            z_score: undefined
                        };
                        ingest.spine.set(spinefield,meas);
                    }
                    selected_spine_measurement={spinefield,measurements:meas};
                }
            }
        }
    );

    $effect(
        ()=>{
            if(ingest!==undefined && selected_spine_measurement!==undefined)
            {
                ingest.spine.set(selected_spine_measurement.spinefield,selected_spine_measurement.measurements);
            }
        }
    )

    let html_report=$state("");
    $effect(
        ()=>{
            if(ingest!==undefined)
            {
                console.debug("Generating report.");
                html_report=windows_newline+generate_report(ingest,mandatory);   //Need newline because of how pre works. Just a formatting thing.
            }
        }
    );
</script>

<div class="flexrow align-items-start maindiv">
    <div class="flexcol leftcol">
        <button onclick={text_ingest}>Ingest text from clipboard</button>
        {#if ingest!==undefined}
            <div class="flexrow full-width bottom_border">
                <div class="rotated">Comp</div>
                <div class="flexcol flexgrow">
                    <div class="flexrow padleft">
                        <label>Comparison available:<input type="checkbox" bind:checked={mandatory.comparison.exists}></label>
                        <div class="flexrow justify_space_around flexgrow">
                            {#if mandatory.comparison.exists}
                                <label>Comparison date:<input type="date" disabled={!mandatory.comparison.exists} bind:value={mandatory.comparison.date}></label>
                                <label>Outside comparison disclaimer:<input type="checkbox" disabled={!mandatory.comparison.exists} bind:checked={mandatory.comparison.outside_comparison}></label>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

            <div class="flexrow full-width  bottom_border">
                <div class="rotated">Height</div>
                <div class="flexcol flexgrow">
                    <div class="flexcol align_items_end align_self_center">
                        <div class="flexrow">
                            <div>Reported tallest height: </div>
                            <input type="number" step="1" class="numberbox left_margin" bind:value={mandatory.reported_tallest_height.feet}>
                            <div class="left_margin"> ft </div>
                            <input type="number" step="0.1" class="numberbox left_margin" bind:value={mandatory.reported_tallest_height.inches}>
                            <div class="left_margin"> in </div>
                        </div>
                        {#if mandatory.comparison.exists}
                            <div class="flexrow">
                                <div>Height on prior exam: </div>
                                <input type="number" step="0.1" class="numberbox left_margin" bind:value={mandatory.comparison.recorded_height_inches}>
                                <div class="left_margin"> in </div>
                            </div>
                        {/if}
                        <div class="flexrow">
                            <div>Height on current exam: </div>
                            <input type="number" step="0.1" class="numberbox left_margin" bind:value={mandatory.recorded_height_inches}>
                            <div class="left_margin"> in </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flexrow full-width bottom_border">
                <div class="rotated">Results</div>
                <div class="flexcol flexgrow">
                    <div class="flexcol flexgrow">
                        <div class="flexrow justify_space_around">
                            <div class="flexcol align_right">
                                <label>L1 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L1}></label>
                                <label>L2 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L2}></label>
                                <label>L3 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L3}></label>
                                <label>L4 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L4}></label>
                                <label>Radius <input type="checkbox" bind:checked={mandatory.use_for_analysis.radius}></label>
                            </div>
                            <div class="flexcol align_right">
                                <label>Left Hip <input type="checkbox" bind:checked={mandatory.use_for_analysis.left_hip_total}></label>
                                <label>Left Femoral Neck <input type="checkbox" bind:checked={mandatory.use_for_analysis.left_hip_neck}></label>
                                <label>Right Hip <input type="checkbox" bind:checked={mandatory.use_for_analysis.right_hip_total}></label>
                                <label>Right Femoral Neck <input type="checkbox" bind:checked={mandatory.use_for_analysis.right_hip_neck}></label>
                            </div>
                        </div>
                    </div>
                
                    <div class="flexcol flexgrow">
                        <table>
                            <thead>
                                <tr>
                                    <th class="fixedwidth">Site</th>
                                    <th class="fixedwidth secondary">Locked</th>
                                    <th class="secondary">BMD</th>
                                    <th class="secondary">T-Score</th>
                                    <th class="secondary">Z-Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#if selected_spine_measurement!==undefined}
                                    <DexaMeasurements used={selected_spine_measurement!==undefined} name={selected_spine_measurement.spinefield} bind:measurements={selected_spine_measurement.measurements}/>
                                {/if}
                                <DexaMeasurements used={mandatory.use_for_analysis.left_hip_total} name="Left Hip" bind:measurements={ingest.hips.left.total}/>
                                <DexaMeasurements used={mandatory.use_for_analysis.left_hip_neck} name="Left Femoral Neck" bind:measurements={ingest.hips.left.neck}/>
                                <DexaMeasurements used={mandatory.use_for_analysis.right_hip_total} name="Right Hip" bind:measurements={ingest.hips.right.total}/>
                                <DexaMeasurements used={mandatory.use_for_analysis.right_hip_neck} name="Right Femoral Neck" bind:measurements={ingest.hips.right.neck}/>
                                <DexaMeasurements used={mandatory.use_for_analysis.radius} name="Radius" bind:measurements={ingest.radius}/>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {#if mandatory.comparison.exists && !mandatory.comparison.outside_comparison}
                <div class="flexrow full-width bottom_border">
                    <div class="rotated">Trends</div>
                    <div class="flexcol flexgrow">
                        <div class="flexrow justify_space_around">
                            <div class="flexcol align_right">
                                <label>Spine <input type="checkbox" bind:checked={mandatory.use_for_comparison.spine}></label>
                                <label>Radius <input type="checkbox" bind:checked={mandatory.use_for_comparison.radius}></label>
                            </div>
                            <div class="flexcol align_right">
                                <label>Left Hip <input type="checkbox" bind:checked={mandatory.use_for_comparison.right_hip}></label>
                                <label>Right Hip <input type="checkbox" bind:checked={mandatory.use_for_comparison.left_hip}></label>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th class="fixedwidth">Site</th>
                                    <th class="fixedwidth secondary">Locked</th>
                                    <th class="secondary">Δ BMD</th>
                                    <th class="secondary">Δ T-Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <DexaComparison used={mandatory.use_for_comparison.spine} name="Spine" bind:comparison={ingest.trend.spine}/>
                                <DexaComparison used={mandatory.use_for_comparison.left_hip} name="Left Hip" bind:comparison={ingest.trend.left_hip}/>
                                <DexaComparison used={mandatory.use_for_comparison.right_hip} name="Right Hip" bind:comparison={ingest.trend.right_hip}/>
                                <DexaComparison used={mandatory.use_for_comparison.radius} name="Radius" bind:comparison={ingest.trend.radius}/>
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}

            <button onclick={()=>{if(ingest!==undefined){report_to_clipboard(generate_report(ingest,mandatory))}}}>Generate Report</button>
        {/if}
    </div>
    {#if debug_mode}
    <div class="textcontainer">
        <pre>
            {#if ingest!==undefined}
                {html_report}
            {/if}
        </pre>
    </div>
    {/if}
</div>

<style>
    @import "./dexa.css";

    table{
        width:90%;
        align-self:flex-end;
    }
    th{
        border-style:none;
    }

    th.secondary{
        text-align:center;
    }
    th.fixedwidth
    {
        width:25%;
    }
    .padleft{
        padding-left:20px;
    }
    .align-items-start{
        align-items:start;
    }
    .leftcol
    {
        height: 100%;
        min-width: 875px;
        max-width: 875px;
        overflow-y: auto;
    }
    .maindiv
    {
        height: 100%;
        max-height: 100%;
        width: 100%;
    }
    .textcontainer{
        height:100%;
        max-height:100%;
        overflow-y: auto;
    }
    pre{
        margin:0px;
        padding:0px;
        word-wrap: normal;
        overflow-wrap:normal;
        width: 100%;
        white-space: pre-wrap;
    }
</style>