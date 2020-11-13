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
	<script src="https://momentjs.com/downloads/moment.js"></script>
	
	<script src="js/Double.js"></script>
	<link rel="stylesheet" href="rc.css">
  </head>
  <body>

	<!-- Main Container -->
	<div  class="container-fluid bg-dark text-white container-full">

	<div class="mt-5 mb-3">

<table class="table">
  <thead>
    <tr align="center">
		<th scope="col">Study</th>      
      <th scope="col">Date of Exam</th>
      <th scope="col">D<sub>1</sub> (u)</th>
      <th scope="col">D<sub>2</sub> (u)</th>
      <th scope="col">D<sub>3</sub> (u)</th>
      <th scope="col">Volume (Ellipsoid,  u<sup>3</sup>)</th>
    </tr>
  </thead>
  <tbody>
    <tr align="center">
      <th scope="row" style="vertical-align:middle">1</th>
      <td style="width: 18%"><input type="date" class="form-control" id="Date1" placeholder="Date of Exam"></td>
      <td style="width: 18%"><input type="number" step="any" class="form-control" id="D11" placeholder="Diameter 1"></td>
      <td style="width: 18%"><input type="number" step="any" class="form-control" id="D12" placeholder="Diameter 2"></td>
      <td style="width: 18%"><input type="number" step="any" class="form-control" id="D13" placeholder="Diameter 3"></td>
      <td style="width: 18%" id="V1" style="vertical-align:middle"></td>
    </tr>
    <tr align="center">
      <th scope="row" style="vertical-align:middle">2</th>
      <td style="width: 18%"><input type="date" class="form-control" id="Date2" placeholder="Date of Exam"></td>
      <td style="width: 18%"><input type="number" step="any" class="form-control" id="D21" placeholder="Diameter 1"></td>
      <td style="width: 18%"><input type="number" step="any" class="form-control" id="D22" placeholder="Diameter 2"></td>
      <td style="width: 18%"><input type="number" step="any" class="form-control" id="D23" placeholder="Diameter 3"></td>
      <td style="width: 18%" id="V2" style="vertical-align:middle"></td>
    </tr>
  </tbody>
</table>	
	

	</div>
		
	<div class="mt-5 mb-3" id="CalculationResult">
	</div>
	
	<div class="mb-3" style="font-size:0.75rem">
		Approximately 20% of lung cancers have a doubling time > 400 days.
	</div>
	
	<div class="mb-3" style="font-size:0.75rem">
		Disclaimer: All calculations should be confirmed by comparison to the referenced data. The author makes no claims of the accuracy or utility of the referenced data. This tool should not be used alone to guide patient care or as a substitute for clinical judgment. Reliance upon this tool is solely at the user's risk. The author assumes no liability or responsibility for damage or injury arising from any use of this tool.
	</div>
	</div>

	<?php include "increment.php" ?>
</body>