<script lang="ts">
	import { mdiContentCopy } from "@mdi/js";
	import Row, { type RowProps } from "./row.svelte";
	import { get_result, type Result } from "./Double";
    import Footer from "../@commons/footer.svelte";

    function copy() {
        if(result)
        {
            navigator.clipboard.writeText(result.plain);   
        }
    }

    let datum1:RowProps=$state({date:undefined,volume:undefined});
    let datum2:RowProps=$state({date:undefined,volume:undefined});

    let result:Result=$derived.by(
        ()=>{
            return get_result([datum1,datum2]);
        }
    );
</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <div class="cols flex_grow">
        <div class="cols centered">
            <table>
                <thead>
                <tr class="centered">
                    <th>Date of Exam</th>
                    <th>Diameter 1 (u)</th>
                    <th>Diameter 2 (u)</th>
                    <th>Diameter 3 (u)</th>
                    <th>Volume u<sup>3</sup></th>
                </tr>
                </thead>
                <tbody>
                <Row bind:datum={datum1}/>
                <Row bind:datum={datum2}/>
                </tbody>
            </table>
            <div class="cols doublingtext">
                <ul>
                <li>Measurements should be orthogonal.</li>
                <li>This calculator uses the ellipsoid formula for volume and is inaccurate for objects that do not have an approximately ellipsoid shape.</li>
                <li>Approximately 20% of lung cancers have a doubling time > 400 days.<sup>1,2</sup></li>
                </ul>
                <div class="cols">
                    {#if result}
                        <h4>Result</h4>
                        <div class="bottom_margin" id="CalculationResult">{@html result.html}</div>
                        <button aria-label="copy" class="iconbutton" id="copy-button" onclick={copy}>
                            <svg viewBox="0 0 24 24">
                                    <path class="iconsvg" d={mdiContentCopy}/>
                            </svg>
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <Footer sources={
        [
            {
            url: "https://pubmed.ncbi.nlm.nih.gov/11205667/",
            description: "Hasegawa M, Sone S, Takashima S, Li F, Yang ZG, Maruyama Y, Watanabe T. Growth rate of small lung cancers detected on mass CT screening. Br J Radiol. 2000 Dec;73(876):1252-9. doi: 10.1259/bjr.73.876.11205667. PMID: 11205667."
            },
            {
            url: "https://pubmed.ncbi.nlm.nih.gov/19250697/",
            description: "Honda O, Johkoh T, Sekiguchi J, Tomiyama N, Mihara N, Sumikawa H, Inoue A, Yanagawa M, Daimon T, Okumura M, Nakamura H. Doubling time of lung cancer determined using three-dimensional volumetric software: comparison of squamous cell carcinoma and adenocarcinoma. Lung Cancer. 2009 Nov;66(2):211-7. doi: 10.1016/j.lungcan.2009.01.018. Epub 2009 Feb 28. PMID: 19250697."
            }
        ]
    }/>
</div>

<style>
    @import "../global.css";

    tr.centered {
        align:center;
    }
</style>