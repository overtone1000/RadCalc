import * as z from "zod";

export const ZodCorrection=z.object({
    index:z.uint32(),
    original_text:z.string(),
    corrected_text:z.string(),
    explanation:z.string()
});

export const ZodResponseSchema=z.array(ZodCorrection);

export type Correction=z.infer<typeof ZodCorrection>;
export type ResponseSchema=z.infer<typeof ZodResponseSchema>;

export type RequestContent=
[
    {
        index:number,
        text:string
    }
]

export type ResponseBody=
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