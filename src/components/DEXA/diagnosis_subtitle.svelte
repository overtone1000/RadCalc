<script lang="ts">
	import * as Plot from "@observablehq/plot";
	import type { Calculations } from "./results_plot.svelte";

    type Props = {
        result:{
            plot:(HTMLElement | SVGSVGElement) & Plot.Plot,
            calculations:Calculations
        },
        width:number
    }

    let props:Props=$props();
</script>

{#if props.result.calculations.diagnosis !== undefined && props.result.calculations.diagnosis.selected_diagnosis !== undefined}
    <div class="inner" style="width:{props.width}px;">
        <div>{props.result.calculations.diagnosis.selected_diagnosis.name}</div>
    </div>
{/if}

<style>
    .inner{
        display:flex;
        flex-direction: row;
        justify-content: space-around;
        flex-shrink: true;
        font-size: x-small;
        word-wrap: normal;
    }
</style>