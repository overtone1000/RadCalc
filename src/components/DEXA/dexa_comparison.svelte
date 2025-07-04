<script lang="ts">
	import type { DEXA_Comparison } from "./ts/dexa/basic_types";
    import { mdiLock } from "@mdi/js";
    import { mdiLockOpenVariant } from "@mdi/js";
    import Lock from "./lock.svelte";
    
    type Props = {
        used:boolean,
        name:string,
        comparison:DEXA_Comparison | undefined;
    };
    let { 
        used = $bindable(),
        name,
        comparison = $bindable()
    }:Props = $props();

    const lock_click = function(){
        if(comparison!==undefined)
        {   
            comparison.locked=!comparison.locked;
        }
    }
</script>

{#if used && name!==undefined && comparison!==undefined}
    <tr>
        <td>{name}</td>
        <td class="centered">
            <Lock name={name} bind:locked={comparison.locked}/>
        </td>
        <td class="centered"><input type="number" class="numberbox" disabled={comparison.locked} step=0.001 bind:value={comparison.bone_mineral_density_absolute_change}></td>
        <td class="centered"><input type="number" class="numberbox" disabled={comparison.locked} step=0.01 bind:value={comparison.bone_mineral_density_percentage_change}></td>
    </tr>
{/if}

<style>
    @import "./dexa.css";
    @import "./measurement.css";
</style>