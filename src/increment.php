<?php
$counter_file = fopen("count.txt", "r+");

if(flock($counter_file, LOCK_EX))
{
	$counter = intval(fread($counter_file, filesize("count.txt")));
	$counter++;

	ftruncate($counter_file, 0);
	rewind($counter_file);
	fwrite($counter_file, $counter);
	fflush($counter_file);
	flock($counter_file, LOCK_UN);

	fclose($counter_file);
}
?>