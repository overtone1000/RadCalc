<script lang="ts">
	import { ingest_data, type DEXA_Ingest_Data } from "./ts/dexa/data_ingest";
	import { DaignosisSet, DetermineDiagnosisSet, empty_mandatory, FRAXExclusionReason, init_mandatory, type DEXA_Mandatory_Manual_Data } from "./ts/dexa/manual";
	import { onMount } from "svelte";
	import type { MouseEventHandler } from "svelte/elements";
	import DexaMeasurements from "./dexa_measurements.svelte";
	import { getSpineField, type DEXA_Comparison, type DEXA_Measurements, type SpineField } from "./ts/dexa/basic_types";
	import { generate_report, copy_to_clipboard, windows_newline } from "./ts/dexa/generate_report";
	import DexaComparison from "./dexa_comparison.svelte";
	import Footer from "../@commons/footer.svelte";
    import Lock from "./lock.svelte";
	import HeightPlot from "./height_plot.svelte";
	import ResultsPlot from "./results_plot.svelte";
	import Copy from "./copy.svelte";
	import { get_spine_string } from "./ts/dexa/string_manip";
	    
    const result_plot_width=100;

    let last_raw_ingest:string|undefined=undefined;

    let ingest:DEXA_Ingest_Data|undefined=$state(undefined);
    let mandatory:DEXA_Mandatory_Manual_Data=$state(empty_mandatory());

    let spine_string:string=$derived.by(()=>{
        let res=get_spine_string(mandatory);

        if(res===null)
        {
            return "Spine";   
        }
        else
        {
            return res;
        }
    });

    let diagnosis_set:DaignosisSet=$derived.by(()=>{
        if(ingest!==undefined)
        {
            return DetermineDiagnosisSet(ingest,mandatory);   
        }
        else
        {
            return DaignosisSet.Both;
        }
    })
    
    const debug_mode:boolean=true && import.meta.env.DEV; //if in development mode, put in debug.

    //Only for debugging
    onMount(()=> {
        if(debug_mode){
            fetch("example_forms/Example_Ingest_Template.txt").then(
            (result)=>{
                result.text().then(
                    (result)=>{
                        handle_raw_ingest(result);
                        mandatory.comparison.date="1999-06-10";
                        mandatory.comparison.height_in_inches.height_in_inches=63;
                        mandatory.height_in_inches.height_in_inches=62;
                        mandatory.reported_tallest_height.feet=5;
                        mandatory.reported_tallest_height.inches=4;
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

    let selected_spinefield:SpineField|undefined=$derived.by
    (
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

                if(spinefield!==undefined)
                {
                    let meas:DEXA_Measurements|undefined = ingest.spine.get(spinefield);
                    if(meas===undefined)
                    {
                        console.debug("Setting spine field.");
                        meas = {
                            locked: false,
                            bone_mineral_density: undefined,
                            t_score: undefined,
                            z_score: undefined
                        };
                        ingest.spine.set(spinefield,meas);
                    }
                    return spinefield;
                }
            }

            return undefined;
        }
    );

    let current_spine_measurement:DEXA_Measurements|undefined=$state(undefined);

    $effect(
        ()=>{
            if(ingest!==undefined && selected_spinefield!==undefined)
            {
                current_spine_measurement=ingest.spine.get(selected_spinefield);
            }
        }
    )

    $effect(
        ()=>{
            if(ingest!==undefined && selected_spinefield!==undefined && current_spine_measurement!==undefined)
            {
                ingest.spine.set(selected_spinefield,current_spine_measurement);
            }
        }
    )

    // Change input styles if values are unusual
    function get_style(warn:boolean)
    {
        const warn_color="#857803";
        let retval="border-radius:5px; padding:1px;";
        if(warn)
        {
            retval+=" background:"+warn_color+";";
        }
        return retval;
    }

    function height_is_uncommon(height:number)
    {
        const minimum_warn_height=4*12;
        const maximum_warn_height=7*12;
        return height<=minimum_warn_height || height >=maximum_warn_height;
    }
    function growth_is_uncommon()
    {
        const maximum_warn_increase=1; //Warn if they grew an inch!
        return (
            mandatory.height_in_inches.exists && 
            mandatory.height_in_inches.height_in_inches !== null &&
            mandatory.comparison.height_in_inches.exists &&
            mandatory.comparison.height_in_inches.height_in_inches !== null &&
            mandatory.height_in_inches.height_in_inches-mandatory.comparison.height_in_inches.height_in_inches>=maximum_warn_increase
        );
    }
    let reported_tallest_height_style=$derived.by(
        ()=>{
            let warn=false;
            if(mandatory.reported_tallest_height.exists)
            {
                if(mandatory.reported_tallest_height.inches !== null && mandatory.reported_tallest_height.feet !== null)
                {
                    if(mandatory.reported_tallest_height.feet > 0 && mandatory.reported_tallest_height.inches >= 12)
                    {
                        warn=true; //Feet provided, but inches is > 12!
                    }
                    else
                    {
                        let height=mandatory.reported_tallest_height.feet*12+mandatory.reported_tallest_height.inches;
                        
                        if(height_is_uncommon(height))
                        {
                            warn=true; //Unusual height   
                        }
                    }
                }
            }
            return get_style(warn);
        }
    );
    let current_height_style=$derived.by(
        ()=>{
            let warn=false;
            if(mandatory.height_in_inches.exists && mandatory.height_in_inches.height_in_inches!==null && height_is_uncommon(mandatory.height_in_inches.height_in_inches))
            {
                warn=true;   
            }
            else if(growth_is_uncommon())
            {
                warn=true;
            }
            return get_style(warn);
        }
    );
    let previous_height_style=$derived.by(
        ()=>{
            let warn=false;
            if(mandatory.comparison.height_in_inches.exists && mandatory.comparison.height_in_inches.height_in_inches!==null && height_is_uncommon(mandatory.comparison.height_in_inches.height_in_inches))
            {
                warn=true;
            }
            else if(growth_is_uncommon())
            {
                warn=true;
            }
            return get_style(warn);
        }
    );
    let right_radius_trend_checkbox_style=$derived.by(
        ()=>{return get_style(mandatory.use_for_analysis.right_radius && !mandatory.use_for_comparison.right_radius);}
    );
    let left_radius_trend_checkbox_style=$derived.by(
        ()=>{return get_style(mandatory.use_for_analysis.left_radius && !mandatory.use_for_comparison.left_radius);}
    );
    let right_hip_trend_checkbox_style=$derived.by(
        ()=>{return get_style(mandatory.use_for_analysis.right_hip && !mandatory.use_for_comparison.right_hip);}
    );
    let left_hip_trend_checkbox_style=$derived.by(
        ()=>{return get_style(mandatory.use_for_analysis.left_hip && !mandatory.use_for_comparison.left_hip);}
    );
    let spine_trend_checkbox_style=$derived.by(
        ()=>{return get_style(selected_spinefield !== undefined && !mandatory.use_for_comparison.spine);}
    );

    let genereate_html_report = () => {
        if(debug_mode && ingest!==undefined && enabled_report_generation)
        {
            console.debug("Generating report.");
            return windows_newline+generate_report(ingest,mandatory,diagnosis_set);   //Need newline because of how pre works. Just a formatting thing.
        }
        else
        {
            return "                                                                                                                                     ";   //Just an empty string to make formatting stop jittering.
        }
    };


    //Report Generation
    let html_report=$derived(genereate_html_report());

    let generate_report_button_action = () => {
        if(ingest!==undefined)
        {
            let report=generate_report(ingest,mandatory,diagnosis_set);
            copy_to_clipboard(report);
        }
    };

    function date_to_string(date:Date)
    {
        let month = (date.getMonth()+1).toString(); //zero indexed
        if(month.length<2){month="0"+month;}
        let day = date.getDate().toString();
        if(day.length<2){day="0"+day;}
        return date.getFullYear()+"-"+month+"-"+day;
    }

    let today = $state((new Date()));
    let yesterday_string = $derived.by(
        ()=>{
            let yesterday=new Date(today);
            yesterday.setDate(yesterday.getDate()-1);
            return date_to_string(yesterday);
        }
    );

    let patient_dob_string = $derived.by(
        ()=>{
            if(ingest!==undefined)
            {
                let date = new Date(ingest.patient_dob);
                return date_to_string(date);
            }
            else
            {
                return undefined;
            }
        }
    );

    let sex_to_string = () => {
        if(ingest!==undefined){
            if(ingest.patient_sex=="M")
            {
                return "male"
            }
            else{
                return "female"
            }
        }
    }


    let enabled_report_generation:boolean = $derived.by(
        ()=>{
            const measurement_ready=(meas:DEXA_Measurements|undefined)=>{
                return meas && 
                meas.locked && 
                Number.isFinite(meas.bone_mineral_density) &&
                Number.isFinite(meas.t_score) && 
                Number.isFinite(meas.z_score);
            };

            const comparison_ready=(comp:DEXA_Comparison|undefined)=>{
                return comp &&
                comp.locked &&
                Number.isFinite(comp.bone_mineral_density_absolute_change) &&
                Number.isFinite(comp.bone_mineral_density_percentage_change);
            };

            if(ingest!==undefined)
            {
                if(mandatory.reported_tallest_height.exists && (mandatory.reported_tallest_height.feet===null || mandatory.reported_tallest_height.inches===null)){return false;}
                if(mandatory.height_in_inches.exists && mandatory.height_in_inches.height_in_inches===null){return false;}
                if(mandatory.comparison.exists && mandatory.comparison.height_in_inches.exists && mandatory.comparison.height_in_inches.height_in_inches===null){return false;}

                if(selected_spinefield)
                {
                    if(!measurement_ready(current_spine_measurement)){return false;}
                }
                if(mandatory.use_for_analysis.left_hip){
                    if(!measurement_ready(ingest.hips.left.total)){return false;}
                    if(!measurement_ready(ingest.hips.left.neck)){return false;}
                }
                //if(mandatory.use_for_analysis.left_hip_neck){
                //    if(!measurement_ready(ingest.hips.left.neck)){return false;}
                //}
                if(mandatory.use_for_analysis.right_hip){
                    if(!measurement_ready(ingest.hips.right.total)){return false;}
                    if(!measurement_ready(ingest.hips.right.neck)){return false;}
                }
                //if(mandatory.use_for_analysis.right_hip_neck){
                //    if(!measurement_ready(ingest.hips.right.neck)){return false;}
                //}
                if(mandatory.use_for_analysis.left_radius){
                    if(!measurement_ready(ingest.radii.left)){return false;}
                }
                if(mandatory.use_for_analysis.right_radius){
                    if(!measurement_ready(ingest.radii.right)){return false;}
                }

                if(
                    selected_spinefield === undefined &&
                    !mandatory.use_for_analysis.left_hip &&
                    //!mandatory.use_for_analysis.left_hip_neck &&
                    !mandatory.use_for_analysis.right_hip &&
                    //!mandatory.use_for_analysis.right_hip_neck &&
                    !mandatory.use_for_analysis.left_radius &&
                    !mandatory.use_for_analysis.right_radius
                )
                {
                    return false;
                }

                if(selected_spinefield !==undefined && mandatory.use_for_comparison.spine){
                    if(!comparison_ready(ingest.trend.spine)){return false;}
                }
                if(mandatory.use_for_analysis.left_hip && mandatory.use_for_comparison.left_hip){
                    if(!comparison_ready(ingest.trend.left_hip)){return false;}
                }
                if(mandatory.use_for_analysis.right_hip && mandatory.use_for_comparison.right_hip){
                    if(!comparison_ready(ingest.trend.right_hip)){return false;}
                }
                if(mandatory.use_for_analysis.left_radius && mandatory.use_for_comparison.left_radius){
                    if(!comparison_ready(ingest.trend.left_radius)){return false;}
                }
                if(mandatory.use_for_analysis.right_radius && mandatory.use_for_comparison.right_radius){
                    if(!comparison_ready(ingest.trend.right_radius)){return false;}
                }

                if(mandatory.use_frax){
                    if(!ingest.frax.locked || 
                    !Number.isFinite(ingest.frax.risk_of_hip_fracture) || 
                    !Number.isFinite(ingest.frax.risk_of_osteoporotic_fracture)){
                        return false;
                    }
                }
                else{
                    if(mandatory.reason_for_frax_exclusion.reason===FRAXExclusionReason.Other
                        && mandatory.reason_for_frax_exclusion.other_text===""                    
                    ){return false;}
                }

                if(mandatory.post_menopausal.display && mandatory.post_menopausal.value===null)
                {
                    return false;
                }

                return true;
            }
            else
            {
                return false;
            }
        }

        
    )
</script>

<div id="body_container" class="main fill_vertical fill_horizontal flexcol centered">
    <div class="flexrow align-self-centered flex_grow flex_shrink">
        <div class="flexcol leftcol">
            <button onclick={text_ingest}>Ingest text from clipboard</button>
            {#if ingest!==undefined}
                <div class="flexrow full-width bottom_border" style="padding-bottom:10px">
                    <div class="flexrow flexgrow">Study Info</div>
                    <div class="flexrow flexgrow">{ingest.last_name}<Copy value={ingest.last_name}/></div>
                    <div class="flexrow flexgrow">MRN: {ingest.mrn}<Copy value={ingest.mrn}/></div>
                    <div class="flexrow flexgrow">Accession: {ingest.accession}<Copy value={ingest.accession}/></div>
                </div>

                <div class="flexrow full-width bottom_border">
                    <div class="rotated">Comp</div>
                    <div class="flexcol flexgrow">
                        <div class="flexrow padleft">
                            <label>Comparison available:<input type="checkbox" bind:checked={mandatory.comparison.exists}></label>
                            <div class="flexrow justify_space_around flexgrow">
                                {#if mandatory.comparison.exists}
                                    <label>Comparison date:<input type="date" max={yesterday_string} min={patient_dob_string} required disabled={!mandatory.comparison.exists} bind:value={mandatory.comparison.date}></label>
                                    <label>Outside comparison disclaimer:<input type="checkbox" disabled={!mandatory.comparison.exists} bind:checked={mandatory.comparison.outside_comparison}></label>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flexrow full-width  bottom_border">
                    <div class="rotated">Patient</div>
                    <div class="flexrow full-width">
                        <div class="flexcol flexgrow">
                            <div class="flexcol align_items_end align_self_center">
                                <div class="flexrow" style={reported_tallest_height_style}>
                                    <label>Reported tallest height: <input type="checkbox" tabindex=-1 bind:checked={mandatory.reported_tallest_height.exists}></label>
                                    <input type="number" step="1" class="numberbox left_margin" required min="0" disabled={!mandatory.reported_tallest_height.exists} bind:value={mandatory.reported_tallest_height.feet}>
                                    <div class="left_margin"> ft </div>
                                    <input type="number" step="any" class="numberbox left_margin" required min="0" disabled={!mandatory.reported_tallest_height.exists} bind:value={mandatory.reported_tallest_height.inches}>
                                    <div class="left_margin"> in </div>
                                </div>
                                {#if mandatory.comparison.exists}
                                    <div class="flexrow" style={previous_height_style}>
                                        <label>Height on prior exam: <input type="checkbox" tabindex=-1 bind:checked={mandatory.comparison.height_in_inches.exists}></label>
                                        <input type="number" step="any" class="numberbox left_margin" required min="0" disabled={!mandatory.comparison.height_in_inches.exists} bind:value={mandatory.comparison.height_in_inches.height_in_inches}>
                                        <div class="left_margin"> in </div>
                                    </div>
                                {/if}
                                <div class="flexrow" style={current_height_style}>
                                    <label>Height on current exam: <input type="checkbox" tabindex=-1 bind:checked={mandatory.height_in_inches.exists}></label>
                                    <input type="number" step="any" class="numberbox left_margin" required min="0" disabled={!mandatory.height_in_inches.exists} bind:value={mandatory.height_in_inches.height_in_inches}>
                                    <div class="left_margin"> in </div>
                                </div>
                            </div>
                        </div>
                        <div class="flexcol flexgrow flexshrink">
                            {Math.trunc(mandatory.age)} year old {sex_to_string()}
                            {#if mandatory.post_menopausal.display}
                                    <label>Premenopausal <input type="radio" name="menopause" required value={"pre"} bind:group={mandatory.post_menopausal.value}></label>
                                    <label>Postmenopausal <input type="radio" name="menopause" required value={"post"} bind:group={mandatory.post_menopausal.value}></label>
                                    <label>Both <input type="radio" name="menopause" required value={"both"} bind:group={mandatory.post_menopausal.value}></label>
                            {/if}
                        </div>
                        <HeightPlot ingest={ingest} mandatory={mandatory}/>
                    </div>
                </div>

                <div class="flexrow full-width bottom_border">
                    <div class="rotated">Tech</div>
                    <div class="flexrow flexgrow justify_space_around">
                        <label>Spine Osteophyte <input type="checkbox" bind:checked={mandatory.technical_comments.spine_osteophyte}></label>
                    </div>
                </div>
                
                <div class="flexrow full-width bottom_border">
                    <div class="rotated">Results</div>
                    <div class="flexcol flexgrow">
                        <div class="flexcol flexgrow">
                            <div class="measurement_grid">
                                <label>Right Radius <input type="checkbox" bind:checked={mandatory.use_for_analysis.right_radius}></label>
                                <label>L1 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L1}></label>
                                <label>Left Radius <input type="checkbox" bind:checked={mandatory.use_for_analysis.left_radius}></label>
                                

                                <div></div>
                                <label>L2 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L2}></label>
                                <div></div>
                                <!-- <label>Left Femoral Neck <input type="checkbox" bind:checked={mandatory.use_for_analysis.left_hip_neck}></label> -->
                                <!-- <label>Right Femoral Neck <input type="checkbox" bind:checked={mandatory.use_for_analysis.right_hip_neck}></label> -->

                                <div></div>
                                <label>L3 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L3}></label>
                                <div></div>
                                
                                <label>Right Hip <input type="checkbox" bind:checked={mandatory.use_for_analysis.right_hip}></label>
                                <label>L4 <input type="checkbox" bind:checked={mandatory.use_for_analysis.L4}></label>
                                <label>Left Hip <input type="checkbox" bind:checked={mandatory.use_for_analysis.left_hip}></label>

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
                                    {#if selected_spinefield!==undefined && current_spine_measurement!==undefined}
                                        <DexaMeasurements used={true} name={selected_spinefield} bind:measurements={current_spine_measurement}/>
                                    {/if}
                                    <DexaMeasurements used={mandatory.use_for_analysis.left_hip} name="Left Total Hip" bind:measurements={ingest.hips.left.total}/>
                                    <DexaMeasurements used={mandatory.use_for_analysis.left_hip} name="Left Femoral Neck" bind:measurements={ingest.hips.left.neck}/>
                                    <DexaMeasurements used={mandatory.use_for_analysis.right_hip} name="Right Total Hip" bind:measurements={ingest.hips.right.total}/>
                                    <DexaMeasurements used={mandatory.use_for_analysis.right_hip} name="Right Femoral Neck" bind:measurements={ingest.hips.right.neck}/>
                                    <DexaMeasurements used={mandatory.use_for_analysis.left_radius} name="Left Radius" bind:measurements={ingest.radii.left}/>
                                    <DexaMeasurements used={mandatory.use_for_analysis.right_radius} name="Right Radius" bind:measurements={ingest.radii.right}/>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <ResultsPlot ingest={ingest} mandatory={mandatory} diagnosis_set={diagnosis_set} width={result_plot_width}/>
                </div>

                {#if mandatory.comparison.exists && !mandatory.comparison.outside_comparison}
                    <div class="flexrow full-width bottom_border">
                        <div class="rotated">Trends</div>
                        <div class="flexcol flex_grow">
                            <div class="trend_grid">
                                {#if mandatory.use_for_analysis.right_radius}
                                    <label style={right_radius_trend_checkbox_style} class="trend_grid_left">Right Radius <input type="checkbox" bind:checked={mandatory.use_for_comparison.right_radius}></label>
                                {/if}
                                {#if mandatory.use_for_analysis.left_radius}
                                    <label style={left_radius_trend_checkbox_style} class="trend_grid_right">Left Radius <input type="checkbox" bind:checked={mandatory.use_for_comparison.left_radius}></label>
                                {/if}
                                {#if selected_spinefield!==undefined}
                                    <label style={spine_trend_checkbox_style} class="trend_full_column">{spine_string} <input type="checkbox" bind:checked={mandatory.use_for_comparison.spine}></label>
                                {/if}
                                {#if mandatory.use_for_analysis.right_hip}
                                    <label style={right_hip_trend_checkbox_style} class="trend_grid_left">Right Hip <input type="checkbox" bind:checked={mandatory.use_for_comparison.right_hip}></label>
                                {/if}
                                {#if mandatory.use_for_analysis.left_hip}
                                    <label style={left_hip_trend_checkbox_style} class="trend_grid_right">Left Hip <input type="checkbox" bind:checked={mandatory.use_for_comparison.left_hip}></label>
                                {/if}
                            </div>
                            {#if mandatory.use_for_comparison.spine || mandatory.use_for_comparison.left_hip || mandatory.use_for_comparison.right_hip || mandatory.use_for_comparison.left_radius}
                            <table>
                                <thead>
                                    <tr>
                                        <th class="fixedwidth">Site</th>
                                        <th class="fixedwidth secondary">Locked</th>
                                        <th class="secondary">Absolute Δ BMD</th>
                                        <th class="secondary">%Δ BMD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <DexaComparison used={selected_spinefield!==undefined && mandatory.use_for_comparison.spine} name="Spine" current={current_spine_measurement} bind:comparison={ingest.trend.spine}/>
                                    <DexaComparison used={mandatory.use_for_analysis.left_hip && mandatory.use_for_comparison.left_hip} name="Left Total Hip" current={ingest.hips.left.total} bind:comparison={ingest.trend.left_hip}/>
                                    <DexaComparison used={mandatory.use_for_analysis.right_hip && mandatory.use_for_comparison.right_hip} name="Right Total Hip" current={ingest.hips.right.total} bind:comparison={ingest.trend.right_hip}/>
                                    <DexaComparison used={mandatory.use_for_analysis.left_radius && mandatory.use_for_comparison.left_radius} name="Left Radius" current={ingest.radii.left} bind:comparison={ingest.trend.left_radius}/>
                                    <DexaComparison used={mandatory.use_for_analysis.right_radius && mandatory.use_for_comparison.right_radius} name="Right Radius" current={ingest.radii.right} bind:comparison={ingest.trend.right_radius}/>
                                </tbody>
                            </table>
                            {/if}
                        </div>
                        <div style="width:{result_plot_width}px"></div> <!-- Add empty space to align with results for visual ease -->
                    </div>
                {/if}
                <div class="flexrow full-width bottom_border">
                    <div class="rotated">Frax</div>
                    <div class="flexrow flexgrow padleft">
                        <label>Include in report: <input type="checkbox" bind:checked={mandatory.use_frax}></label>
                        <div class="flexrow justify_space_around flexgrow">
                        {#if mandatory.use_frax }
                            <Lock name="frax" bind:locked={ingest.frax.locked}/>
                            <label> Risk (hip): <input type="number" step="any" bind:value={ingest.frax.risk_of_hip_fracture} class="numberbox" required inert={ingest.frax.locked}/>%</label>
                            <label> Risk (osteoporotic): <input type="number" step="any" bind:value={ingest.frax.risk_of_osteoporotic_fracture} class="numberbox" required inert={ingest.frax.locked}/>%</label>
                        {:else}
                            <div class="flexcol"> 
                                <div>Reason for FRAX exclusion</div>
                                <label>No hips<input type="radio" name="no_frax_reason" value={FRAXExclusionReason.HipsNotEvaluated} bind:group={mandatory.reason_for_frax_exclusion.reason}></label>
                                <label>Less than 40 years old<input type="radio" name="no_frax_reason" value={FRAXExclusionReason.LessThan40YearsOld} bind:group={mandatory.reason_for_frax_exclusion.reason}></label>
                                <label>More than 90 years old<input type="radio" name="no_frax_reason" value={FRAXExclusionReason.MoreThan90YearsOld} bind:group={mandatory.reason_for_frax_exclusion.reason}></label>
                                <div class="flexrow">
                                    <label>Other<input type="radio" name="no_frax_reason" value={FRAXExclusionReason.Other} bind:group={mandatory.reason_for_frax_exclusion.reason}></label>
                                    <input type="text mandatory" required disabled={mandatory.reason_for_frax_exclusion.reason!==FRAXExclusionReason.Other} bind:value={mandatory.reason_for_frax_exclusion.other_text}/>
                                </div>
                            </div>
                        {/if}
                        </div>
                    </div>
                </div>
                <button disabled={!enabled_report_generation} onclick={()=>{if(ingest!==undefined){generate_report_button_action()}}}>Generate Report</button>
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
    <Footer/>
</div>

<style>
    @import "./dexa.css";

    .measurement_grid{
        display: grid;
        grid-template-columns: auto auto auto;
        justify-items: right;
        align-items: center;
        margin-right: 20px;
        margin-top: 10px;
    }

    .trend_grid{
        display: grid;
        grid-template-columns: auto auto auto;
        justify-items: right;
        align-items: center;
        margin-right: 20px;
        margin-top: 10px;
    }
    .trend_full_column{
        grid-column-start: 2;
        grid-column-end: 3;
        grid-row-start: 1;
        grid-row-end: 3;
    }
    .trend_grid_left{
        grid-column-start: 1;
        grid-column-end: 2;
    }
    .trend_grid_right{
        grid-column-start: 3;
        grid-column-end: 4;
    }

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
    .align-self-centered{
        align-self:center;
    }
    .leftcol
    {
        height: 100%;
        min-width: 1000px;
        max-width: 1000px;
        overflow-y: auto;
    }
    .main
    {
        display: flex;
        height: 100%;
        max-height: 100%;
        width: 100%;
    }
    .textcontainer{
        height:100%;
        max-height:100%;
        overflow-y: auto;
        min-width: 100%;
        flex-grow: 1;
    }
    pre{
        margin:0px;
        padding:0px;
        word-wrap: normal;
        overflow-wrap:normal;
        width: 100%;
        white-space: pre-wrap;
    }
    .flex_grow{
        flex-grow:1
    }
    .flex_shrink{
        flex-shrink:1;
        overflow-y:auto;
    }
    .full_width{
        width: 100%;
    }
</style>