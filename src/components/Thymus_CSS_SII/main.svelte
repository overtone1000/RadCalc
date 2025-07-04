<script lang="ts">
	import { mdiContentCopy, mdiReflectVertical } from "@mdi/js";
	import { windows_newline } from "../DEXA/ts/dexa/generate_report";
	import Footer from "../@commons/footer.svelte";
	
	function copy() {
        if(result.text_for_copy)
        {
            navigator.clipboard.writeText(result.text_for_copy);   
        }
    }

	let thymus_in:number|undefined=$state(undefined);
	let thymus_out:number|undefined=$state(undefined);
	let muscle_in:number|undefined=$state(undefined);
	let muscle_out:number|undefined=$state(undefined);

	const line1 = "Muscular signal intensity index is ";
	const line2 = "Thymic signal intensity index is ";
	const line3 = "Chemical shift ratio is ";
	
	//let html:string=$state("");
	//let text_for_copy:string|undefined=$state(undefined);

	let result:{html:string, text_for_copy:string|undefined}=$derived.by(
		()=>{

			let retval:{html:string, text_for_copy:string|undefined} = {
				html: "",
				text_for_copy: undefined
			};

			if(
				thymus_in === undefined || Number.isNaN(thymus_in) || 
				thymus_out === undefined || Number.isNaN(thymus_out) || 
				muscle_in === undefined || Number.isNaN(muscle_in) || 
				muscle_out === undefined || Number.isNaN(muscle_out)
			)
			{
				let values_not_ready:string[]=[];

				if(thymus_in === undefined || Number.isNaN(thymus_in))
				{
					values_not_ready.push("Thymic Intensity on In-Phase");
				}

				if(thymus_out === undefined || Number.isNaN(thymus_out))
				{
					values_not_ready.push("Thymic Intensity on Out-of-Phase");
				}

				if(muscle_in === undefined || Number.isNaN(muscle_in))
				{
					values_not_ready.push("Muscle Intensity on In-Phase");
				}

				if(muscle_out === undefined || Number.isNaN(muscle_out))
				{
					values_not_ready.push("Muscle Intensity on Out-of-Phase");
				}
				
				if(values_not_ready.length>0)
				{
					retval.html="Please provide ";
					if(values_not_ready.length===1)
					{
						retval.html+=values_not_ready[0]+".";
					}
					else if(values_not_ready.length===2)
					{
						retval.html+=values_not_ready[0]+" and "+values_not_ready[1];
					}
					else
					{
						for(let n=0;n<values_not_ready.length-1;n++)
						{
							retval.html+=values_not_ready[n]+", ";
						}
						retval.html+=" and " + values_not_ready[values_not_ready.length-1] +".";
					}
				}
			}
			else
			{
				let CSR = (thymus_out/muscle_out)/(thymus_in/muscle_in);
				let SSI_muscle = (muscle_in-muscle_out)/muscle_in*100.0;
				let SSI_thymus = (thymus_in-thymus_out)/thymus_in*100.0;

				retval.html = line1 + "<b><font color=\"#edca4e\">" + SSI_muscle.toFixed(0) + "</font></b>.<br>";
				retval.html += line2 + "<b><font color=\"#edca4e\">" + SSI_thymus.toFixed(0) + "</font></b>.<br>";
				retval.html += line3 + "<b><font color=\"#edca4e\">" + CSR.toFixed(3) + "</font></b>.<br>";

				retval.text_for_copy = line1 + SSI_muscle.toFixed(0) + "." + windows_newline;
				retval.text_for_copy += line2 + SSI_thymus.toFixed(0) + "." + windows_newline;
				retval.text_for_copy += line3 + CSR.toFixed(3) + ".";
			}
			return retval;
		}
	);
</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <div class="fill_vertical fill_horizontal rows margin">
		<div class="rows half_width space_evenly">
			<div class="cols fill_horizontal">
				<div class="cols">
					<h4>Parameters</h4>
					<form id="form_intensities">
                        Thymic Intensity on In-Phase:
                        <input id="thymus_in"  type="number" step="any" bind:value={thymus_in}/><br>
                        Thymic Intensity on Out-of-Phase:
                        <input id="thymus_out"  type="number" step="any" bind:value={thymus_out}/><br>
                        <br>
                        Paraspinal Muscular Intensity on In-Phase:
                        <input id="muscle_in"  type="number" step="any" bind:value={muscle_in}/><br>
                        Paraspinal Muscular Intensity on Out-of-Phase:
                        <input id="muscle_out"  type="number" step="any" bind:value={muscle_out}/><br>
                        <input type="submit" disabled={true} style="display:none">
					</form>
				</div>
            </div>
		</div>
		<div class="cols half_width">
			<h4>Result</h4>
			<p id="CalculationResult">{@html result.html}</p>
			{#if result.text_for_copy !== undefined}
			<button aria-label="copy" class="iconbutton" id="copy-button" onclick={copy}>
				<svg class="iconsvg" id="copy-icon" viewBox="0 0 24 24">
					<path class="iconsvg" d={mdiContentCopy}/>
				</svg>
 			</button>
			{/if}
		</div>
	</div>
	<Footer sources={
        [
            {
            url: "https://pubmed.ncbi.nlm.nih.gov/25105246/",
            description: 'A. M. Priola et al., "Differentiation of Rebound and Lymphoid Thymic Hyperplasia from Anterior Mediastinal Tumors with Dual-Echo Chemical-Shift MR Imaging in Adulthood: Reliability of the Chemical-Shift Ratio and Signal Intensity Index," Radiology, vol. 274, no. 1, pp. 238-249, Aug. 2014.'
            }
        ]
    }/>
</div>

<style>
    @import "../global.css";
</style>