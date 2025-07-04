<script lang="ts">
    type Source = {
        url?:string,
        description:string
    }
	type Props = {
        sources?:Source[]
    }

    let props:Props=$props();
</script>

<div class="cols centered flex_shrink">
    <div class="small_footer">
        {#if props.sources}
            Sources: <br>
            <ol>
                {#each props.sources as source}
                    <li>
                        {#if source.url}
                            <a href={source.url}>
                                {source.description}
                            </a>
                        {:else}
                            {source.description}
                        {/if}
                    </li>
                {/each}
            </ol>
        {/if}
    </div>
    <div>This software is made available under the <a href="license"> MIT License</a>.</div>
</div>

<style>
    @import "../global.css";
</style>