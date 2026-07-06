<script lang="ts">
	import type { DEXA_Comparison, DEXA_Measurements } from "./ts/dexa/basic_types";
    import Lock from "./lock.svelte";
    
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

    const lock_click = function(){
        if(comparison!==undefined)
        {   
            comparison.locked=!comparison.locked;
        }
    }
</script>

{#if used && name!==undefined && comparison!==undefined && current!==undefined}
    <tr>
        <td>{name}</td>
        <td class="centered">
            <Lock name={name} bind:locked={comparison.locked}/>
        </td>
        <td class="centered"><input type="number" class="numberbox" required inert={comparison.locked} step="any" max={current.bone_mineral_density} bind:value={comparison.bone_mineral_density_absolute_change}></td>
        <td class="centered"><input type="number" class="numberbox" required inert={comparison.locked} step="any" min="-100" bind:value={comparison.bone_mineral_density_percentage_change}></td>
    </tr>
{/if}

<style>
    @import "./dexa.css";
    @import "./measurement.css";
</style>