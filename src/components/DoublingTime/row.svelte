<script lang="ts">
    export type RowProps={
		date:string|undefined,
        volume:number|undefined
    };

	let {
		datum=$bindable()
    }:{datum:RowProps}=$props();

    let diameters:[number|null,number|null,number|null]=$state([null,null,null]);
	let diameter_placeholders:[string,string,string]=$state(["Diameter 1","Diameter 2","Diameter 3"]);

    function update() {
		console.debug("Updating...");
		diameter_placeholders=["Diameter 1","Diameter 2","Diameter 3"];

		let num=0;
		let input_value_count=0;
				
		for(const val of diameters)
		{
			if(val && !Number.isNaN(val))
			{
				num+=val;
				input_value_count+=1;
			}
		}

		if(input_value_count<=0)
		{
			datum.volume=undefined;
			return;
		}
		else{
			let mean_d = num/input_value_count;
			let new_volume = Math.PI/6;

			for(const n in diameters)
			{
				let val = diameters[n];

				if(!val || Number.isNaN(val))
				{
					val=null;
					diameter_placeholders[n]=mean_d + " (calculated estimate)";
					new_volume*=mean_d;
				}
				else
				{
					new_volume*=val;
				}
			}

			datum.volume=new_volume;
			console.debug("Volume is now " + datum.volume);
		}
    }

	let volume_string=$state("");
	$effect(
		()=>{
			if(datum.volume!==undefined)
			{
				volume_string=datum.volume.toFixed(2);	
			}
			else
			{
				volume_string="";
			}
		}
	);
</script>

<tr class="centered">
    <td><input type="date" placeholder="Date of Exam" bind:value={datum.date}></td>
    <td><input type="number" step="any" placeholder={diameter_placeholders[0]} bind:value={diameters[0]} onchange={update}></td>
    <td><input type="number" step="any" placeholder={diameter_placeholders[1]} bind:value={diameters[1]} onchange={update}></td>
    <td><input type="number" step="any" placeholder={diameter_placeholders[2]} bind:value={diameters[2]} onchange={update}></td>
    <td style="vertical-align:middle">{volume_string}</td>
</tr>

<style>
    @import "../global.css";
</style>