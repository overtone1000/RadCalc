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