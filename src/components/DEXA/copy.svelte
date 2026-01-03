<script lang="ts">
    import { mdiContentCopy } from "@mdi/js";
	import { copy_to_clipboard } from "./ts/dexa/generate_report";

    type Props = {
        value:string,
    };
    let { 
        value
    }:Props = $props();
</script>

<button class="iconbutton" aria-label={"Copy " + value} onclick={()=>{copy_to_clipboard(value);}}>
    <svg viewBox="0 0 24 24">
            <path class="iconsvg" d={mdiContentCopy}/>
    </svg>
</button>

<style>
.iconbutton{
        border-radius: 5%;
        width:48px;
        height:48px;
        align-self: center;
        margin:2px;
        margin-left:10px;
        border-width: 2px;
}
.iconsvg{
    fill:none;
    stroke:black;
    stroke-width:1;
}
</style>