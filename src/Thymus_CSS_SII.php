<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
     
	<title>RadCalc</title>
	
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
	<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

	<script src="js/Thymus.js"></script>
	<link rel="stylesheet" href="rc.css">
  </head>
  <body>

	<!-- Main Container -->
	<div  class="container-fluid bg-dark text-white container-full">
		<div id="div_form">
		<form id="form_intensities" onchange="Calculate()">
		Thymic Intensity on In-Phase:
		<input id="thymus_in"  type="number" step="any" value="1" class="tb_style"/><br><br>
		Thymic Intensity on Out-of-Phase:
		<input id="thymus_out"  type="number" step="any" value="1" class="tb_style"/><br><br>
		<br>
		Paraspinal Muscular Intensity on In-Phase:
		<input id="muscle_in"  type="number" step="any" value="1" class="tb_style"/><br><br>
		Paraspinal Muscular Intensity on Out-of-Phase:
		<input id="muscle_out"  type="number" step="any" value="1" class="tb_style"/><br><br>
		<input type="submit" disabled="true" style="display:none">
		</form>
		</div>
		
		<p id="CalculationResult"></p>

		<div class="mt-5 mb-3" style="font-size:0.75rem">
			Sources:
			[1] A. M. Priola et al., "Differentiation of Rebound and Lymphoid Thymic Hyperplasia from Anterior Mediastinal Tumors with Dual-Echo Chemical-Shift MR Imaging in Adulthood: Reliability of the Chemical-Shift Ratio and Signal Intensity Index," Radiology, vol. 274, no. 1, pp. 238-249, Aug. 2014.
		</div>
			
		<div class="mb-3" style="font-size:0.75rem">
			Disclaimer: All calculations should be confirmed by comparison to the referenced data. The author makes no claims of the accuracy or utility of the referenced data. This tool should not be used alone to guide patient care or as a substitute for clinical judgment. Reliance upon this tool is solely at the user's risk. The author assumes no liability or responsibility for damage or injury arising from any use of this tool.
		</div>
		</div>
	</div>
</body>