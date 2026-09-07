<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    import { onMount } from "svelte";
    import { agent_endpoint } from "../@commons/secrets";
	import { derived } from "svelte/store";
    import * as z from "zod";

    const test_report=`
        Findings:
        Mediastinal contours are unremarkable. Lungs are clear. No fracture identified.

        Impression:
        Normal Exam
    `;

    const test_content=`
        [{"original_text":"Findings: Mediastinal contours are unremarkable. Lungs are clear. No fracture identified.","explanation":"The 'Findings' section mentions 'No fracture identified,' but this is not a typical radiologic finding to include in a standard chest X-ray report unless specifically requested or clinically relevant. If fractures were not the focus of the study, this statement is unnecessary and should be omitted or clarified."},{"original_text":"Findings: Lungs are clear.","explanation":"The 'Findings' section states 'Lungs are clear,' but the 'Impression' section states 'Normal Exam,' which is a more general conclusion. While 'Lungs are clear' is a valid finding, incidental or subtle abnormalities (e.g., small nodules, minor pleural changes) are not explicitly excluded. The discrepancy in specificity between the two sections may lead to missed incidental findings that require follow-up."},{"original_text":"Impression: Normal Exam","explanation":"The 'Impression' section does not explicitly address the 'Mediastinal contours are unremarkable' or 'Lungs are clear' findings from the 'Findings' section. While 'Normal Exam' is a valid conclusion, it should ideally reflect or summarize key findings from the 'Findings' section to ensure consistency and completeness."}]
    `;
    
    const test_result={
        "id": "cmpl-1788805430",
        "object": "chat.completion",
        "created": 1788805433,
        "model": "mistral-3-14B",
        "choices": [
            {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": test_content,
                "reasoning_content": null
            }
            }
        ],
        "functions": {
            "called_functions": [],
            "function_details": []
        },
        "retrieval": {
            "retrieved_data": []
        },
        "guardrails": {
            "triggered_guardrails": []
        },
        "usage": {
            "prompt_tokens": 371,
            "completion_tokens": 439,
            "total_tokens": 810
        }
    };

    type Correction={
        original_text:string
        explanation:string
    };

    type ResponseSchema=[Correction];

    type MinistrelResponseBody=
    {
        id:string,
        object:string,
        created:number,
        model:string,
        choices:[
            {
                index:number,
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
        },
        retrieval:{retrieved_data:[]},
        guardrails:{triggered_guardrails:[]},
        usage:{
            prompt_tokens:number,
            completion_tokens:number,
            total_tokens:number
        }
    };

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
                getResultFromResponse(test_result as MinistrelResponseBody);
            }
        }
    )

    function getResultFromResponse(response:MinistrelResponseBody)
    {
        if(response.choices.length>1)
        {
            console.debug("More results than expected!", response);
            console.debug(response.choices);
        }

        const content=response.choices[0].message.content;
        
        const empty_array_outer=["[]",""];
        const markdown_outer=["```json","```"];

        const cleans=[
            empty_array_outer,
            markdown_outer
        ];

        let cleaned_content=content.trim();

        let keep_cleaning=true;
        while(keep_cleaning)
        {
            keep_cleaning=false;
            for(const clean of cleans)
            {
                console.debug(clean);
                while(cleaned_content.startsWith(clean[0]) && cleaned_content.endsWith(clean[1]))
                {
                    console.debug("Cleaned.");
                    cleaned_content=cleaned_content.substring(clean[0].length,cleaned_content.length-clean[1].length);
                    console.debug("Cleaned.",cleaned_content);
                    keep_cleaning=true;
                }   
            }
        }

        try
        {
            query_result=JSON.parse(cleaned_content);
            console.debug("Stringified corrections for testing:",JSON.stringify(query_result));
        }
        catch(e)
        {
            console.debug("Couldn't parse.");
            console.debug(cleaned_content);
            console.error(e);
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
                        const parsed_result:MinistrelResponseBody=JSON.parse(result);
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