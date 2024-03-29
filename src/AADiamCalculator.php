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

	<script src="js/AA.js"></script>
	<link rel="stylesheet" href="rc.css">
  </head>
  <body>

	<!-- Main Container -->
	<div  class="container-fluid bg-dark text-white container-full">
	<div class="mb-3">
		Select input type:
		<form id="form_inputstyle"  onchange="SelectForm()">
		<input id="AgeBSARadio" checked="checked" name="inputstyle" type="radio" value="absa" class="radio_style"> Age and BSA <br>
		<input id="AgeHeightWeightRadio" name="inputstyle" type="radio" value="ahw" class="radio_style"> Age, Height, and Weight <br> 
		<input id="AgeDiameterRadio" name="inputstyle" type="radio" value="ahw" class="radio_style"> Age and Aortic Diameter <br> 
		<!-- <input id="AgeDiameterRadio" name="inputstyle" type="radio" value="ad" class="radio_style"> Age and Aortic Diameter <br> -->
		</form>
	</div>
		
	<div class="mt-3 mb-3">
		<form id="form_age" onchange="Update()">
		Age:
		<input id="Age" type="number" step="any" value="60"  class="tb_style"/> years<br><br>
		<input type="submit" disabled="true" style="display:none">
		</form>
		
		<div id="div_absa">
		<form id="form_absa" onchange="Update()">
		Body surface area:
		<input id="BSA_ABSA"  type="number" step="any" value="1.8" class="tb_style"/> m<sup>2</sup><br>
		<input type="submit" disabled="true" style="display:none">
		</form>
		</div>

		<div id="div_ahw">
		<form id="form_ahw" onchange="Update()">
		Height:
		<input id="height_AHW"  type="number" step="any" value="180" class="tb_style"/>
		<select id="height_units" value="cm">
			<option value="cm">cm</option>
			<option value="in">in</option>
		</select>
		<br><br>
		Weight:
		<input id="weight_AHW"  type="number" step="any" value="70" class="tb_style"/>
		<select id="weight_units" value="kg">
			<option value="kg">kg</option>
			<option value="lb">lb</option>
		</select>
		<br>
		<input type="submit" disabled="true" style="display:none">
		</form>
		</div>

		<div id="div_ad">
		<form id="form_ad" onchange="Update()">
		Ascending aortic diameter:
		<input id="aad_ad"  type="number" step="any" value="2.5" class="tb_style"/> cm<br>
		<input type="submit" disabled="true" style="display:none">
		</form>
		</div>
	</div>
		
	<div class="mb-3">
		<form id="form_sex"  onchange="Update()">
		<input id="SexMan" name="Sex" type="radio" value="man" class="radio_style"> Man <br>
		<input id="SexWoman" checked="checked" name="Sex" type="radio" value="woman" class="radio_style"> Woman <br> 
		</form>
	</div>
		
	<div class="mt-5 mb-3">
		<p id="CalculationResult"></p>
	</div>

	<div class="mt-5 mb-3" style="font-size:0.75rem">
		Sources:
		[1] P. Biaggi, F. Matthews, J. Braun, V. Rousson, P. A. Kaufmann, and R. Jenni, "Gender, Age, and Body Surface Area are the Major Determinants of Ascending Aorta Dimensions in Subjects With Apparently Normal Echocardiograms," Journal of the American Society of Echocardiography, vol. 22, no. 6, pp. 720-725, Jun. 2009.
	</div>
		
	<div class="mb-3" style="font-size:0.75rem">
		Disclaimer: All calculations should be confirmed by comparison to the referenced data. The author makes no claims of the accuracy or utility of the referenced data. This tool should not be used alone to guide patient care or as a substitute for clinical judgment. Reliance upon this tool is solely at the user's risk. The author assumes no liability or responsibility for damage or injury arising from any use of this tool.
	</div>
	</div>

	<?php include "increment.php" ?>
</body>