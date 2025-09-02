<script lang="ts">
	import * as Plot from "@observablehq/plot";

    type Props = {
        plot:(HTMLElement | SVGSVGElement) & Plot.Plot
    }

    let props:Props=$props();

    let plot_div:HTMLElement;

    $effect(
        ()=>{
            if(plot_div!==undefined)
            {
                while(plot_div.firstChild !== null)
                {
                    plot_div.firstChild.remove();   
                }
            }
            plot_div.append(props.plot);
        }
    )
</script>

<div>
    <div bind:this={plot_div}></div>
</div>

<style>
    
</style>