<script lang="ts">
	import { mdiContentCopy } from "@mdi/js";


</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <div class="main fill_vertical cols margin">
		<div class="rows flex_grow space_evenly">
			<div class="cols half_width">
				<div class="cols">
					<h4>Parameters</h4>
					<form id="form_intensities">
                        Thymic Intensity on In-Phase:
                        <input id="thymus_in"  type="number" step="any" value=""/><br>
                        Thymic Intensity on Out-of-Phase:
                        <input id="thymus_out"  type="number" step="any" value=""/><br>
                        <br>
                        Paraspinal Muscular Intensity on In-Phase:
                        <input id="muscle_in"  type="number" step="any" value=""/><br>
                        Paraspinal Muscular Intensity on Out-of-Phase:
                        <input id="muscle_out"  type="number" step="any" value=""/><br>
                        <input type="submit" disabled={true} style="display:none">
					</form>
				</div>
            </div>
		</div>
		<div class="cols half_width">
			<h4>Result</h4>
			<p id="CalculationResult"></p>
			<button aria-label="copy" class="iconbutton" id="copy-button">
				<svg class="iconsvg" id="copy-icon" viewBox="0 0 24 24">
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
					<a href="https://pubmed.ncbi.nlm.nih.gov/25105246/">
					A. M. Priola et al., "Differentiation of Rebound and Lymphoid Thymic Hyperplasia from Anterior Mediastinal Tumors with Dual-Echo Chemical-Shift MR Imaging in Adulthood: Reliability of the Chemical-Shift Ratio and Signal Intensity Index," Radiology, vol. 274, no. 1, pp. 238-249, Aug. 2014.
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