<script lang="ts">
	import { mdiContentCopy } from "@mdi/js";
	import { onMount } from "svelte";
	import { copy } from "./AA/text";
	import { CalculateABSA, CalculateAD, CalculateAHW } from "./AA";
	import type { ChangeEventHandler } from "svelte/elements";

    onMount(
        ()=> {
            //SelectForm();
        }
    )

    enum Input{
        AgeBSA,
        AgeHeightWeight,
        AgeAAoDiameter
    };

    let input_mode:Input = $state(Input.AgeHeightWeight);

    let SelectForm:ChangeEventHandler<HTMLInputElement>=(new_input_mode:Event & { currentTarget: EventTarget & HTMLInputElement; })=>{
        input_mode = parseInt(new_input_mode.currentTarget.value) as Input;
        Update();
    }

    function Update()
    {
        console.log("Updating");

        switch(input_mode)
        {
            case Input.AgeBSA:{CalculateABSA();break;}
            case Input.AgeHeightWeight:{CalculateAHW();break;}
            case Input.AgeAAoDiameter:{CalculateAD();break;}
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
                        <input id="Age" type="number" step="any" value="60"/> years<br>
                        <input type="submit" disabled={true} style="display:none">
                        </form>
                        </div>
                        
                        {#if input_mode===Input.AgeBSA}
                            <div id="div_absa">
                            <form id="form_absa" onchange={Update}>
                            Body surface area:
                            <input id="BSA_ABSA"  type="number" step="any" value="1.8"/> m<sup>2</sup><br>
                            <input type="submit" disabled={true} style="display:none">
                            </form>
                            </div>
                        {:else if input_mode===Input.AgeHeightWeight}
                            <div id="div_ahw">
                            <form id="form_ahw" onchange={Update}>
                            Height:
                            <input id="height_AHW"  type="number" step="any" value="180"/>
                            <select id="height_units" value="cm" onchange={Update}>
                                <option value="cm" selected>cm</option>
                                <option value="in">in</option>
                            </select>
                            <br>

                            Weight:
                            <input id="weight_AHW"  type="number" step="any" value="70"/>
                            <select id="weight_units" value="kg" onchange={Update}>
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
                            <input id="aad_ad"  type="number" step="any" value="2.5"/> cm<br>
                            <input type="submit" disabled={true} style="display:none">
                            </form>
                            </div>
                        {/if}
                    </div>
                        
                    <div>
                        <form id="form_sex" onchange={Update}>
                        <input id="SexIsMan" name="Sex" type="radio" value="man" class="radio_style"> Man <br>
                        <input id="SexIsWoman" checked={true} name="Sex" type="radio" value="woman"> Woman <br> 
                        </form>
                    </div>
                </div>
            </div>
        </div>
                
        <div class="cols half_width">
                <h4>Result</h4>
                <p id="CalculationResult"></p>
                <button aria-label="copy" class="iconbutton" id="copy-button" onclick={copy}>
                    <svg viewBox="0 0 24 24">
                            <path class="iconsvg" d={mdiContentCopy}/>
                    </svg>
                </button>
        </div>
    </div>

    <div class="cols centered flex_shrink">
        <div class="small_footer">
            Sources: <br>
            <ol>
                <li>
                    <a href="https://pubmed.ncbi.nlm.nih.gov/19423293/">
                    P. Biaggi, F. Matthews, J. Braun, V. Rousson, P. A. Kaufmann, and R. Jenni, "Gender, Age, and Body Surface Area are the Major Determinants of Ascending Aorta Dimensions in Subjects With Apparently Normal Echocardiograms," Journal of the American Society of Echocardiography, vol. 22, no. 6, pp. 720-725, Jun. 2009.
                    </a>
                </li>
            </ol>
        </div>
            
        <div>This software is made available under the <a href="license"> MIT License</a>.</div>
    </div>
</div>

<style>
    @import "../global.css";
</style>