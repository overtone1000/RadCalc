<script lang="ts">
	import type { MouseEventHandler } from "svelte/elements";
	import { createWorker } from "tesseract.js";

	let result:string|undefined=$state(undefined);

    let image_ingest: MouseEventHandler<HTMLButtonElement>=(e)=>{
        console.debug(e);
        //Powerscribe copy-paste only contains text/plain, so no point in using the more powerful "read" function
        navigator.clipboard.read().then(
            (clipboard_contents)=>{
                let last_clipboard=clipboard_contents[0];
                console.debug(last_clipboard);
                last_clipboard.getType("image/png").then(
                    (blob)=>{
                        recognize(blob);
                    }
                );
            }
        );
    }

    let recognize = async function (image:Blob) {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(image);
        result=ret.data.text;
        await worker.terminate();
    };

</script>

<div>
        <button onclick={image_ingest}>Ingest image from clipboard</button>
        {#if result}
        <pre>
            {result}
        </pre>
        {/if}
</div>

<style>
</style>