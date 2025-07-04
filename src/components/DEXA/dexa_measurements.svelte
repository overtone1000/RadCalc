<script lang="ts">
	import type { DEXA_Measurements } from "./ts/dexa/basic_types";
    import Lock from "./lock.svelte";

    type Props = {
        used:boolean,
        name:string,
        measurements:DEXA_Measurements | undefined;
    };
    let { 
        used = $bindable(),
        name,
        measurements = $bindable()
    }:Props = $props();

    const lock_click = function(){
        if(measurements!==undefined)
        {   
            measurements.locked=!measurements.locked;
        }
    }
</script>

{#if used && name!==undefined && measurements!==undefined}
    <tr>
        <td>{name}</td>
        <td class="centered">
            <Lock name={name} bind:locked={measurements.locked}/>
        </td>
        <td class="centered"><input type="number" class="numberbox" disabled={measurements.locked} step=0.001 bind:value={measurements.bone_mineral_density}></td>
        <td class="centered"><input type="number" class="numberbox" disabled={measurements.locked} step=0.01 bind:value={measurements.t_score}></td>
        <td class="centered"><input type="number" class="numberbox" disabled={measurements.locked} step=0.01 bind:value={measurements.z_score}></td>
    </tr>
{/if}

<style>
    @import "./dexa.css";
    @import "./measurement.css";
</style>