<script lang="ts">
    function navigate (dest:string) {window.location.href=dest;}
</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <h1 id="header">
        RadCalc <a href="/version">v2.0</a>
    </h1>
    <div class="cols flex_grow">
        <button onclick={()=>navigate("/AscendingAorticDiameter")}>Ascending Aortic Diameter</button>
        <button onclick={()=>navigate("/Thymus_CSS_SII")}>Thymic CSS/SII</button>
        <button onclick={()=>navigate("/DoublingTime")}>Doubling Time</button>
        <button onclick={()=>navigate("/DEXA")}>DEXA Report Generator</button>
    </div>
    <div class="cols centered">
    <div>Prefer RadCalc v1? It's <a href="http://radcalcv1.overdesigned.org/">here</a>.</div>
    <div>This software is made available under the <a href="license"> MIT License</a>.</div>
        <div>Source code available on <a href="https://github.com/overtone1000/RadCalc"> GitHub</a>.</div>
    </div>
</div>

<style>
    @import "../global.css";
</style>