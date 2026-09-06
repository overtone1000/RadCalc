<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    import { json } from '@sveltejs/kit';

    let result:string|undefined=$state(undefined);

    let image_ingest: MouseEventHandler<HTMLButtonElement>=(e)=>{
    console.debug(e);
    //Powerscribe copy-paste only contains text/plain, so no point in using the more powerful "read" function
    navigator.clipboard.read().then(
        (clipboard_contents)=>{
            let last_clipboard=clipboard_contents[0];
            console.debug(last_clipboard);
            last_clipboard.getType("text/plain").then(
                (report)=>{
                    //do something with the text
                }
            );
        }
    );
    }

    type Request = {
        report:string
    }
</script>

<div>
        <button onclick={image_ingest}>Ingest string from clipboard</button>
        {#if result}
        <pre>
            {result}
        </pre>
        {/if}
</div>

<style>
</style>