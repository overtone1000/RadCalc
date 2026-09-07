<script lang="ts">
    import type { MouseEventHandler } from "svelte/elements";
    import { json } from '@sveltejs/kit';
	import { onMount } from "svelte";
    import { agent_endpoint } from "../@commons/secrets";
	import { derived } from "svelte/store";

    const test_report=`
        Findings:
        Mediastinal contours are unremarkable. Lungs are clear. No fracture identified.

        Impression:
        Normal Exam
    `;

    const test_content=`[{"start": 0,"end": 20,"correction": "The **Findings** section lacks detail about incidental or clinically relevant abnormalities that should be included for completeness. For example: - **Incidental nodules/masses**: The report does not mention any incidental pulmonary nodules, mediastinal lymphadenopathy, or other minor findings that may require follow-up. - **Bone survey**: While no fractures are identified, a brief mention of the bony thoracic spine (e.g., No acute bony abnormalities ) would improve thoroughness. - **Soft tissues**: No comment on soft tissue structures (e.g., subcutaneous tissues, pleura) is provided, which could be relevant in some cases. **Suggested revision**: * Mediastinal contours are unremarkable. Lungs are clear without evidence of nodules or masses. No acute fractures or bony abnormalities are identified. Soft tissues and pleural spaces appear unremarkable. *"},{"start": 21,"end": 35,"correction": "The **Impression** section ( Normal Exam ) is overly simplistic and does not reflect the level of detail expected in a radiology report. While the findings are unremarkable, the impression should: - **Echo key negative findings** (e.g., no nodules, no fractures) to avoid ambiguity. - **Acknowledge limitations** (e.g., within the limitations of this study ). **Suggested revision**: * Normal chest radiograph. No evidence of fractures, pulmonary nodules, or mediastinal abnormalities. Lungs are clear, and soft tissues/pleural spaces are unremarkable within the limitations of this study. *"},{"start": 0,"end": 35,"correction": "**Grammatical/Syntactical Note**: - The phrase * No fracture identified * is awkward phrasing. **Correction**: * No fractures are identified * or * No acute fractures are seen. *"}]`;
    
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
        start:number,
        end:number,
        correction:string
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
        console.debug(content);

        query_result=JSON.parse(content);
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
                if(highlighted_correction===undefined){formatted_report=report;}
                else
                {
                    formatted_report=report.substring(0,highlighted_correction.start);
                    formatted_report+="<strong>";
                    formatted_report+=report.substring(highlighted_correction.start,highlighted_correction.end);
                    formatted_report+="</strong>";
                    formatted_report+=report.substring(highlighted_correction.end,report.length-1);
                }   
            }

            formatted_report.replaceAll("\n","<br>");
            console.debug("Doesn't seem to work?!");
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
                            {correction.correction}
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