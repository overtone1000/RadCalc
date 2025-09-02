<script lang="ts">
	import * as Plot from "@observablehq/plot";
	import type { DEXA_Ingest_Data } from "./ts/dexa/data_ingest";
	import type { DEXA_Mandatory_Manual_Data, HeightInInches } from "./ts/dexa/manual";
	import ManagedPlot from "./managed_plot.svelte";
	import { mdiRelativeScale } from "@mdi/js";

    type Props = {
        ingest:DEXA_Ingest_Data,
        mandatory:DEXA_Mandatory_Manual_Data
    }

    let props:Props=$props();

    type Datum = {date:Date,height:number,color:string};
    
    let try_get_datum = (height:HeightInInches, date:string|undefined, color:string) => {
        if(height.exists && height.height_in_inches !== null && date!==undefined)
        {
            let retval={
                date:new Date(date),
                height:height.height_in_inches,
                color
            };
            return retval;
        }
        else
        {
            return undefined;
        }
    }

    let data:Datum[]=$derived.by(
        ()=>{
            let tries =[
                try_get_datum(props.mandatory.height_in_inches, props.ingest.date, "green"),
                try_get_datum(props.mandatory.comparison.height_in_inches, props.mandatory.comparison.date, "blue")
            ];
            
            let retval = [];
            for(const attempt of tries)
            {
                if(attempt !== undefined)
                {
                    retval.push(attempt);   
                }
            }

            return retval;
        }
    );

    type MaxHeight = {
        left_date?:Date,
        right_date?:Date,
        height?:number,
        bottom_height?:number,
        top_height?:number,
        color:string
    }
    let maxheight:MaxHeight = $derived.by(
        ()=>{
            let retval:MaxHeight={
                color:"white"
            };


            if(props.mandatory.reported_tallest_height.feet!==null && props.mandatory.reported_tallest_height.inches !==null)
            {
                retval.height=props.mandatory.reported_tallest_height.feet*12+props.mandatory.reported_tallest_height.inches;
                retval.top_height=retval.height;
            }

            for(const datum of data)
            {
                if(retval.left_date === undefined || retval.left_date<datum.date){
                    retval.left_date=datum.date;
                }
                if(retval.right_date === undefined || retval.right_date>datum.date){
                    retval.right_date=datum.date;
                }
                if(retval.bottom_height === undefined || retval.bottom_height>datum.height)
                {
                    retval.bottom_height=datum.height;
                }
                if(retval.top_height === undefined || retval.top_height<datum.height)
                {
                    retval.top_height=datum.height;
                }
            }

            if(retval.bottom_height !== undefined && retval.height !== undefined)
            {
                if(retval.height<retval.bottom_height){retval.bottom_height=retval.height;}
            }

            return retval;
        }
    );   

    let plot = $derived(
        Plot.plot(
            {
                grid: true,
                inset: 0,
                height: 200,
                width: 100,
                //aspectRatio: 1,
                //color: {legend: true},
                marks: [
                    Plot.frame(),
                    Plot.rect([maxheight], {x1:"left_date",x2:"right_date",y1:"bottom_height", y2:"top_height",stroke:"color",fill:"red"}),
                    Plot.rect([maxheight], {x1:"left_date",x2:"right_date",y1:"bottom_height", y2:"height",stroke:"color",fill:"color"}),
                    Plot.dot(data, {x: "date", y: "height", stroke:"aqua",fill:"color"}),
                    //Plot.text(["hi"]),
                    //Plot.ruleX([0]),
                    //Plot.ruleY([0]),
                ]
            }
        )
    );
</script>

<div>
    <ManagedPlot plot={plot}/>
</div>

<style>
    
</style>