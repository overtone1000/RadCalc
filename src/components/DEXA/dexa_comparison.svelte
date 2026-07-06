<script lang="ts">
	import type { DEXA_Comparison, DEXA_Measurements } from "./ts/dexa/basic_types";
    import Lock from "./lock.svelte";
	import { mdiCalculator } from "@mdi/js";
	import { get_input_warn_style, get_warn_style } from "./ts/dexa/styles";
    
    type Props = {
        used:boolean,
        name:string,
        current:DEXA_Measurements | undefined,
        comparison:DEXA_Comparison | undefined;
    };
    let { 
        used = $bindable(),
        name,
        current,
        comparison = $bindable()
    }:Props = $props();

    /*
    const lock_click = function(){
        if(comparison!==undefined)
        {   
            comparison.locked=!comparison.locked;
        }
    }
    */

    let percent_change_min_and_max:{min:number,max:number} = $derived.by(
        ()=>{
            let retval={
                min:-100,
                max:Infinity
            }
            if(comparison!==undefined && comparison.bone_mineral_density_absolute_change!==undefined)
            {
                if(comparison.bone_mineral_density_absolute_change>0)
                {
                    retval.min=0;
                }
                else if(comparison.bone_mineral_density_absolute_change<0)
                {
                    retval.max=0;
                }
            }
            return retval;
        }
    );

    let calculated_value:boolean = $state(false);
    let calculator_previous_bmd:number|null = $state(null);

    $effect(
        ()=>
        {
            if(comparison !== undefined && current !== undefined && current.bone_mineral_density!==undefined)
            {
                if(calculated_value && calculator_previous_bmd)
                {
                    const new_absolute_change = current.bone_mineral_density-calculator_previous_bmd;
                    const new_percent_change = new_absolute_change/calculator_previous_bmd*100;
                    comparison.bone_mineral_density_absolute_change=new_absolute_change;
                    comparison.bone_mineral_density_percentage_change=new_percent_change;
                }
                else
                {
                    if(comparison.bone_mineral_density_absolute_change !== undefined)
                    {
                        calculator_previous_bmd=current.bone_mineral_density-comparison.bone_mineral_density_absolute_change;
                    }
                }
            }
        }
    );

    let warn:boolean = $derived.by(
        ()=>{
            if(!calculated_value && comparison !== undefined && comparison.bone_mineral_density_absolute_change !== undefined && comparison.bone_mineral_density_percentage_change !== undefined && calculator_previous_bmd!==null)
            {
                const should_be_nearly_zero=Math.abs(comparison.bone_mineral_density_absolute_change-comparison.bone_mineral_density_percentage_change/100*calculator_previous_bmd);
                console.debug("Discrepancy is ",should_be_nearly_zero);
                return should_be_nearly_zero>0.02; //Gives about 3 sig digs
            }
            else
            {
                return false;
            }
        }
    );

    let comparison_input_style = $derived.by(()=>{return get_input_warn_style(warn);});
</script>

{#if used && name!==undefined && comparison!==undefined && current!==undefined}
    <tr>
        <td>{name}</td>
        <td class="centered">
            <Lock name={name} bind:locked={comparison.locked}/>
        </td>
        <td class="centered"><input style={comparison_input_style} type="number" class="numberbox" required inert={comparison.locked} disabled={calculated_value} step="any" max={current.bone_mineral_density} bind:value={comparison.bone_mineral_density_absolute_change}></td>
        <td class="centered"><input style={comparison_input_style} type="number" class="numberbox" required inert={comparison.locked} disabled={calculated_value} step="any" min={percent_change_min_and_max.min} max={percent_change_min_and_max.max} bind:value={comparison.bone_mineral_density_percentage_change}></td>
        <td class="centered">
            {#if comparison !== undefined && current !== undefined && current.bone_mineral_density!==undefined}
                {#if comparison.locked}
                    <button class="iconbutton locked" aria-label={"Calculate " + name} inert={comparison.locked} onclick={()=>{calculated_value=!calculated_value;}}>
                        <svg viewBox="0 0 24 24">
                            <path class="iconsvg" d={mdiCalculator}/>
                        </svg>
                    </button>
                {:else}
                    <button class="iconbutton" aria-label={"Calculate " + name} inert={comparison.locked} onclick={()=>{calculated_value=!calculated_value;}}>
                        <svg viewBox="0 0 24 24">
                            <path class="iconsvg" d={mdiCalculator}/>
                        </svg>
                    </button>
                {/if}
            {:else}
                Error
            {/if}
        </td>
        <td class="centered">
            <input type="number" class="numberbox" required inert={comparison.locked} disabled={!calculated_value} step="any" min="0" bind:value={calculator_previous_bmd}>
        </td>
    </tr>
{/if}

<style>
    @import "./dexa.css";
    @import "./measurement.css";
    .iconbutton{
        border-radius: 50%;
        width:48px;
        height:48px;
        align-self: center;
        margin:2px;
        border-width: 2px;
        background-color: lightskyblue;
    }
    .iconbutton.locked{
        border-width: 2px;
        background-color: gray;
    }
    .iconsvg{
        fill:none;
        stroke:black;
        stroke-width:1;
    }
</style>