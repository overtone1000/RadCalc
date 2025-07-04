<script lang="ts">
    type Version={
        version:string,
        features:string[],
    }

    let versions:Version[]=
    [
        {
            version: "2.1",
            features: [
                '☑ Switch to Svelte',
                '☑ Bug fixes',
                '☑ DEXA Report Generator',
            ]
        },
        {
            version: "2.0",
            features: [
                '☑ Switch from bootstrap to <a href="https://simplecss.org/">simple.css</a>',
                '☑ Get rid of jquery dependency',
                '☑ Copy buttons for results'
            ]
        }
    ];

    let planned_roadmap_entries:string[]=
    [
        '☐ <a href="https://www.sciencedirect.com/science/article/pii/S0022522317327691?pes=vor&utm_source=rsna&getft_integrator=rsna">Use data requiring only height in adults that also provides risk estimate</a>',
        '☐ Volume calculator that detects three axis measurements in copied text and outputs the copied text with volumes added.',
        '☐ Volume calculator with ellipsoid, prostate, and spleen equations.',
        '☐ Data ingestion and substitution in doubling time',
        '☐ Multiple points for doubling time',
    ];

    let considering_roadmap_entries:string[]=
    [
        '☐ Add warnings when aortic diameter is at treatment thresholds (including for those with genetic aortopathies)',
        '☐ Add warnings about aortic diameter hinge points',
        '☐ DEXA Report Generator documentation',
    ];

    let deferring_roadmap_entires:string[]=
    [
        '☐ <a href="https://www.sciencedirect.com/science/article/abs/pii/000291498990430X?via%3Dihub">Use better data for aortic root (especially in children)</a>',
        '☐ Complete pediatric renal length calculator'
    ];
</script>

<div id="body_container" class="main fill_vertical fill_horizontal cols centered">
    <div class="flex_grow fill_horizontal rows">
        <div class="cols half_width left_padding height100percent">
            <h3>Version History</h3>
            {#each versions as version}
                <div class="flex_grow flex_shrink overflow">
                    <div class="rows version_row">
                        <div class="version_cell">{version.version}</div>
                        <div class="cols">
                            {#each version.features as feature}
                            <div>{@html feature}</div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
        <div class="cols half_width left_border left_padding height100percent">
            <h3>Roadmap</h3>
            <div class="flex_grow flex_shrink overflow">
                <h4>Planned</h4>
                <ul>
                    {#each planned_roadmap_entries as entry}
                        <li>{@html entry}</li>
                    {/each}
                </ul>
                <h4>Considering</h4>
                <ul>
                    {#each considering_roadmap_entries as entry}
                        <li>{@html entry}</li>
                    {/each}
                </ul>
                <h4>Deferring For Now</h4>
                <ul>
                    {#each deferring_roadmap_entires as entry}
                        <li>{@html entry}</li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>
    <div class="flex_shrink centered cols">
        <div>If you have a request or see something in the deferred list that you'd use, <a href="https://github.com/overtone1000">contact me</a>!</div>
    </div>
</div>

<style>
    @import "../global.css";
    @import "./version.css";
</style>