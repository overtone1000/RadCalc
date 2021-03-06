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

	<link rel="stylesheet" href="rc.css">
  </head>
  <body>

	<!-- Main Container -->
	<div class="container-fluid bg-dark fixed text-light container-full" margin="auto" id="body_container">

		<nav class="row navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-light d-flex justify-content-center " id="navbarMain">
			<a class="navbar-brand" href="index.html">RadCalc</a>
		</nav>

		<div class="row bg-dark">
			<div class="col d-flex justify-content-center mt-2"> <a class="btn btn-primary w-25" href="AADiamCalculator.php">Ascending Aortic Diameter</a> </div>
		</div>
		<!-- 
		<div class="row bg-dark">
			<div class="col d-flex justify-content-center mt-2"> <a class="btn btn-primary w-25" href="Pediatric_Renal_Length.php">Pediatric Renal Length</a> </div>
		</div>
		-->
		<div class="row bg-dark">
			<div class="col d-flex justify-content-center mt-2"> <a class="btn btn-primary w-25" href="Thymus_CSS_SII.php">Thymic CSS/SII</a> </div>
		</div>
		<div class="row bg-dark">
			<div class="col d-flex justify-content-center mt-2"> <a class="btn btn-primary w-25" href="DoublingTime.php">Doubling Time</a> </div>
		</div>
		<div class="col d-flex justify-content-center mt-2">
			<div class="mr-1">Source code and license information available on GitHub at </div><a class="inlined" href="https://github.com/overtone1000/RadCalc"> https://github.com/overtone1000/RadCalc</a>.
		</div>
	</div>
	<?php include "getcount.php" ?>
  </body>
</html>
