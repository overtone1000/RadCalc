<script lang="ts">
	import { mdiContentCopy } from "@mdi/js";
	import { onMount } from "svelte";
	import type { ChangeEventHandler } from "svelte/elements";
	import { createText, createTextAD, type Result } from "./AA/text";
	import { initialize_guesses, iterate_guesses, type Guesses } from "./AA";
	import Footer from "../@commons/footer.svelte";

    onMount(
        ()=> {
            Update();
        }
    )

    enum Input{
        AgeBSA,
        AgeHeightWeight,
        AgeAAoDiameter
    };

    let input_mode:Input = $state(Input.AgeHeightWeight);
    let age:number|undefined = $state(undefined);
    let BSA:number|undefined = $state(undefined);
    let raw_height:number|undefined = $state(undefined);
    let raw_weight:number|undefined = $state(undefined);
    let weight_units:"kg"|"lb" = $state("kg");
    let height_units:"in"|"cm" = $state("cm");
    let AAo_diameter:number|undefined = $state(undefined);
    let sex:"man"|"woman" = $state("man");
    let result:Result|undefined = $state(undefined);
    let result_inner_html:string|undefined = $state(undefined);

    $effect(
        ()=>{
            if(result!==undefined)
            {
                result_inner_html=result.html;
            }
            else
            {
                result_inner_html=undefined;
            }
        }
    );
    
    let SelectForm:ChangeEventHandler<HTMLInputElement>=(new_input_mode:Event & { currentTarget: EventTarget & HTMLInputElement; })=>{
        input_mode = parseInt(new_input_mode.currentTarget.value) as Input;
        Update();
    }

    function Update()
    {
        console.log("Updating",input_mode,age,BSA,raw_height,raw_weight,weight_units,height_units,AAo_diameter,sex);

        switch(input_mode)
        {
            case Input.AgeBSA:{CalculateABSA();break;}
            case Input.AgeHeightWeight:{CalculateAHW();break;}
            case Input.AgeAAoDiameter:{CalculateAD();break;}
        }
    }


    function CalculateABSA(){
        if(age!==undefined && BSA!==undefined)
        {
            result=createText(age,BSA,sex);   
        }
        else
        {
            result=undefined;
        }
    }

    function CalculateAHW()
    {
        if(raw_height!==undefined && raw_weight !==undefined)
        {
            let height_conversion_factor = 0;
            let weight_conversion_factor = 0;

            switch(height_units)
            {
                case "cm":height_conversion_factor=1;break;
                case "in":height_conversion_factor=2.54;break;
            }

            switch(weight_units)
            {
                case "kg":weight_conversion_factor=1;break;
                case "lb":weight_conversion_factor=0.4535924;break;
            }

            const Height = raw_height*height_conversion_factor;
            const Weight = raw_weight*weight_conversion_factor;
            const coef1 =0.007184;
            const coef_weight =0.425;
            const coef_height =0.725;
            
            BSA = coef1*Math.pow(Weight,coef_weight)*Math.pow(Height,coef_height);

            CalculateABSA();
        }
        else
        {
            result=undefined;
        }
    }

    function CalculateAD()
    {
        if(age !==undefined && AAo_diameter !==undefined)
        {
            let guesses:Guesses = initialize_guesses(age, AAo_diameter, sex);
            
            let count = 0;
            while(Math.abs(guesses.err)>0.001)
            {
                iterate_guesses(guesses);
                if(count++>1000)
                {
                    return "Could not calculate.";
                }
            }

            result=createTextAD(age, guesses.last!.BSA, AAo_diameter, sex);
        }
        else
        {
            result=undefined;
        }
    }

    function copy() {
        if(result!==undefined)
        {
            navigator.clipboard.writeText(result.raw);
        }
    }

</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <div class="rows flex_grow fill_horizontal space_evenly">
        <div class="cols half_width">
            <div class="cols">
                <h4>Input Type</h4>
                <form id="input_type">
                    <input id="AgeBSARadio" name="input_type_radio_group" type="radio" value={Input.AgeBSA} class="radio_style" onchange={SelectForm}><label for="AgeBSARadio">Age and BSA</label><br>
                    <input id="AgeHeightWeightRadio" checked name="input_type_radio_group" type="radio" value={Input.AgeHeightWeight} class="radio_style" onchange={SelectForm}><label for="AgeHeightWeightRadio">Age, Height, and Weight</label><br> 
                    <input id="AgeDiameterRadio" name="input_type_radio_group" type="radio" value={Input.AgeAAoDiameter} class="radio_style" onchange={SelectForm}><label for="AgeDiameterRadio">Age and Aortic Diameter</label><br> 
                </form>

                <div class="cols flex_grow space_evenly">
                    <h4>Parameters</h4>
                    <div>
                        <div id="age">
                        <form id="form_age" onchange={Update}>
                        Age:
                        <input id="Age" type="number" step="any" bind:value={age}/> years<br>
                        <input type="submit" disabled={true} style="display:none">
                        </form>
                        </div>
                        
                        {#if input_mode===Input.AgeBSA}
                            <div id="div_absa">
                            <form id="form_absa" onchange={Update}>
                            Body surface area:
                            <input id="BSA_ABSA"  type="number" step="any" bind:value={BSA}/> m<sup>2</sup><br>
                            <input type="submit" disabled={true} style="display:none">
                            </form>
                            </div>
                        {:else if input_mode===Input.AgeHeightWeight}
                            <div id="div_ahw">
                            <form id="form_ahw" onchange={Update}>
                            Height:
                            <input id="height_AHW"  type="number" step="any" bind:value={raw_height}/>
                            <select id="height_units" bind:value={height_units} onchange={Update}>
                                <option value="cm" selected>cm</option>
                                <option value="in">in</option>
                            </select>
                            <br>

                            Weight:
                            <input id="weight_AHW"  type="number" step="any" bind:value={raw_weight}/>
                            <select id="weight_units" bind:value={weight_units} onchange={Update}>
                                <option value="kg" selected>kg</option>
                                <option value="lb">lb</option>
                            </select>
                            <br>
                            <input type="submit" disabled={true} style="display:none">
                            </form>
                            </div>
                        {:else if input_mode===Input.AgeAAoDiameter}
                            <div id="div_ad">
                            <form id="form_ad" onchange={Update}>
                            Ascending aortic diameter:
                            <input id="aad_ad"  type="number" step="any" bind:value={AAo_diameter}/> cm<br>
                            <input type="submit" disabled={true} style="display:none">
                            </form>
                            </div>
                        {/if}
                    </div>
                        
                    <div>
                        <form id="form_sex" onchange={Update}>
                            <input id="SexIsMan" name="Sex" type="radio" value="man" class="radio_style" bind:group={sex}> Man <br>
                            <input id="SexIsWoman" name="Sex" type="radio" value="woman" bind:group={sex}> Woman <br> 
                        </form>
                    </div>
                </div>
            </div>
        </div>
                
        <div class="cols half_width">
                {#if result!==undefined}
                    <h4>Result</h4>
                    <p id="CalculationResult">{@html result.html}</p>
                    <button aria-label="copy" class="iconbutton" id="copy-button" onclick={copy}>
                    <svg viewBox="0 0 24 24">
                            <path class="iconsvg" d={mdiContentCopy}/>
                    </svg>
                </button>
                {/if}
        </div>
    </div>

    <Footer sources={
        [
            {
            url: "https://pubmed.ncbi.nlm.nih.gov/19423293/",
            description: 'P. Biaggi, F. Matthews, J. Braun, V. Rousson, P. A. Kaufmann, and R. Jenni, "Gender, Age, and Body Surface Area are the Major Determinants of Ascending Aorta Dimensions in Subjects With Apparently Normal Echocardiograms," Journal of the American Society of Echocardiography, vol. 22, no. 6, pp. 720-725, Jun. 2009.'
            }
        ]
    }/>
</div>

<style>
    @import "../global.css";
</style>