<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    import { onMount } from "svelte";
    import { agent_endpoint } from "../@commons/secrets";
	import { derived } from "svelte/store";
    import { ZodCorrection, ZodResponseSchema, type Correction, type ResponseBody, type ResponseSchema } from "./schema";
	import z from "zod";


    const debug_mode:boolean=true && import.meta.env.DEV; //if in development mode, put in debug.
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

            if(debug_mode){
                report=test_report;
                const test_content=test_result.choices[0].message.content;
                console.debug(test_content);
                getResultFromResponse(test_result as ResponseBody);
            }
        }
    )

    function getResultFromResponse(response:ResponseBody)
    {
        if(response.choices.length>1)
        {
            console.debug("More results than expected!", response);
            console.debug(response.choices);
        }

        let keep_cleaning=true;

        try{
            const content=response.choices[0].message.content;
            console.debug(content);
            query_result=ZodResponseSchema.parse(content);
            console.debug(query_result);

        }
        catch(e)
        {
            if(e instanceof z.ZodError)
            {
                console.error(e.issues);
            }
        }
    }

    let query_result:ResponseSchema|undefined=$state(undefined);

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
            response_format:{type:"json_object"},
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

        console.debug("Request",request.body);

        fetch(agent_endpoint, request).then(
            (result)=>{
                
                //const body:ReadableStream<Uint8Array<ArrayBuffer>> | null = result.body;
                console.debug(result);

                
                result.text().then(
                    (result)=>{
                        console.debug("Raw result",result);
                        const parsed_result:ResponseBody=JSON.parse(result);
                        getResultFromResponse(parsed_result);
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

    let highlighted_correction:Correction|undefined=$state(undefined);

    let report_region_content: HTMLDivElement;

    let formatted_report:string=$derived.by(
        ()=>{
            let formatted_report="";
            if(report!==undefined)
            {
                formatted_report=report;
                if(highlighted_correction!==undefined)
                {
                    formatted_report=report;
                    console.debug("Pre",formatted_report);
                    formatted_report=formatted_report.replaceAll(highlighted_correction.original_text,"<strong>" + highlighted_correction.original_text + "</strong>");
                    console.debug("Post",formatted_report);
                }   
            }

            formatted_report=formatted_report.replaceAll("\n","<br>");

            return formatted_report;
        }
    );

    $effect(
        ()=>{
            report_region_content.innerHTML=formatted_report;
        }
    )
</script>

<div class="outer">
        <button onclick={check_click}>Check</button>
        <div class="result_region">
            <div class="report_region" bind:this={report_region_content}>
            </div>
            <div class="corrections_region">            
                {#if query_result}
                    {#each query_result as correction}
                        <div tabindex="0" role="button" aria-label="correction" onmouseover={()=>{highlighted_correction=correction}} onfocus={()=>{}}>
                            {correction.explanation}
                            |
                            {correction.original_text}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
</div>

<style>
    .outer{
        display:flex;
        flex-direction: column;
    }
    .result_region{
        display:flex;
        width: 100%;
        flex-shrink: 1;
        flex-grow: 1;
        height: 100%;
    }
    .report_region{
        width: 50%;
    }
    .corrections_region{
        width: 50%;
        margin-left: 10px;
        display:flex;
        flex-direction:column;
        justify-content: space-evenly;
    }
</style>