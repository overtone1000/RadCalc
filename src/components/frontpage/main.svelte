<script lang="ts">
    function navigate (dest:string) {window.location.href=dest;}
</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <h1 id="header">
        RadCalc <a href="/version">v2.3</a>
    </h1>
    <div class="cols flex_grow">
        <button onclick={()=>navigate("/AscendingAorticDiameter")}>Ascending Aortic Diameter</button>
        <button onclick={()=>navigate("/Thymus_CSS_SII")}>Thymic CSS/SII</button>
        <button onclick={()=>navigate("/DoublingTime")}>Doubling Time</button>
        <button onclick={()=>navigate("/DEXA")}>DEXA Report Generator</button>
        <div class="label">Experimental</div>
        <button onclick={()=>navigate("/ReportCheck")}>Report Checker</button>
        <button onclick={()=>navigate("/OCR")}>OCR</button>
    </div>
    <div class="cols centered">
    <div>This software is made available under the <a href="license"> MIT License</a>.</div>
        <div>Source code available on <a href="https://github.com/overtone1000/RadCalc"> GitHub</a>.</div>
    </div>
</div>

<style>
    @import "../global.css";
    .label{
        text-align: center;
        margin-top: 20px;
    }
</style>