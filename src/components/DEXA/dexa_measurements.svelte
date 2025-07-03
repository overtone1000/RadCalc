<script lang="ts">
	import type { DEXA_Measurements } from "./ts/dexa/basic_types";
    import { mdiLock } from "@mdi/js";
    import { mdiLockOpenVariant } from "@mdi/js";

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
            {#if measurements.locked}
                <button class="iconbutton locked" aria-label={"Unlock " + name} onclick={lock_click}>
                    <svg viewBox="0 0 24 24">
                            <path class="iconsvg" d={mdiLock}/>
                    </svg>
                </button>
            {:else}
                <button class="iconbutton" aria-label={"Lock " + name} onclick={lock_click}>
                    <svg viewBox="0 0 24 24">
                            <path class="iconsvg" d={mdiLockOpenVariant}/>
                    </svg>
                </button>
            {/if}
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