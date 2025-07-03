<script lang="ts">
	import type { DEXA_Comparison } from "./ts/dexa/basic_types";
    import { mdiLock } from "@mdi/js";
    import { mdiLockOpenVariant } from "@mdi/js";

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
            {#if comparison.locked}
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
        <td class="centered"><input type="number" class="numberbox" disabled={comparison.locked} step=0.001 bind:value={comparison.bone_mineral_density_absolute_change}></td>
        <td class="centered"><input type="number" class="numberbox" disabled={comparison.locked} step=0.01 bind:value={comparison.bone_mineral_density_percentage_change}></td>
    </tr>
{/if}

<style>
    @import "./dexa.css";
    @import "./measurement.css";
</style>