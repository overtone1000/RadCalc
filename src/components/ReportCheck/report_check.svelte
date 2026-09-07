<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    import { json } from '@sveltejs/kit';
	import { onMount } from "svelte";
    import { agent_endpoint } from "../@commons/secrets";

    type MinistrelResponseBody=
    {
        id:string,
        object:string,
        created:string,
        model:string,
        choices:[
            {
                index:string,
                message:{
                    role:"assistant"|"user"|string,
                    content: string,
                    reasoning_content:null|string
                }
            }
        ],
        functions:{
            called_functions:[],
            function_details:[],
            retrieval:{retrieved_data:[]}
        },
        usage:{
            prompt_tokens:number,
            completion_tokens:number,
            total_tokens:number
        }
    };

    let api_key:string|undefined=$state(undefined);
    onMount(
        ()=> {
            const params = new URLSearchParams(window.location.search);

            params.forEach(
                (value,key,parent)=>{
                    switch(key)
                    {
                        case "key":{
                            api_key=value
                            break;
                        }
                    }
                }
            );
        }
    )

    let query_result:string|undefined=$state(undefined);

    let report:string|undefined=$state(undefined);

    function check()
    {
        if(!api_key)
        {
            alert("An API key is required.");
            return;            
        }
        else
        {
            console.debug(api_key);
        }

        const body={
            messages:[
                {
                    role:"user",
                    content:report
                }
            ],
            stream:false,
            include_functions_info: true,
            include_retrieval_info: true,
            include_guardrails_info: true
        };

        const request = {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "Authorization": "Bearer "+api_key
            },
            body:JSON.stringify(body)
        }

        fetch(agent_endpoint, request).then(
            (result)=>{
                
                //const body:ReadableStream<Uint8Array<ArrayBuffer>> | null = result.body;
                //console.debug(result);

                
                result.text().then(
                    (result)=>{
                        const parsed_result:MinistrelResponseBody=JSON.parse(result);
                        console.debug(parsed_result);
                        query_result=parsed_result.choices[0].message.content;
                        if(parsed_result.choices.length>1)
                        {
                            console.debug("More results than expected!", parsed_result);
                            console.debug(parsed_result.choices);
                        }
                    }
                );
            }
        );
    }

    let check_click: MouseEventHandler<HTMLButtonElement>=(e)=>{

        console.debug(e);

        navigator.clipboard.read().then(
            (clipboard_contents)=>{
                let last_clipboard=clipboard_contents[0];
                last_clipboard.getType("text/plain").then(
                    (blob)=>{
                        blob.text().then(
                            (text)=>{
                                report=text;
                                check();
                            }
                        )
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
        <button onclick={check_click}>Check</button>
        {#if query_result}
        <pre>
            {query_result}
        </pre>
        {/if}
</div>

<style>
</style>