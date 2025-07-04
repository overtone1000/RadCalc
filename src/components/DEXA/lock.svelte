<script lang="ts">
    import { mdiLock } from "@mdi/js";
    import { mdiLockOpenVariant } from "@mdi/js";

    type Props = {
        name:string,
        locked:boolean
    };
    let { 
        name,
        locked = $bindable(),
    }:Props = $props();

    const lock_click = function(){
        locked=!locked;
    }
</script>

{#if locked}
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

<style>
    .iconbutton{
        border-radius: 50%;
        width:48px;
        height:48px;
        align-self: center;
        margin:2px;
    }
    .iconbutton.locked{
        border-width: 2px;
        background-color: gray;
    }
    .iconsvg{
        fill:none;
        stroke:black;
        stroke-width:2;
    }

</style>